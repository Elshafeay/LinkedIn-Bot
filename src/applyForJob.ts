import { ElementHandle, Page } from 'puppeteer';
import { addToSheet, getEnumKeyByValue, scrollToElement, sleep, trimString } from './utils';
import { IJob } from './interfaces';
import params from '../params.json';
import { ApplicationStatus, Industries, Languages, LanguagesLevels, LanguagesLevelsEquivlent, Technologies } from './enums';

export const applyForJob = async (page: Page, job: IJob) => {
  console.log('\n=> Appling for Job with id: ', job.id);
  await page.click(`[data-occludable-job-id="${job.id}"] .job-card-list__title`);
  await sleep(5000);

  // Checking If I already applied for this job before
  const appliedBefore = await page.evaluate(() => {
    const appliedStatus = document.querySelector('.artdeco-inline-feedback--success');
    return appliedStatus?.textContent || null;
  });

  if(appliedBefore){
    console.log('You already applied for this job');
    // Already Applied for this job
    return;
  }

  const easyApplySelector = `.jobs-apply-button[data-job-id="${job.id}"]`;
  await loadFullPage(page, easyApplySelector);

  const { location: officeLocation, type, description } = await getJobDetails(page);
  
  const mustIncludeWord = params.searchCriteria.mustIncludeWord;
  if(mustIncludeWord && !description.toLowerCase().includes(mustIncludeWord.toLowerCase())) {
    console.log('Skipping this job, as it doesn\'t have the mustInclude Keyword');

    return;
  }

  job = {
    ...job,
    officeLocation,
    type
  };

  await page.click(easyApplySelector);

  let finished = false;
  while(!finished){
    // Going for the next form in the application
    try{
      const invalidInputs = await checkingForInvalidInputs(page);
      if(invalidInputs){
        throw new Error('Invalid Inputs (Unhandled Case)');
      }
      finished = await fillTheForm(page);
    }catch(err){
      console.log('Failed to Apply');
      console.log(err);

      // export to failure sheet
      const record = {
        id: job.id,
        title: job.title,
        companyName: job.companyName || 'Unkown',
        url: job.url,
        error: (err as Error).message || 'Failed to Apply',
      };
      addToSheet(ApplicationStatus.fail, job.location, record);
      await closeTheForm(page);
      return;
    }
  }
  // export to success sheet
  console.log('Successfully Applied');

  addToSheet(ApplicationStatus.success, job.location!, job);

  await page.waitForSelector('.artdeco-modal');
  await page.click('.artdeco-modal__dismiss');
};

const fillTheForm = async (page: Page) => {
  await page.waitForSelector('.jobs-easy-apply-content');
  const applicationIsFinished = await checkApplicationProgress(page);
  if(applicationIsFinished){
    // this is a review page, there's no fields to fill anymore
    await sleep(3000);
    return await clickSubmitButton(page);
  }

  const inputs = await page.$$('.pb4 .jobs-easy-apply-form-section__grouping');
  for(let input of inputs){
    await handleInputs(page, input);
  };
  return await clickSubmitButton(page);
};

const handleInputs = async (page: Page, input: ElementHandle) => {
  const inputTextContent = await getElementHandleTextContent(input);
  await sleep(2000);

  // Handle Email Address
  if(inputTextContent?.toLowerCase().includes('mail')){
    // already added by default by linkedin
    return;
  }


///////////////// Handle Text Inputs /////////////////////////

  // Handle Languages - A another format  (on a scale from 1-10)
  else if(inputTextContent?.toLowerCase().includes('how would you rate your')){
    const languageInput = await input.$('input');
    let answer = '0';
    for(let language in params.formData.languages){
      if(inputTextContent.includes(language)){
        const languageLevel = getEnumKeyByValue(
          LanguagesLevels,
          params.formData.languages[<Languages>language]
        ) as keyof typeof LanguagesLevels;
        answer = LanguagesLevelsEquivlent[languageLevel];
      }
    }
    await languageInput?.click({ clickCount: 3 });
    await languageInput?.type(answer);
  }

  // Handle Industries, experience do you currently have in []
  else if(inputTextContent?.toLowerCase().includes('experience do you currently have')){
    const industryInput = await input.$('input');
    const industry = trimString(inputTextContent)!
      .split('experience do you currently have in ')[1] as keyof typeof Industries;

    let answer = params.formData.industries[industry];
    if(answer == undefined ){
      answer = params.formData.industries.default;
    }

    await industryInput?.click({ clickCount: 3 });
    await industryInput?.type(''+answer);
  }

  // Handle Industries, different format (how many years of [] experience)
  else if(inputTextContent?.toLowerCase().includes('how many years of')){
    const industryInput = await input.$('input');
    const industry = trimString(inputTextContent)!
      .split('How many years of ')[1].split(' experience')[0] as keyof typeof Industries;

    let answer = params.formData.industries[industry];
    if(answer == undefined ){
      answer = params.formData.industries.default;
    }

    await industryInput?.click({ clickCount: 3 });
    await industryInput?.type(''+answer);
  }

  // Handle Technologies
  else if(inputTextContent?.toLowerCase().includes('work experience do you have with')){
    const technologyInput = await input.$('input');
    const technology = trimString(inputTextContent)!
      .split('work experience do you have with ')[1] as keyof typeof Technologies;

    let answer = params.formData.technologies[technology];
    if(answer == undefined ){
      answer = params.formData.technologies.default;
    }

    await technologyInput?.click({ clickCount: 3 });
    await technologyInput?.type(''+answer);
  }

  // Handle Technologies
  else if(inputTextContent?.toLowerCase().includes('years of experience do you have using')){
    const technologyInput = await input.$('input');
    const technology = trimString(inputTextContent)!
      .split('years of experience do you have using ')[1] as keyof typeof Technologies;

    let answer = params.formData.technologies[technology];
    if(answer == undefined ){
      answer = params.formData.technologies.default;
    }

    await technologyInput?.click({ clickCount: 3 });
    await technologyInput?.type(''+answer);
  }

  // Handle First Name
  else if(inputTextContent?.toLowerCase().includes('first name')){
    const firstNameInput = await input.$('input');
    await firstNameInput?.click({ clickCount: 3 });
    await firstNameInput?.type(params.formData.personalInfo.firstName);
  }

  // Handle Last Name
  else if(inputTextContent?.toLowerCase().includes('last name')){
    const lastNameInput = await input.$('input');
    await lastNameInput?.click({ clickCount: 3 });
    await lastNameInput?.type(params.formData.personalInfo.lastName);
  }

  // Handle Summary
  else if(inputTextContent?.toLowerCase().includes('summary')){
    const summaryTextarea = await input.$('textarea');
    await summaryTextarea?.click({ clickCount: 4 });
    await summaryTextarea?.type(params.formData.personalInfo.summary);
  }

  // Handle Address Line 1
  else if(inputTextContent?.toLowerCase().includes('address line 1')){
    const addressLineInput = await input.$('input');
    await addressLineInput?.click({ clickCount: 3 });
    await addressLineInput?.type(params.formData.personalInfo.addressLine1);
  }

  // Handle Address Line 2
  else if(inputTextContent?.toLowerCase().includes('address line 2')){
    const addressLineInput = await input.$('input');
    await addressLineInput?.click({ clickCount: 3 });
    await addressLineInput?.type(params.formData.personalInfo.addressLine2);
  }

  // Handle City
  if(trimString(inputTextContent!).toLowerCase() === 'city'){
    const cityInput = await input.$('input');
    await cityInput?.click({ clickCount: 3 });
    await cityInput?.type(params.formData.personalInfo.city);
    await sleep(2000);
    await cityInput?.press('ArrowDown');
    await cityInput?.press('Enter');
  }

  // Handle ZipCode
  else if(inputTextContent?.toLowerCase().includes('zip')){
    const zipInput = await input.$('input');
    await zipInput?.click({ clickCount: 3 });
    await zipInput?.type(params.formData.personalInfo.zip);
  }

  // When can you start? (please use MM.YYYY)
  else if(inputTextContent?.toLowerCase().includes('when can you start')){
    const startingDateInput = await input.$('input');
    await startingDateInput?.click({ clickCount: 3 });
    await startingDateInput?.type(params.formData.inputs.whenCanYouStart);
  }
  
  // Handle Message to The Hiring Manager
  else if(inputTextContent?.toLowerCase().includes('message to the hiring manager')){
    const messageTextarea = await input.$('textarea');
    await messageTextarea?.click({ clickCount: 4 });
    await messageTextarea?.type(params.formData.inputs.messageToHiringManager);
  }

  // Handle nationality
  else if(inputTextContent?.toLowerCase().includes('nationality of origin')){
    const messageTextarea = await input.$('textarea');
    await messageTextarea?.click({ clickCount: 4 });
    await messageTextarea?.type(params.formData.personalInfo.nationality);
  }

  // Current Location
  else if(inputTextContent?.toLowerCase().includes('current location')){
    const currentLocationInput = await input.$('input');
    await currentLocationInput?.click({ clickCount: 3 });
    await currentLocationInput?.type(params.formData.inputs.livingIn);
  }

  // Notice Period
  else if(inputTextContent?.toLowerCase().includes('notice period')){
    const noticePeriodInput = await input.$('input');
    await noticePeriodInput?.click({ clickCount: 3 });
    await noticePeriodInput?.type(params.formData.inputs.noticePeriod);
  }

  // Current Employer
  else if(inputTextContent?.toLowerCase().includes('current employer')){
    const currentEmployerInput = await input.$('input');
    await currentEmployerInput?.click({ clickCount: 3 });
    await currentEmployerInput?.type(params.formData.inputs.currentEmployer);
  }

  // minimum salary expectation (must be number)
  else if(
    inputTextContent?.toLowerCase().includes('minimum salary expectation') ||
    inputTextContent?.toLowerCase().includes('salary expectations for this position'
  )
  ){
    const salaryInput = await input.$('input');
    await salaryInput?.click({ clickCount: 3 });
    await salaryInput?.type(""+params.formData.inputs.salaryInNumbers);
  }

  // Handle Salary
  else if(inputTextContent?.toLowerCase().includes('salary')){
    const salaryInput = await input.$('input');
    await salaryInput?.click({ clickCount: 3 });
    await salaryInput?.type(params.formData.inputs.salary);
  }

///////////////// Handle files /////////////////////////

  // Handle CV
  else if(inputTextContent?.toLowerCase().includes('resume')){
    const uploadButton = await input.$('.jobs-document-upload__build-resume-container input') as ElementHandle<HTMLInputElement>;
    if(uploadButton){
      await uploadButton?.uploadFile(params.formData.files.resume);
    }else{
      // it's already uploaded
      return;
    }
  }
  
  // Handle Photo
  else if(inputTextContent?.toLowerCase().includes('photo') && params.formData.files.photo){
    const uploadButton = await input.$('.jobs-document-upload__build-resume-container input') as ElementHandle<HTMLInputElement>;
    if(uploadButton){
      await uploadButton?.uploadFile(params.formData.files.photo);
    }else{
      // it's already uploaded
      return;
    }
  }

///////////////// Handle Radio Button Inputs /////////////////////////

  // Handle Languages - A another format (Are you able to speak, write, and read [] fluently? )
  else if(inputTextContent?.toLowerCase().includes('fluently')){
    const yesNoRadios = await input.$$('input');
    let answer = 'No';
    for(let language in params.formData.languages){
      if(inputTextContent.includes(language)){
        if (params.formData.languages[<Languages>language] === LanguagesLevels.nativeOrBilingual){
          answer = 'Yes';
        }
        break;
      }
    }
    const toClickRadio = answer === 'Yes'? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // Willing To Relocate
  if(
    inputTextContent?.toLowerCase().includes('relocate') ||
      inputTextContent?.toLowerCase().includes('commuting') ||
      inputTextContent?.toLowerCase().includes('commute')
  ){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.willingToRelocate? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // Current residence
  if(
    inputTextContent?.toLowerCase().includes('currently living')){
    const yesNoRadios = await input.$$('input');
    const country = trimString(inputTextContent)!.split('currently living in ')[1];

    const toClickRadio = params.formData.inputs.livingIn === country? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // Starting immediately
  if(
    inputTextContent?.toLowerCase().includes('fill this position urgently')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.urgentFill? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // comfortable working remotely
  if(
    inputTextContent?.toLowerCase().includes('remote')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.willingToWorkRemotley? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // Will you now or in the future require sponsorship for employment visa status?
  else if(inputTextContent?.toLowerCase().includes('require sponsorship')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.requireVisa? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }  

  // Do you have a valid work permit for []
  else if(inputTextContent?.toLowerCase().includes('valid work permit')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.legallyAuthorized? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // criminal record
  else if(inputTextContent?.toLowerCase().includes('criminal record')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.criminalRecord? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // background check
  else if(inputTextContent?.toLowerCase().includes('background check')){
    const yesNoRadios = await input.$$('input');

    const toClickRadio = params.formData.inputs.backgroundCheck? yesNoRadios[0]: yesNoRadios[1];
    await toClickRadio.click();
  }

  // comfortable working in [] environment
  else if(inputTextContent?.toLowerCase().includes('comfortable working')){
    const yesNoRadios = await input.$$('input');

    // always comfortable to work :D
    const toClickRadio = yesNoRadios[0];
    await toClickRadio.click();
  }


////////////////////// Handle Dropdown Inputs ///////////////////////// 

  // Handle Phone Number
  if(inputTextContent?.toLowerCase().includes('country code')){
    const countryCodeDropdownMenu = await input.$('fb-dropdown__select');
    await countryCodeDropdownMenu?.select(params.formData.personalInfo.countryCode);

    const phoneNumberInput = await input.$('input');
    // to clear the input
    await phoneNumberInput?.click({ clickCount: 3 });
    await phoneNumberInput?.type(params.formData.personalInfo.phoneNumber, { delay: 100 });

  }

  // Handle Languages
  else if(inputTextContent?.toLowerCase().includes('level of proficiency')){
    const languageProficiencyDropdownMenu = await input.$('fb-dropdown__select');
    const language = trimString(inputTextContent)!.split('level of proficiency in ')[1] as Languages;
    const answer = params.formData.languages[language] || params.formData.languages.default;

    await languageProficiencyDropdownMenu?.select(answer);
  }

  // privacy policy acceptance
  else if(inputTextContent?.toLowerCase().includes('understood our privacy policy')){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    await yesNoDropdownMenu?.select(params.formData.inputs.acceptPrivacyPolicy? 'Yes': 'No');
  }
  
  // legally authorized to work in []
  if(
    inputTextContent?.toLowerCase().includes('legally authorized') ||
    inputTextContent?.toLowerCase().includes('working permit')
  ){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    await yesNoDropdownMenu?.select(params.formData.inputs.legallyAuthorized? 'Yes': 'No');
  }

  // currently living in []
  else if(inputTextContent?.toLowerCase().includes('currently living in')){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    const country = trimString(inputTextContent)!
      .split('currently living in ')[1];
    await yesNoDropdownMenu?.select(params.formData.inputs.livingIn === country? 'Yes': 'No');
  }

  // currently based in []
  else if(inputTextContent?.toLowerCase().includes('currently based in')){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    const country = trimString(inputTextContent)!
      .split('currently based in ')[1];
    await yesNoDropdownMenu?.select(params.formData.inputs.livingIn === country? 'Yes': 'No');
  }

  // Have you used [] in the past or in your current role?
  else if(inputTextContent?.toLowerCase().includes('in the past or in your current role')){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    await yesNoDropdownMenu?.select('Yes');
  }

  // Have you used [] in the past or in your current role?
  else if(inputTextContent?.toLowerCase().includes('you have experience with')){
    const yesNoDropdownMenu = await input.$('fb-dropdown__select');
    await yesNoDropdownMenu?.select('Yes');
  }

  // Gender
  else if(inputTextContent?.toLowerCase().includes('gender')){
    const genderDropdownMenu = await input.$('fb-dropdown__select');

    await genderDropdownMenu?.select(params.formData.personalInfo.gender);
  }
    
////////////////////// Handle Checkbox Inputs ///////////////////////// 

  // privacy policy acceptance
  else if(inputTextContent?.toLowerCase().includes('by checking this box')){
    const acceptCheckbox = await input.$('input');

    if(params.formData.inputs.acceptPrivacyPolicy)
      await acceptCheckbox?.evaluate(ch => (<HTMLElement>ch).click());
  }

  // which location are you applying for
  else if(inputTextContent?.toLowerCase().includes('which location are you applying for')){
    const checkboxes = await input.$$('input');
    
    for(let checkBox of checkboxes){
      await checkBox?.evaluate(ch => (<HTMLElement>ch).click());
    }
  }

  // TODO: Handle A BIG ELSE for all types of inputs

};

const checkSubmitButton = async(page: Page) => {
  const primaryButtonTextContent = await page.$eval('.artdeco-button--primary', (btn) => btn.textContent);

  return primaryButtonTextContent?.toLowerCase().includes('submit application')? true: false;
};

const checkApplicationProgress = async(page: Page) => {
  const applicationTextContent = await page.$eval('.jobs-easy-apply-content', (application) => application.textContent);

  return applicationTextContent?.toLowerCase().includes('review your application')? true: false;
};

const clickSubmitButton = async(page: Page) => {
  let applicationIsFinished = await checkSubmitButton(page);

  if(applicationIsFinished){
    // unsubscribe from company updates
    await sleep(2000);
    const unfollowCheckbox = await page.$('input#follow-company-checkbox');
    await unfollowCheckbox?.evaluate(ch => (<HTMLElement>ch).click());
  }

  await sleep(2000);
  await page.click('button.artdeco-button--primary');
  return applicationIsFinished;
};

const loadFullPage = async (page: Page, easyApplySelector: string) => {
  await page.waitForSelector(easyApplySelector);
  await sleep(3000);
  await page.waitForSelector('.jobs-description-content__text');
  await scrollToElement(page, '.jobs-description-content__text', 'end');
  await sleep(3000);
  await scrollToElement(page, easyApplySelector, 'start');
};

const checkingForInvalidInputs = async (page: Page) => {
  return await page.$$eval('.fb-form-element__error-text', (elements) => {
    for(let element of elements){
      if(element?.textContent!.replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim()){
        // There's an Error in the form (not handled case)
        return true;
      }
    }
    return false;
  });
};

const getJobDetails = async (page: Page) => {
  const { location, type, description } = await page.$eval('.jobs-search__job-details--container', (jobBody) => {
    const location = (jobBody.querySelector('.jobs-unified-top-card__bullet')?.textContent!)
      .replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim();
    const type = (jobBody.querySelector('.jobs-unified-top-card__job-insight')?.textContent!)
      .replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim()
      .split(' · ')[0];
    const description = (jobBody.querySelector('.jobs-description-content__text')?.textContent!)
      .replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim();

    return { location, type, description };
  });

  return {
    location,
    type,
    description
  };
};

const closeTheForm = async (page: Page) => {
  await page.click('.artdeco-modal__dismiss');
  await page.waitForSelector('button[data-control-name="discard_application_confirm_btn"]');
  await page.click('button[data-control-name="discard_application_confirm_btn"]');
};

const getElementHandleTextContent = async (element: ElementHandle) => {
  const textContent = await (await element.getProperty('textContent')).jsonValue();
  return textContent;
};