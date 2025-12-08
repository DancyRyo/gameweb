# SEO Configuration Checklist

## ⚠️ IMPORTANT: Required Configuration Steps

Before deploying your website, you MUST update the following placeholder values:

### 1. Domain Name (HIGH PRIORITY)
Replace `https://yourdomain.com` with your actual domain in these files:

- [ ] `app/layout.js` - Line 24 (canonical URL)
- [ ] `app/layout.js` - Line 29 (OpenGraph URL)
- [ ] `app/sitemap.js` - Line 3 (baseUrl)
- [ ] `app/robots.js` - Line 2 (baseUrl)
- [ ] `app/page.js` - Structured data URLs

**Search & Replace:**
```bash
# Use this command to find all instances:
grep -r "yourdomain.com" app/
```

### 2. Google Verification (RECOMMENDED)
- [ ] Get verification code from Google Search Console
- [ ] Update `app/layout.js` line 49:
  ```javascript
  verification: {
    google: "your-google-verification-code", // Replace this
  },
  ```

### 3. Images (RECOMMENDED)
Create and add these images to the `public/` folder:

- [ ] `/public/og-image.png` (1200x630px)
  - Used for social media sharing
  - Should showcase your game collection

- [ ] `/public/logo.png` (512x512px)
  - Used in structured data
  - Represents your brand

### 4. Meta Tags Verification

After deployment, verify your SEO setup using these tools:

#### Google Tools:
- [ ] [Google Search Console](https://search.google.com/search-console)
  - Add and verify your site
  - Submit sitemap: `https://yourdomain.com/sitemap.xml`
  - Check for indexing issues

- [ ] [Rich Results Test](https://search.google.com/test/rich-results)
  - Test your homepage
  - Verify structured data is correct

#### Social Media:
- [ ] [Facebook Debugger](https://developers.facebook.com/tools/debug/)
  - Test OpenGraph tags

- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - Test Twitter card display

#### SEO Analyzers:
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)
  - Check performance
  - SEO score

- [ ] [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)
  - Free SEO audit

### 5. Analytics Setup (RECOMMENDED)

Add Google Analytics 4 to track visitors:

1. [ ] Create GA4 property
2. [ ] Get measurement ID
3. [ ] Add to `app/layout.js`:

```javascript
import Script from 'next/script'

// In RootLayout, add before closing </body>:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### 6. Testing Checklist

Before going live:

- [ ] Test all pages load correctly
- [ ] Check mobile responsiveness
- [ ] Verify sitemap is accessible: `/sitemap.xml`
- [ ] Verify robots.txt is accessible: `/robots.txt`
- [ ] Test all internal links work
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Verify structured data with testing tool

### 7. Post-Launch Tasks

Within 24 hours:
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Share on social media to test OG tags
- [ ] Monitor analytics for traffic

Within 1 week:
- [ ] Check indexing status in Search Console
- [ ] Review any crawl errors
- [ ] Monitor keyword rankings
- [ ] Check for broken links

### 8. Optional Enhancements

Consider adding:
- [ ] Blog section for gaming content
- [ ] Game tutorials and guides
- [ ] FAQ page
- [ ] Contact page
- [ ] Newsletter signup
- [ ] Social media integration
- [ ] Game ratings/reviews
- [ ] User comments (with moderation)

## Quick Commands

### Build and test locally:
```bash
npm run dev
# Visit http://localhost:3000
# Check /sitemap.xml and /robots.txt
```

### Build for production:
```bash
npm run build
npm start
```

### Test SEO:
```bash
# View generated sitemap
curl http://localhost:3000/sitemap.xml

# View robots.txt
curl http://localhost:3000/robots.txt

# Check meta tags
curl http://localhost:3000 | grep -i "meta"
```

## Need Help?

If you encounter issues:

1. **Sitemap not working?**
   - Ensure `app/sitemap.js` exists
   - Check console for errors
   - Verify gameList is imported correctly

2. **Structured data errors?**
   - Use Google's Rich Results Test
   - Check JSON syntax in console
   - Verify all required fields are present

3. **Poor SEO scores?**
   - Optimize images (WebP format, lazy loading)
   - Minimize JavaScript
   - Enable caching
   - Use CDN

---

**Remember:** SEO is an ongoing process. Keep monitoring and improving!

Good luck! 🚀
