export function scrapTabContent() {
  const metaDesc = document.querySelector(
    'meta[name="description"],meta[property="og:description"]'
  );
  const description = metaDesc ? metaDesc.getAttribute('content') : '';

  const heading = document.querySelector('h1,h2');
  const mainHeading = heading ? heading.innerText.trim() : '';

  let firstPara = '';
  const paras = Array.from(
    document.querySelectorAll('main p, article p, section p, body p')
  );
  for (const p of paras) {
    const text = p.innerText.trim();
    if (text.length > 40) {
      firstPara = text;
      break;
    }
  }

  let summary = '';
  if (mainHeading) summary += mainHeading + '. ';
  if (description) summary += description + ' ';
  if (firstPara && !summary.includes(firstPara)) summary += firstPara;
  summary = summary.trim();

  if (!summary) summary = document.title;

  chrome.runtime.sendMessage({
    action: 'cacheTabContent',
    data: {
      summary,
    },
  });
}
