import { chromium } from "playwright";
import type { Browser, BrowserContext, Page, ElementHandle } from "playwright";

export async function extractImageLinks(targetUrl: string): Promise<string[]> {
  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    console.log("Scrolling viewport to trigger lazy-loaded image sources...");
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(500);
    }

    const imageLinks: (string | null)[] = await page.$$eval(
      "img",
      (images: HTMLImageElement[], baseUrl: string): (string | null)[] => {
        return images.map((img: HTMLImageElement) => {
          const src =
            img.getAttribute("src") ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy") ||
            img.getAttribute("srcset");

          if (!src) return null;
          if (src.startsWith("data:image")) return null;

          try {
            return new URL(src, baseUrl).href;
          } catch {
            return null;
          }
        });
      },
      targetUrl,
    );

    const uniqueLinks: string[] = [...new Set(imageLinks.filter((url): url is string => url !== null))];
    return uniqueLinks;
  } catch (error) {
    console.error("An operational error derailed the image extraction:", error);
    return [];
  } finally {
    await browser.close();
  }
}
