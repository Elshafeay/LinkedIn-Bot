import { Page } from 'puppeteer';
import excelInstance from '../excel';
import { ApplicationStatus } from './enums';
import { ApplicationRecord } from './interfaces';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const scrollToElement = async (page: Page, selector: string, position: ScrollLogicalPosition = 'center') => {
  await page.evaluate((selector: string, position: ScrollLogicalPosition) => {
    document.querySelector(selector)!
      .scrollIntoView({ behavior: 'smooth', block: position, inline: position });
  }, selector, position);
};

export const addToSheet = async (status: ApplicationStatus, country: string, record: ApplicationRecord) => {
  const worksheet = excelInstance.getWorksheet(status, country);

  worksheet.addRow(record);
  await excelInstance.createSheets();
};

export const getEnumKeyByValue = (enumObj: any, value: string) => {
  return Object.keys(enumObj)[Object.values(enumObj).indexOf(value)];
};

export const trimString = (sentence: string) => {
  return sentence.replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim();
};