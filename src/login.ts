import { Page } from 'puppeteer';
import { sleep } from './utils';
import params from '../params.json';

async function login (page: Page) {
  await page.goto('https://www.linkedin.com/login');
  await page.waitForSelector('.btn__primary--large');
  await sleep(5000);

  await page.type('#username', params.credentials.username);
  await page.type('#password', params.credentials.password);
  await page.click('.btn__primary--large');
}

export { login };