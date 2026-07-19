# Google Search Console setup for Lovanet

The SEO files are generated and ready to submit, but Google Search Console API submission requires credentials.

Required from the site owner:

1. Verify both properties in Google Search Console:
   - `https://lovanet.fr/`
   - `https://animemomentsofficiel.fr/`

2. Provide one of these:
   - OAuth 2.0 client credentials + consent access for Search Console scopes, or
   - Service account JSON that has been added as an owner/user in Search Console.

Required scope:

```text
https://www.googleapis.com/auth/webmasters
```

Sitemaps ready to submit:

```text
https://lovanet.fr/sitemap.xml
https://lovanet.fr/sitemap-pages.xml
https://lovanet.fr/sitemap-images.xml
https://lovanet.fr/sitemap-videos.xml
https://lovanet.fr/sitemap-products.xml
https://lovanet.fr/sitemap-news.xml
https://lovanet.fr/sitemap-books.xml
https://animemomentsofficiel.fr/sitemap.xml
```

Important: Google indexing, Google Images, Video Search and News appearance cannot be guaranteed. The implementation provides valid crawlable metadata, sitemaps, RSS/Atom and schema.org structured data; Google decides eligibility.
