#!/usr/bin/env python3
"""Backend SEO endpoints test for Lovanet"""
import requests
import sys

BASE_URL = "https://actualites-hub.preview.emergentagent.com"

class BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0

    def test(self, name, url, expected_status=200, check_fn=None):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        try:
            response = requests.get(url, timeout=15)
            if response.status_code != expected_status:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                return False
            
            if check_fn:
                data = response.json() if 'application/json' in response.headers.get('content-type', '') else response.text
                if not check_fn(data):
                    print(f"❌ Failed - Check function returned False")
                    return False
            
            self.tests_passed += 1
            print(f"✅ Passed - Status: {response.status_code}")
            return True
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

def main():
    tester = BackendTester()
    
    # Test backend SEO endpoints
    print("=" * 60)
    print("BACKEND SEO ENDPOINTS")
    print("=" * 60)
    
    tester.test(
        "GET /api/seo/export",
        f"{BASE_URL}/api/seo/export",
        check_fn=lambda d: (
            d.get('status') == 'ok' and
            'counts' in d and
            d['counts'].get('pages', 0) > 0 and
            d['counts'].get('products', 0) > 0 and
            d['counts'].get('videos', 0) > 0 and
            d['counts'].get('news', 0) > 0
        )
    )
    
    tester.test(
        "GET /api/seo/search-console/status",
        f"{BASE_URL}/api/seo/search-console/status",
        check_fn=lambda d: (
            d.get('status') == 'credentials_required' and
            'sitemaps_ready' in d and
            len(d['sitemaps_ready']) > 0
        )
    )
    
    # Test public SEO files
    print("\n" + "=" * 60)
    print("PUBLIC SEO FILES")
    print("=" * 60)
    
    files = [
        "robots.txt",
        "sitemap.xml",
        "sitemap-pages.xml",
        "sitemap-images.xml",
        "sitemap-videos.xml",
        "sitemap-products.xml",
        "sitemap-news.xml",
        "sitemap-books.xml",
        "rss.xml",
        "atom.xml",
        "seo-backup.json",
        "structured-data.json",
        "lovanet-logo-custom.svg",
        "lovanet-og.svg",
    ]
    
    for file in files:
        tester.test(f"GET /{file}", f"{BASE_URL}/{file}")
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("=" * 60)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
