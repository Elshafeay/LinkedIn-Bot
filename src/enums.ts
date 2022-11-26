export enum JobNatureLevels {
  onSite = '1',
  remote = '2',
  hybrid = '3',
}

export enum JobDateValues {
  pastMonth = 'f_TPR=r2592000',
  pastWeek = 'f_TPR=r604800',
  pastDay = 'f_TPR=r86400',
}

export enum JobExpLevels {
  internship = '1',
  entryLevel = '2',
  associate = '3',
  midSenior = '4',
  director = '5',
  executive = '6',
}

export enum JobTypeLevels {
  fullTime = 'F',
  partTime = 'P',
  contract = 'C',
  temporary = 'T',
  volunteer = 'V',
  internship = 'I',
  other = 'O',
}

export enum DegreesOptions {
  highSchoolDiploma = 'High School Diploma',
  bachelorDegree = 'Bachelor\'s Degree',
  associateDegree = 'Associate\'s Degree',
  mastersDegree = 'Master\'s Degree',
  masterOfBusinessAdministration = 'Master of Business Administration',
  doctorOfPhilosophy = 'Doctor of Computer Science',
  doctorOfMedicine = 'Doctor of Medicine',
  doctorOfLaw = 'Doctor of Law',
}

export enum ApplicationStatus {
  success = 'success',
  fail = 'fail',
}

export enum Languages {
  German = 'German',
  English = 'English',
  Arabic = 'Arabic',
  Spanish = 'Spanish',
  French = 'French',
}

export enum LanguagesLevels {
  none = 'None',
  conversational = 'Conversational',
  professional = 'Professional',
  nativeOrBilingual = 'Native or bilingual',
}

export enum LanguagesLevelsEquivlent {
  // on a scale from 1-10
  none = '0',
  conversational = '3',
  professional = '7',
  nativeOrBilingual = '10',
}

export enum Industries {
  'Accounting/Auditing',
  'Administrative',
  'Advertising',
  'Analyst',
  'Art/Creative',
  'Business Development',
  'Consulting',
  'Customer Service',
  'Distribution Design',
  'Education',
  'Engineering',
  'Finance',
  'General Business',
  'Health Care',
  'Human Resources',
  'Information Technology',
  'Legal',
  'Management',
  'Manufacturing',
  'Marketing',
  'Public Relations',
  'Purchasing',
  'Product Management',
  'Project Management',
  'Production',
  'Quality Assurance',
  'Research',
  'Sales',
  'Science',
  'Strategy/Planning',
  'Supply Chain',
  'Training',
  'Writing/Editing',
  'default',
}

export enum Technologies {
  'Node.js',
  'React.js',
  'JavaScript',
  'TypeScript',
  'Java',
  'Scala',
  'Python',
  'Python (Programming Language)',
  'Google Cloud Platform (GCP)',
  'AWS',
  'Amazon Web Services (AWS)',
  'MongoDB',
  'Full-Stack Development',
  'default',
}

export enum Countries {
  'United States',
  'Spain',
  'United Arab Emirates',
  'Canada',
  'United Kingdom',
  'Switzerland',
  'Netherlands',
  'Czech Republic',
  'Egypt',
  'Sweden',
  'Australia',
  'France',
  'Italy',
}