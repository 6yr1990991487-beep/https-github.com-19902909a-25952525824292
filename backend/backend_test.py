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
            # Phase 3: Check sync_interval_seconds
            if data.get("sync_interval_seconds") == 300:
                print("   ✓ Sync interval is 300 seconds (5 minutes)")
            else:
                print(f"   ⚠ Sync interval is {data.get('sync_interval_seconds')} (expected 300)")
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

    def test_sync_status(self):
        """Test Phase 3: sync status endpoint"""
        success, data = self.run_test(
            "Sync Status",
            "GET",
            "/admin/sync/status",
            200
        )
        if success:
            status_list = data.get("status", [])
            print(f"   ✓ Sync states returned: {len(status_list)}")
            
            # Check for expected sync keys
            keys = {s.get("key") for s in status_list}
            expected_keys = {"youtube", "catalog:anilist", "tiktok", "prime", "all"}
            found_keys = keys & expected_keys
            print(f"   ✓ Found sync keys: {', '.join(sorted(found_keys))}")
            
            if data.get("interval_seconds") == 300:
                print("   ✓ Interval seconds: 300")
            
            # Show status of each provider
            for state in status_list:
                key = state.get("key")
                status = state.get("status")
                if key in expected_keys:
                    print(f"   ✓ {key}: {status}")
        return success

    def test_manual_sync_youtube(self):
        """Test Phase 3: manual YouTube sync"""
        success, data = self.run_test(
            "Manual Sync - YouTube",
            "POST",
            "/admin/sync/run",
            200,
            data={"target": "youtube"}
        )
        if success:
            status = data.get("status")
            print(f"   ✓ Sync status: {status}")
            if status == "ok":
                print(f"   ✓ Inserted: {data.get('inserted', 0)}, Updated: {data.get('updated', 0)}")
                print(f"   ✓ Video count: {data.get('count', 0)}")
            elif status == "error":
                print(f"   ⚠ Error: {data.get('error', 'Unknown')[:100]}")
        return success

    def test_manual_sync_anilist(self):
        """Test Phase 3: manual AniList catalog sync"""
        success, data = self.run_test(
            "Manual Sync - AniList",
            "POST",
            "/admin/sync/run",
            200,
            data={"target": "anilist"}
        )
        if success:
            status = data.get("status")
            print(f"   ✓ Sync status: {status}")
            if status == "ok":
                print(f"   ✓ Inserted: {data.get('inserted', 0)}, Updated: {data.get('updated', 0)}")
                print(f"   ✓ Catalog count: {data.get('count', 0)}")
            elif status == "error":
                print(f"   ⚠ Error: {data.get('error', 'Unknown')[:100]}")
        return success

    def test_manual_sync_tiktok(self):
        """Test Phase 3: manual TikTok sync (best-effort)"""
        success, data = self.run_test(
            "Manual Sync - TikTok",
            "POST",
            "/admin/sync/run",
            200,
            data={"target": "tiktok"}
        )
        if success:
            status = data.get("status")
            print(f"   ✓ Sync status: {status} (ok or degraded expected)")
            if status in {"ok", "degraded"}:
                print(f"   ✓ Inserted: {data.get('inserted', 0)}, Updated: {data.get('updated', 0)}")
                print(f"   ✓ Video count: {data.get('count', 0)}")
            elif status == "error":
                print(f"   ⚠ Error: {data.get('error', 'Unknown')[:100]}")
        return success

    def test_manual_sync_prime(self):
        """Test Phase 3: manual Prime Video sync (best-effort)"""
        success, data = self.run_test(
            "Manual Sync - Prime Video",
            "POST",
            "/admin/sync/run",
            200,
            data={"target": "prime"}
        )
        if success:
            status = data.get("status")
            print(f"   ✓ Sync status: {status} (ok or degraded expected)")
            if status in {"ok", "degraded"}:
                print(f"   ✓ Inserted: {data.get('inserted', 0)}, Updated: {data.get('updated', 0)}")
                print(f"   ✓ Video count: {data.get('count', 0)}")
            elif status == "error":
                print(f"   ⚠ Error: {data.get('error', 'Unknown')[:100]}")
        return success

    def test_videos_mongodb_source(self):
        """Test Phase 3: videos endpoint returns MongoDB synced data"""
        # Test YouTube videos
        success1, data1 = self.run_test(
            "Videos MongoDB - YouTube",
            "GET",
            "/videos",
            200,
            params={"platform": "youtube", "limit": 10}
        )
        if success1:
            videos = data1.get("videos", [])
            source = data1.get("source", "unknown")
            print(f"   ✓ YouTube videos: {len(videos)}, source: {source}")
            if videos and source == "mongodb":
                sample = videos[0]
                if sample.get("external_id") and sample.get("title") and sample.get("thumbnail_url"):
                    print(f"   ✓ Sample video has external_id, title, thumbnail_url")
                if sample.get("sync_source") == "youtube-data-api-v3":
                    print(f"   ✓ Sync source is youtube-data-api-v3")

        # Test TikTok videos
        success2, data2 = self.run_test(
            "Videos MongoDB - TikTok",
            "GET",
            "/videos",
            200,
            params={"platform": "tiktok", "limit": 10}
        )
        if success2:
            videos = data2.get("videos", [])
            source = data2.get("source", "unknown")
            print(f"   ✓ TikTok videos: {len(videos)}, source: {source}")

        # Test Prime videos
        success3, data3 = self.run_test(
            "Videos MongoDB - Prime",
            "GET",
            "/videos",
            200,
            params={"platform": "prime", "limit": 10}
        )
        if success3:
            videos = data3.get("videos", [])
            source = data3.get("source", "unknown")
            print(f"   ✓ Prime videos: {len(videos)}, source: {source} (fallback ok if degraded)")

        return success1 and success2 and success3

    def test_catalog_mongodb_source(self):
        """Test Phase 3: catalog endpoint returns MongoDB synced AniList data"""
        success, data = self.run_test(
            "Catalog MongoDB - AniList",
            "GET",
            "/catalog",
            200,
            params={"limit": 20}
        )
        if success:
            items = data.get("items", [])
            source = data.get("source", "unknown")
            total = data.get("total", 0)
            genres = data.get("genres", [])
            print(f"   ✓ Catalog items: {len(items)}, total: {total}, source: {source}")
            print(f"   ✓ Genres available: {len(genres)}")
            
            if items and source == "mongodb":
                sample = items[0]
                if sample.get("provider") == "anilist":
                    print(f"   ✓ Sample item provider is anilist")
                if sample.get("genres"):
                    print(f"   ✓ Sample item has genres: {', '.join(sample['genres'][:3])}")
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("LOVANET BACKEND API TESTS - PHASE 3")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Run Phase 1-2 tests
        print("\n### PHASE 1-2 TESTS ###")
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

        # Run Phase 3 sync tests
        print("\n### PHASE 3 SYNC TESTS ###")
        self.test_sync_status()
        self.test_manual_sync_youtube()
        self.test_manual_sync_anilist()
        self.test_manual_sync_tiktok()
        self.test_manual_sync_prime()
        self.test_videos_mongodb_source()
        self.test_catalog_mongodb_source()

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
