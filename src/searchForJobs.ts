import { Page } from 'puppeteer';
import { scrollToElement, sleep, trimString } from './utils';
import { IJob } from './interfaces';
import { applyForJob } from './applyForJob';
import params from '../params.json';

export const searchForJobs = async (page: Page, searchUrl: string) => {
  if(!params.searchCriteria.jobTitles.length || !params.searchCriteria.jobLocations.length){
    console.log('ERROR: You must Enter at least one location and one title');
    process.exit(1);
  }

  for(const location of params.searchCriteria.jobLocations){
    for(const title of params.searchCriteria.jobTitles){
      let pageNumber = params.searchCriteria.startPage;
      let totalPages = pageNumber+1;
      while(pageNumber < totalPages){
        searchUrl += `&keywords=${title}&location=${location}&start=${pageNumber*25}`;
        await page.goto(searchUrl);
        await loadingThePage(page);
        const lastPage = await page.$eval('.artdeco-pagination__pages li:last-child', el => el.textContent);
        totalPages = +trimString(lastPage || '1');

        const jobs = await page.$eval(
          '.scaffold-layout__list-container',
          (container, location) => {
            const items = [...container.children]
              .map(item => {
                try{
                  const id = item.getAttribute('data-occludable-job-id')!;
                  const job: IJob = {
                    id: id,
                    companyName: (item.querySelector('.job-card-container__company-name')?.textContent || 'Unknown')
                      .replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim(),
                    title: (item.querySelector('.job-card-list__title')?.textContent!)
                      .replace(/^\s+|\s+|\?|\*|Required$/gm,' ').trim(),
                    url: `https://www.linkedin.com/jobs/view/${id}`,
                    location,
                  };
                  return job;
                }catch {
                  return null;
                }
              })
              .filter(item => item);
            return items as IJob[];
          }, location);

        console.log('jobs', jobs);
        if(!jobs.length)
          return;

        for(let job of jobs){
          await page.$eval(`[data-occludable-job-id="${job.id}"]`, e => {
            e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
          });

          // skip blacklisted companies
          if(params.searchCriteria.blacklist.companies.map(
            (name: string) => name.toLowerCase()).includes(job?.companyName!.toLowerCase())){
            continue;
          }

          // skip jobs with title that includes blacklisted words
          if(
            params.searchCriteria.blacklist.titles
              .filter(
                (blacklistedWord: string) =>
                  job.title?.toLowerCase().includes(blacklistedWord.toLowerCase())
              ).length
          ){
            continue;
          }

          await applyForJob(page, job);
          await sleep(5000);
          // process.exit(1); // to be removed
        }
        pageNumber++;
      }
    }
  }
};

async function loadingThePage(page: Page){
  await page.waitForSelector('.scaffold-layout__list-container');

  await sleep(5000);
  await scrollToElement(page, '.jobs-search-results-list__pagination');

  // scrolling again as the rest of the page gets loaded
  await sleep(5000);
  await scrollToElement(page, '.jobs-search-results-list__pagination');

  // now we can see the bottom of tha page
  await page.waitForSelector('#compactfooter-copyright');
  await sleep(5000);
}