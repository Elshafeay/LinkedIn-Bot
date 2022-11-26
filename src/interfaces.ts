export interface IJob {
  id: string,
  title: string,
  companyName?: string,
  url: string,
  location: string, // i.e. Germany
  officeLocation?: string, // Munich, Bavaria, Germany
  type?: string,
}

export interface SuccessfulApplication extends IJob {}

export interface FailedApplication {
  id: string,
  title: string,
  companyName: string,
  url: string,
  error: string,
}

export type ApplicationRecord = SuccessfulApplication | FailedApplication;

export interface Generic {
  [key: string]: number | string,
 }

declare global {
  interface Window {
    trimString: Function;
    handleInputs: Function;
  }
}