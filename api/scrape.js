import { chromium } from "playwright";

export default async function handler(req, res) {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: "Missing ?term=" });
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {
    // Go to Etsy
    await page.goto("https://www.etsy.com", {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    // Click the search bar
    await page.click("input[data-id='search-query']");

    // Type the term
    await page.fill("input[data-id='search-query']", term);

    // Wait for the autocomplete dropdown to appear
    await page.waitForSelector("ul[data-id='search-suggestions'] li", { timeout: 10000 });

    // Extract suggestions
    const suggestions = await page.$$eval(
      "ul[data-id='search-suggestions'] li",
      (items) => items.map((item) => item.textContent.trim())
    );

    await browser.close();

    return res.status(200).json({
      term,
      suggestions
    });

  } catch (error) {
    await browser.close();
    return res.status(500).json({ error: error.message });
  }
}
