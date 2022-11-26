import dotenv from 'dotenv';
dotenv.config();

import puppeteer, { Page } from 'puppeteer';
import  * as config from '../config.json';
import { generateSearchUrl } from './generateSearchUrl';
import { searchForJobs } from './searchForJobs';
import { login } from './login';
import { sleep } from './utils';

const run = async () => {

  const browserOptions =
    process.env.BROWSER === 'headless'? config.browserOptions.headless: config.browserOptions.gui;

  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();

  // Don't know why it's not working
  // await page.exposeFunction('trimString', (text: string) => trimString(text));
  // await page.exposeFunction('handleInputs', (page: Page, input: Element) => handleInputs(page, input));

  await login(page);
  page.setDefaultTimeout(120000);
  await page.waitForSelector('#msg-overlay');

  await sleep(10000);
  const searchUrl = generateSearchUrl();

  await searchForJobs(page, searchUrl);

  await sleep(10000);
  await browser.close();

};

run().catch(err => console.log(err));
