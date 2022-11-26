import ExcelJS from 'exceljs';
import params from './params.json';
import { ApplicationStatus } from './src/enums';
import fs from 'fs';

class Excel {
  private readonly successFileName = 'SuccessfulApplications.xlsx';
  private readonly failureFileName = 'FailedApplications.xlsx';
  private successWorkbook = new ExcelJS.Workbook();
  private failureWorkbook = new ExcelJS.Workbook();

  constructor(){
    this.successWorkbook = new ExcelJS.Workbook();
    this.failureWorkbook = new ExcelJS.Workbook();
    this.initializeTheSheets();
  };

  async initializeTheSheets(){
    // if(fs.existsSync(`./${this.successFileName}`) && fs.existsSync(`./${this.failureFileName}`) ){
    //   this.successWorkbook = await this.successWorkbook.xlsx.readFile(this.successFileName);
    //   this.failureWorkbook = await this.failureWorkbook.xlsx.readFile(this.failureFileName);
    // }
    for(let country of params.searchCriteria.jobLocations){
      // if(this.getWorksheet(ApplicationStatus.success, country) && this.getWorksheet(ApplicationStatus.fail, country)){
      //   // There's already a sheet for this country inside both files
      //   continue;
      // }

      const successSheet = this.successWorkbook.addWorksheet(country, {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      const failureSheet = this.failureWorkbook.addWorksheet(country, {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      successSheet.columns = [
        {
          header: 'Job Id',
          key: 'id',
          width: 10,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job Title',
          key: 'title',
          width: 40,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Company Name',
          key: 'companyName',
          width: 40,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job Location',
          key: 'location',
          width: 40,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job Type',
          key: 'type',
          width: 20,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job URL',
          key: 'url',
          width: 60,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
      ];

      failureSheet.columns = [
        {
          header: 'Job Id',
          key: 'id',
          width: 10,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job Title',
          key: 'title',
          width: 40,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Company Name',
          key: 'companyName',
          width: 40,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Job URL',
          key: 'url',
          width: 60,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 13
          },
        },
        {
          header: 'Error Message',
          key: 'error',
          width: 60,
          alignment: {
            horizontal: 'center',
            vertical: 'middle'
          },
          font: {
            color: { argb: '000000' },
            size: 10
          },
        },
      ];
    }
  };

  getWorksheet(status: ApplicationStatus, country: string){
    if (status === ApplicationStatus.success){
      return this.successWorkbook.getWorksheet(country);
    }else{
      return this.failureWorkbook.getWorksheet(country);
    }
  }

  async createSheets(){
    await this.successWorkbook.xlsx.writeFile(`${this.successFileName}`);
    await this.failureWorkbook.xlsx.writeFile(`${this.failureFileName}`);
  }
}

export default new Excel();