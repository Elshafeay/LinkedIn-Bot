import {
  JobDateValues,
  JobExpLevels,
  JobNatureLevels,
  JobTypeLevels
} from './enums';
import params from '../params.json';

export const generateSearchUrl = () => {
  let searchUrl = 'https://www.linkedin.com/jobs/search/?';
  const searchAttributes: string[] = [
    'f_AL=true' // Easy Apply filter is always selected
  ];

  // Job Nature
  const jobNatureQuery = getJobNature(params);
  if(jobNatureQuery){
    searchAttributes.push(jobNatureQuery);
  }

  // Job Date
  const jobDateQuery = getJobDate(params);
  if(jobDateQuery){
    searchAttributes.push(jobDateQuery);
  }

  // Job Experience
  const jobExperienceQuery = getJobExp(params);
  if(jobExperienceQuery){
    searchAttributes.push(jobExperienceQuery);
  }

  // Job Type
  const jobTypeQuery = getJobType(params);
  if(jobTypeQuery){
    searchAttributes.push(jobTypeQuery);
  }

  if(params.searchCriteria.under10Applicants){
    searchAttributes.push('f_EA=true');
  }

  return searchUrl + searchAttributes.join('&');
};

const getJobNature = (params: any) => {
  return evaluateEntitiesLevels('f_WT=', params.searchCriteria.jobNature, JobNatureLevels);
};

const getJobDate = (params: any) => {
  if (params.searchCriteria.jobDate.pastMonth){
    return JobDateValues.pastMonth;
  }else if (params.searchCriteria.jobDate.pastWeek){
    return JobDateValues.pastWeek;
  }else if(params.searchCriteria.jobDate.pastDay){
    return JobDateValues.pastDay;
  }

  return null;
};

const getJobExp = (params: any) => {
  return evaluateEntitiesLevels('f_E=', params.searchCriteria.jobExperience, JobExpLevels);
};

const getJobType = (params: any) => {
  return evaluateEntitiesLevels('f_JT=', params.searchCriteria.jobType, JobTypeLevels);
};

const evaluateEntitiesLevels = (queryKey: string, paramsEntity: any, entityEnum: any) => {
  let attrsQuery: string[] = [];

  for(let entityKey in paramsEntity){
    if(entityKey.includes('comment')) continue; // to skip comments
    if(paramsEntity[entityKey]){
      attrsQuery.push(entityEnum[entityKey]);
    }
  }

  if(attrsQuery.length){
    queryKey += attrsQuery.join(',');
    return queryKey;
  }

  return null;
};
