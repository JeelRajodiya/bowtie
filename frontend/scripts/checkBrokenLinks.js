import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const renderSSR = async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    console.log('Navigating to the SPA...');
    await page.goto('https://bowtie.report');

    console.log('Waiting for the SPA to fully load...');
    await page.waitForFunction(() => document.readyState === 'complete');
 await page.screenshot({ path: `./snapshot.png` });
    console.log('Extracting HTML content...');
	await page.waitForSelector('body');
    const htmlContent = await page.evaluate(() => document.documentElement.outerHTML);

    console.log('Saving pre-rendered content to a file...');
    await fs.writeFile('pre-rendered-page.html', htmlContent);

    console.log('Pre-rendering complete');
  } catch (error) {
    console.error('Error occurred during rendering:', error);
  } finally {
    console.log('Closing the Puppeteer browser...');
    await browser.close();
  }
};

// Call the renderSSR function when this module is executed directly
renderSSR().then(() => {
  console.log('Process completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Error occurred during pre-rendering:', error);
  process.exit(1);
});
