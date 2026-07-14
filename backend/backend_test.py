#!/usr/bin/env python3
"""
Backend API testing for Lovanet replica
Tests all endpoints defined in the review request
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://lovanet-replica.preview.emergentagent.com/api"

class LovanetAPITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                print(f"❌ Failed - Unsupported method {method}")
                self.failed_tests.append({"test": name, "error": f"Unsupported method {method}"})
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append({"test": name, "error": "Timeout"})
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({"test": name, "error": str(e)})
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        success, data = self.run_test(
            "Health Check",
            "GET",
            "/health",
            200
        )
        if success and data.get("status") == "ok":
            print("   ✓ Health status is ok")
        return success

    def test_site(self):
        """Test site metadata endpoint"""
        success, data = self.run_test(
            "Site Metadata",
            "GET",
            "/site",
            200
        )
        if success:
            if data.get("meta"):
                print("   ✓ Site meta present")
            if data.get("nav"):
                print(f"   ✓ Navigation routes: {len(data.get('nav', []))}")
            if data.get("aliases"):
                print(f"   ✓ Route aliases: {len(data.get('aliases', {}))}")
        return success

    def test_products(self):
        """Test products endpoint with various filters"""
        # Test basic products
        success1, data1 = self.run_test(
            "Products - All",
            "GET",
            "/products",
            200,
            params={"limit": 72}
        )
        if success1:
            print(f"   ✓ Products returned: {len(data1.get('products', []))}")

        # Test category filter
        success2, data2 = self.run_test(
            "Products - Category Filter",
            "GET",
            "/products",
            200,
            params={"category": "poster", "limit": 20}
        )
        if success2:
            print(f"   ✓ Poster products: {len(data2.get('products', []))}")

        # Test search
        success3, data3 = self.run_test(
            "Products - Search",
            "GET",
            "/products",
            200,
            params={"q": "anime", "limit": 20}
        )
        if success3:
            print(f"   ✓ Search results: {len(data3.get('products', []))}")

        return success1 and success2 and success3

    def test_videos(self):
        """Test videos endpoint with platform filters"""
        # Test all videos
        success1, data1 = self.run_test(
            "Videos - All",
            "GET",
            "/videos",
            200,
            params={"limit": 24}
        )
        if success1:
            print(f"   ✓ Videos returned: {len(data1.get('videos', []))}")

        # Test YouTube filter
        success2, data2 = self.run_test(
            "Videos - YouTube",
            "GET",
            "/videos",
            200,
            params={"platform": "youtube", "limit": 24}
        )
        if success2:
            print(f"   ✓ YouTube videos: {len(data2.get('videos', []))}")

        # Test TikTok filter
        success3, data3 = self.run_test(
            "Videos - TikTok",
            "GET",
            "/videos",
            200,
            params={"platform": "tiktok", "limit": 24}
        )
        if success3:
            print(f"   ✓ TikTok videos: {len(data3.get('videos', []))}")

        # Test Prime filter
        success4, data4 = self.run_test(
            "Videos - Prime",
            "GET",
            "/videos",
            200,
            params={"platform": "prime", "limit": 24}
        )
        if success4:
            print(f"   ✓ Prime videos: {len(data4.get('videos', []))}")

        return success1 and success2 and success3 and success4

    def test_catalog(self):
        """Test anime catalog endpoint"""
        # Test basic catalog
        success1, data1 = self.run_test(
            "Catalog - All",
            "GET",
            "/catalog",
            200,
            params={"limit": 48}
        )
        if success1:
            print(f"   ✓ Catalog items: {len(data1.get('items', []))}")
            print(f"   ✓ Total items: {data1.get('total', 0)}")
            print(f"   ✓ Genres available: {len(data1.get('genres', []))}")

        # Test search
        success2, data2 = self.run_test(
            "Catalog - Search",
            "GET",
            "/catalog",
            200,
            params={"q": "attack", "limit": 20}
        )
        if success2:
            print(f"   ✓ Search results: {len(data2.get('items', []))}")

        # Test genre filter (if genres available)
        if success1 and data1.get('genres'):
            genre = data1['genres'][0] if data1['genres'] else None
            if genre:
                success3, data3 = self.run_test(
                    "Catalog - Genre Filter",
                    "GET",
                    "/catalog",
                    200,
                    params={"genre": genre, "limit": 20}
                )
                if success3:
                    print(f"   ✓ Genre '{genre}' results: {len(data3.get('items', []))}")
                return success1 and success2 and success3

        return success1 and success2

    def test_countdowns(self):
        """Test countdowns endpoint"""
        success, data = self.run_test(
            "Countdowns",
            "GET",
            "/countdowns",
            200
        )
        if success:
            print(f"   ✓ Countdowns: {len(data.get('countdowns', []))}")
        return success

    def test_pages(self):
        """Test pages endpoint"""
        success, data = self.run_test(
            "Pages",
            "GET",
            "/pages",
            200
        )
        if success:
            print(f"   ✓ Pages detected: {len(data.get('pages', []))}")
        return success

    def test_redirects(self):
        """Test redirects endpoint"""
        success, data = self.run_test(
            "Redirects",
            "GET",
            "/redirects",
            200
        )
        if success:
            print(f"   ✓ Aliases: {len(data.get('aliases', {}))}")
            print(f"   ✓ Redirects: {len(data.get('redirects', []))}")
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Contact",
            "message": "This is a test message from backend_test.py"
        }
        success, data = self.run_test(
            "Contact Form Submission",
            "POST",
            "/forms/contact",
            200,
            data=test_data
        )
        if success:
            if data.get("status") == "success":
                print("   ✓ Form submission successful")
            if data.get("submission"):
                print(f"   ✓ Submission ID: {data['submission'].get('id', 'N/A')}")
        return success

    def test_order_creation(self):
        """Test order creation"""
        test_order = {
            "name": "Test Customer",
            "email": "customer@example.com",
            "items": [
                {
                    "id": "am-001",
                    "name": "Test Product",
                    "price": 24.0,
                    "qty": 2
                }
            ],
            "note": "Test order from backend_test.py"
        }
        success, data = self.run_test(
            "Order Creation",
            "POST",
            "/orders",
            200,
            data=test_order
        )
        if success:
            if data.get("status") == "success":
                print("   ✓ Order creation successful")
            if data.get("order"):
                print(f"   ✓ Order ID: {data['order'].get('id', 'N/A')}")
                print(f"   ✓ Order total: {data['order'].get('total', 0)}")
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("LOVANET BACKEND API TESTS")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Run all tests
        self.test_health()
        self.test_site()
        self.test_products()
        self.test_videos()
        self.test_catalog()
        self.test_countdowns()
        self.test_pages()
        self.test_redirects()
        self.test_contact_form()
        self.test_order_creation()

        # Print summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure.get('test')}: {failure.get('error', 'Status mismatch')}")
        
        print("=" * 60)
        
        return 0 if self.tests_passed == self.tests_run else 1


def main():
    tester = LovanetAPITester()
    return tester.run_all_tests()


if __name__ == "__main__":
    sys.exit(main())
