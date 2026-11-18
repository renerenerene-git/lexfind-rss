const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = 'https://lexfind.ch';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const items = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/fe/de/tol/"]'));
    return links.slice(0, 20).map(a => ({
      title: a.innerText.trim().replace(/\s+/g, ' '),
      link: a.href
    })).filter(item => item.title.length > 0);
  });

  const rssItems = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>LexFind Suche ZH</title>
  <link>${url}</link>
  <description>Automatischer RSS-Feed für LexFind</description>
  ${rssItems}
</channel>
</rss>`;

  fs.writeFileSync('feed.xml', rss);
  await browser.close();
})();
