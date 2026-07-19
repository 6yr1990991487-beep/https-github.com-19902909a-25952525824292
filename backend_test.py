#!/usr/bin/env python3
"""
Backend API Testing for Multi-Domain SEO Implementation
Tests SEO export, Search Console status, and sitemap submission endpoints
"""
import requests
import sys
import json
from datetime import datetime

class MultiDomainSEOTester:
    def __init__(self, base_url="https://actualites-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, passed, message="", details=None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ PASS: {test_name}")
            if message:
                print(f"   {message}")
        else:
            print(f"❌ FAIL: {test_name}")
            print(f"   {message}")
        
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "details": details
        })

    def test_seo_export_endpoint(self):
        """Test /api/seo/export endpoint for multi-domain support"""
        print("\n🔍 Testing SEO Export Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/seo/export", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "SEO Export - Status Code",
                    False,
                    f"Expected 200, got {response.status_code}"
                )
                return False
            
            self.log_result("SEO Export - Status Code", True, "200 OK")
            
            data = response.json()
            
            # Check for alternate_domains field
            if "alternate_domains" not in data:
                self.log_result(
                    "SEO Export - Alternate Domains Field",
                    False,
                    "Missing 'alternate_domains' field in response"
                )
            else:
                alternate_domains = data["alternate_domains"]
                expected_domains = ["https://animemomentsofficiel.fr", "https://animeofficiel.fr"]
                
                if not isinstance(alternate_domains, list):
                    self.log_result(
                        "SEO Export - Alternate Domains Type",
                        False,
                        f"Expected list, got {type(alternate_domains)}"
                    )
                elif len(alternate_domains) != 2:
                    self.log_result(
                        "SEO Export - Alternate Domains Count",
                        False,
                        f"Expected 2 domains, got {len(alternate_domains)}: {alternate_domains}"
                    )
                elif set(alternate_domains) != set(expected_domains):
                    self.log_result(
                        "SEO Export - Alternate Domains Content",
                        False,
                        f"Expected {expected_domains}, got {alternate_domains}"
                    )
                else:
                    self.log_result(
                        "SEO Export - Alternate Domains",
                        True,
                        f"Both domains present: {alternate_domains}"
                    )
            
            # Check for catalogCount
            counts = data.get("counts", {})
            if "catalogCount" not in counts:
                self.log_result(
                    "SEO Export - Catalog Count",
                    False,
                    "Missing 'catalogCount' in counts"
                )
            else:
                catalog_count = counts["catalogCount"]
                # Expected around 1500 items
                if catalog_count < 1400 or catalog_count > 1600:
                    self.log_result(
                        "SEO Export - Catalog Count Value",
                        False,
                        f"Expected ~1500 items, got {catalog_count}"
                    )
                else:
                    self.log_result(
                        "SEO Export - Catalog Count",
                        True,
                        f"Catalog count: {catalog_count} items"
                    )
            
            # Check primary domain
            if data.get("primary_domain") != "https://lovanet.fr":
                self.log_result(
                    "SEO Export - Primary Domain",
                    False,
                    f"Expected https://lovanet.fr, got {data.get('primary_domain')}"
                )
            else:
                self.log_result(
                    "SEO Export - Primary Domain",
                    True,
                    "Primary domain correct"
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "SEO Export - Request",
                False,
                f"Request failed: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_result(
                "SEO Export - Parsing",
                False,
                f"Error parsing response: {str(e)}"
            )
            return False

    def test_search_console_status(self):
        """Test /api/seo/search-console/status endpoint"""
        print("\n🔍 Testing Search Console Status Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/seo/search-console/status", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Search Console Status - Status Code",
                    False,
                    f"Expected 200, got {response.status_code}"
                )
                return False
            
            self.log_result("Search Console Status - Status Code", True, "200 OK")
            
            data = response.json()
            
            # Check properties list
            if "properties" not in data:
                self.log_result(
                    "Search Console Status - Properties Field",
                    False,
                    "Missing 'properties' field"
                )
            else:
                properties = data["properties"]
                expected_properties = [
                    "https://lovanet.fr/",
                    "https://animemomentsofficiel.fr/",
                    "https://animeofficiel.fr/"
                ]
                
                if not isinstance(properties, list):
                    self.log_result(
                        "Search Console Status - Properties Type",
                        False,
                        f"Expected list, got {type(properties)}"
                    )
                elif len(properties) != 3:
                    self.log_result(
                        "Search Console Status - Properties Count",
                        False,
                        f"Expected 3 properties, got {len(properties)}: {properties}"
                    )
                elif set(properties) != set(expected_properties):
                    self.log_result(
                        "Search Console Status - Properties Content",
                        False,
                        f"Expected {expected_properties}, got {properties}"
                    )
                else:
                    self.log_result(
                        "Search Console Status - Properties",
                        True,
                        f"All 3 properties present: {properties}"
                    )
            
            # Check sitemaps_ready list
            if "sitemaps_ready" not in data:
                self.log_result(
                    "Search Console Status - Sitemaps Field",
                    False,
                    "Missing 'sitemaps_ready' field"
                )
            else:
                sitemaps = data["sitemaps_ready"]
                
                # Check for alternate domain sitemaps
                alternate_sitemaps = [
                    "https://animemomentsofficiel.fr/sitemap-animemomentsofficiel-fr.xml",
                    "https://animemomentsofficiel.fr/sitemap-catalog-animemomentsofficiel-fr.xml",
                    "https://animeofficiel.fr/sitemap-animeofficiel-fr.xml",
                    "https://animeofficiel.fr/sitemap-catalog-animeofficiel-fr.xml"
                ]
                
                missing_sitemaps = [s for s in alternate_sitemaps if s not in sitemaps]
                
                if missing_sitemaps:
                    self.log_result(
                        "Search Console Status - Alternate Domain Sitemaps",
                        False,
                        f"Missing sitemaps: {missing_sitemaps}"
                    )
                else:
                    self.log_result(
                        "Search Console Status - Alternate Domain Sitemaps",
                        True,
                        f"All alternate domain sitemaps present ({len(sitemaps)} total)"
                    )
            
            # Check status field (should be credentials_missing or api_access_not_configured)
            status = data.get("status")
            if status in ["credentials_missing", "api_access_not_configured"]:
                self.log_result(
                    "Search Console Status - Expected Blocked State",
                    True,
                    f"Status: {status} (expected, API not activated)"
                )
            elif status == "ok":
                self.log_result(
                    "Search Console Status - API Active",
                    True,
                    "Search Console API is active and working"
                )
            else:
                self.log_result(
                    "Search Console Status - Status Field",
                    False,
                    f"Unexpected status: {status}"
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Search Console Status - Request",
                False,
                f"Request failed: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_result(
                "Search Console Status - Parsing",
                False,
                f"Error parsing response: {str(e)}"
            )
            return False

    def test_search_console_submit(self):
        """Test /api/seo/search-console/submit endpoint"""
        print("\n🔍 Testing Search Console Submit Endpoint...")
        
        try:
            response = requests.post(f"{self.base_url}/api/seo/search-console/submit", timeout=15)
            
            if response.status_code != 200:
                self.log_result(
                    "Search Console Submit - Status Code",
                    False,
                    f"Expected 200, got {response.status_code}"
                )
                return False
            
            self.log_result("Search Console Submit - Status Code", True, "200 OK")
            
            data = response.json()
            
            # Check status - should be api_access_not_configured or ok
            status = data.get("status")
            
            if status == "api_access_not_configured":
                self.log_result(
                    "Search Console Submit - Expected Blocked State",
                    True,
                    "API access not configured (expected behavior)"
                )
                
                # Verify it returns proper error structure
                if "message" in data and "activation_url" in data.get("service_account", {}):
                    self.log_result(
                        "Search Console Submit - Error Structure",
                        True,
                        "Proper error message and activation URL provided"
                    )
                else:
                    self.log_result(
                        "Search Console Submit - Error Structure",
                        False,
                        "Missing error message or activation URL"
                    )
                    
            elif status == "ok":
                self.log_result(
                    "Search Console Submit - Submission Success",
                    True,
                    "Sitemaps submitted successfully"
                )
                
                # Check submitted list
                if "submitted" in data:
                    submitted = data["submitted"]
                    self.log_result(
                        "Search Console Submit - Submitted List",
                        True,
                        f"{len(submitted)} sitemaps processed"
                    )
                    
            elif status == "credentials_missing":
                self.log_result(
                    "Search Console Submit - Credentials Missing",
                    True,
                    "Credentials missing (expected if not configured)"
                )
            else:
                self.log_result(
                    "Search Console Submit - Status",
                    False,
                    f"Unexpected status: {status}"
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Search Console Submit - Request",
                False,
                f"Request failed: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_result(
                "Search Console Submit - Parsing",
                False,
                f"Error parsing response: {str(e)}"
            )
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 70)
        print("Multi-Domain SEO Backend API Testing")
        print("=" * 70)
        
        self.test_seo_export_endpoint()
        self.test_search_console_status()
        self.test_search_console_submit()
        
        print("\n" + "=" * 70)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print("=" * 70)
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} test(s) failed")
            return 1

def main():
    tester = MultiDomainSEOTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
