#!/usr/bin/env python3
"""
OAuth Search Console Testing
Tests OAuth connection status and sitemap submission after user consent
"""
import requests
import sys
import json
from datetime import datetime

class OAuthSearchConsoleTester:
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

    def test_oauth_status(self):
        """Test /api/seo/search-console/oauth/status endpoint"""
        print("\n🔍 Testing OAuth Status Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/seo/search-console/oauth/status", timeout=15)
            
            if response.status_code != 200:
                self.log_result(
                    "OAuth Status - Status Code",
                    False,
                    f"Expected 200, got {response.status_code}"
                )
                return False
            
            self.log_result("OAuth Status - Status Code", True, "200 OK")
            
            data = response.json()
            print(f"\n📋 OAuth Status Response:")
            print(json.dumps(data, indent=2))
            
            # Check connected field
            connected = data.get("connected")
            if connected is None:
                self.log_result(
                    "OAuth Status - Connected Field",
                    False,
                    "Missing 'connected' field in response"
                )
            elif connected == True:
                self.log_result(
                    "OAuth Status - Connected",
                    True,
                    "OAuth is connected (connected=true)"
                )
            else:
                self.log_result(
                    "OAuth Status - Connected",
                    False,
                    f"OAuth not connected (connected={connected})"
                )
            
            # Check status field
            status = data.get("status")
            if status == "ok":
                self.log_result(
                    "OAuth Status - Status OK",
                    True,
                    "Status is 'ok'"
                )
            elif status == "not_connected":
                self.log_result(
                    "OAuth Status - Not Connected",
                    False,
                    "OAuth not connected yet (status=not_connected)"
                )
            elif status == "oauth_client_missing":
                self.log_result(
                    "OAuth Status - Client Missing",
                    False,
                    "OAuth client not configured (status=oauth_client_missing)"
                )
            elif status == "oauth_error":
                self.log_result(
                    "OAuth Status - OAuth Error",
                    False,
                    f"OAuth error: {data.get('message', 'Unknown error')}"
                )
            else:
                self.log_result(
                    "OAuth Status - Status Field",
                    False,
                    f"Unexpected status: {status}"
                )
            
            # Check property_access
            if "property_access" in data:
                property_access = data["property_access"]
                print(f"\n📊 Property Access ({len(property_access)} properties):")
                for prop in property_access:
                    print(f"   - {prop.get('site_url')}: {prop.get('permission_level')} (verified: {prop.get('verified')})")
                
                if len(property_access) > 0:
                    self.log_result(
                        "OAuth Status - Property Access",
                        True,
                        f"{len(property_access)} properties accessible"
                    )
                else:
                    self.log_result(
                        "OAuth Status - Property Access",
                        False,
                        "No properties accessible"
                    )
            
            # Check mode
            if data.get("mode") == "oauth":
                self.log_result(
                    "OAuth Status - Mode",
                    True,
                    "Mode is 'oauth'"
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "OAuth Status - Request",
                False,
                f"Request failed: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_result(
                "OAuth Status - Parsing",
                False,
                f"Error parsing response: {str(e)}"
            )
            return False

    def test_oauth_submit(self):
        """Test /api/seo/search-console/oauth/submit endpoint"""
        print("\n🔍 Testing OAuth Submit Endpoint...")
        
        try:
            response = requests.post(f"{self.base_url}/api/seo/search-console/oauth/submit", timeout=30)
            
            if response.status_code != 200:
                self.log_result(
                    "OAuth Submit - Status Code",
                    False,
                    f"Expected 200, got {response.status_code}"
                )
                return False
            
            self.log_result("OAuth Submit - Status Code", True, "200 OK")
            
            data = response.json()
            print(f"\n📋 OAuth Submit Response:")
            print(json.dumps(data, indent=2))
            
            # Check status field
            status = data.get("status")
            
            if status == "ok":
                self.log_result(
                    "OAuth Submit - Full Success",
                    True,
                    "All sitemaps submitted successfully"
                )
            elif status == "partial":
                self.log_result(
                    "OAuth Submit - Partial Success",
                    True,
                    "Some sitemaps submitted, some failed (expected)"
                )
            elif status == "not_connected":
                self.log_result(
                    "OAuth Submit - Not Connected",
                    False,
                    "OAuth not connected, cannot submit"
                )
                return False
            elif status == "oauth_client_missing":
                self.log_result(
                    "OAuth Submit - Client Missing",
                    False,
                    "OAuth client not configured"
                )
                return False
            else:
                self.log_result(
                    "OAuth Submit - Status",
                    False,
                    f"Unexpected status: {status}"
                )
            
            # Check submitted list
            if "submitted" in data:
                submitted = data["submitted"]
                print(f"\n📊 Submission Results ({len(submitted)} sitemaps):")
                
                successful = []
                errors = []
                skipped = []
                
                for item in submitted:
                    site_url = item.get("site_url")
                    sitemap_url = item.get("sitemap_url")
                    item_status = item.get("status")
                    message = item.get("message", "")
                    
                    if item_status == "submitted":
                        successful.append(sitemap_url)
                        print(f"   ✅ {sitemap_url}")
                    elif item_status == "error":
                        errors.append({"sitemap": sitemap_url, "message": message})
                        print(f"   ❌ {sitemap_url}: {message}")
                    elif item_status == "skipped":
                        skipped.append({"sitemap": sitemap_url, "message": message})
                        print(f"   ⏭️  {sitemap_url}: {message}")
                
                print(f"\n📈 Summary:")
                print(f"   Successful: {len(successful)}")
                print(f"   Errors: {len(errors)}")
                print(f"   Skipped: {len(skipped)}")
                
                # Verify expected results based on main agent's observation
                # lovanet.fr: should be successful
                # animemomentsofficiel.fr: should have 403 permission error
                # animeofficiel.fr: should be skipped (no accessible property)
                
                lovanet_sitemaps = [s for s in successful if "lovanet.fr" in s]
                if len(lovanet_sitemaps) > 0:
                    self.log_result(
                        "OAuth Submit - Lovanet.fr Success",
                        True,
                        f"{len(lovanet_sitemaps)} lovanet.fr sitemaps submitted"
                    )
                else:
                    self.log_result(
                        "OAuth Submit - Lovanet.fr Success",
                        False,
                        "No lovanet.fr sitemaps submitted"
                    )
                
                # Check for animemomentsofficiel.fr errors (403 permission)
                animemoments_errors = [e for e in errors if "animemomentsofficiel.fr" in e["sitemap"]]
                if len(animemoments_errors) > 0:
                    has_403 = any("403" in e["message"] or "permission" in e["message"].lower() for e in animemoments_errors)
                    if has_403:
                        self.log_result(
                            "OAuth Submit - AnimeMoments 403 Error",
                            True,
                            f"AnimeMoments returns 403 permission error (expected)"
                        )
                    else:
                        self.log_result(
                            "OAuth Submit - AnimeMoments Error Type",
                            False,
                            f"AnimeMoments has errors but not 403: {animemoments_errors}"
                        )
                
                # Check for animeofficiel.fr skipped
                animeofficiel_skipped = [s for s in skipped if "animeofficiel.fr" in s["sitemap"]]
                if len(animeofficiel_skipped) > 0:
                    self.log_result(
                        "OAuth Submit - AnimeOfficiel Skipped",
                        True,
                        f"AnimeOfficiel skipped (no accessible property, expected)"
                    )
                
                if len(submitted) > 0:
                    self.log_result(
                        "OAuth Submit - Submitted List",
                        True,
                        f"{len(submitted)} sitemaps processed"
                    )
                else:
                    self.log_result(
                        "OAuth Submit - Submitted List",
                        False,
                        "No sitemaps in submitted list"
                    )
            else:
                self.log_result(
                    "OAuth Submit - Submitted Field",
                    False,
                    "Missing 'submitted' field in response"
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "OAuth Submit - Request",
                False,
                f"Request failed: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_result(
                "OAuth Submit - Parsing",
                False,
                f"Error parsing response: {str(e)}"
            )
            return False

    def run_all_tests(self):
        """Run all OAuth tests"""
        print("=" * 70)
        print("OAuth Search Console Testing")
        print("=" * 70)
        
        self.test_oauth_status()
        self.test_oauth_submit()
        
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
    tester = OAuthSearchConsoleTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
