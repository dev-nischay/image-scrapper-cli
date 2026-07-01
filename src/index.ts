#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { extractImageLinks } from "./utils/scrape.js";
import ora from "ora";

async function main() {
  yargs(hideBin(process.argv))
    .scriptName("imgscrape")
    .command(
      "$0 <url>",
      "provide url for the website to extract image links",
      () => {},
      async (argv) => {
        const url = argv.url as string;
        if (url) {
          const spinner = ora(`Scraping images from ${url}...`).start();
          try {
            const data = await extractImageLinks(url);
            spinner.succeed(`Successfully extracted ${data.length} images.`);
            console.log(data);
          } catch (error) {
            spinner.fail("Failed to extract images.");
            console.error(error);
          }
        }
      },
    )
    .help()
    .parse();
}
main();
