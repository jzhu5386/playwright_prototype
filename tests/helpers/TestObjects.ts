export interface CompanyDetails {
  buzName: string;
  dba?: string;
  website: string;
  industry: string;
  yearOfIncorporation: string;
  buzType:
    | "S Corp"
    | "LLC"
    | "C Corp"
    | "Partnership / LLP"
    | "Sole Proprietorship"
    | "Nonprofit Corporation"
    | "B Corp"
    | "Close Corporation"
    | "Cooperative";
  taxType:
    | "As a corporation (I file form 1120)"
    | "As an S corp (I file form 1120s)"
    | "As a partnership (I file form 1065)"
    | "As a single member LLC (filed with personal taxes)";
  endOfTaxYear: string;
  companyRole: string;
  secondContact?: string;
  phoneNumber: string;
  redeemList: string[];
  sellProductAfter2020?: "Yes" | "No";
  averageMonthlyRevLess80k?: "Yes" | "No";
  wasAverageMonthlyRevLess80k?: "Yes" | "No";
}

export interface ConfirmCompanyDetails {
  trackTime: "Yes" | "No";
  grantsUsedForRDExpense: "Yes" | "No" | "Unsure";
  moreThan50Ownership: "Yes" | "No" | "Unsure";
  acquiredOtherBuz: "Yes" | "No" | "Unsure";
  transitionEntityType:
    | "Yes- but we kept the same EIN"
    | "Yes - we changed EIN"
    | "No"
    | "Unsure";
  moreThan5MthisYear: "Yes" | "No";
  claimCreditOutsideMS: string[];
  taxPreparer: string;
  taxPreparerEmail: string;
  uploadTaxForm?: string[];
  taxFiles?: string[];
  taxFilingMonth: string;
  // state tax specific, california, massachussets, georgia
  sellTangibleProperty?: "Yes" | "No";
  currentYearTaxLiability?: "< 0" | "0–25K" | "25K or more";
  naicsCode?: string;
  grossReceiptsGeorgia?: string[];
}

export interface VendorInfo {
  vendorName: string;
  vendorSpending: string;
  receipts?: string[];
}

export interface SuppliesAndServices {
  spend10kMoreCloudComputing: "Yes" | "No";
  cloudComputingSpendingPercentage?: "0%" | "25%" | "50%" | "75%" | "100%";
  serverUsagePurpose?:
    | "Developing and testing software"
    | "Running experiments"
    | "Training machine learning models"
    | "Other development purposes";
  spend10kMoreRDSupplies: "Yes" | "No";
  RDsuppliesSpendingPercentage?: "0%" | "25%" | "50%" | "75%" | "100%";
  suppliesUsageDescription?:
    | "Building a prototype"
    | "Running experiments"
    | "Other";
  moreThanOneRDProject:
    | "Yes, we have one R&D project"
    | "No, we have multiple R&D projects";
  mainRDProjectDescription:
    | "Computer software"
    | "Manufacture physical products"
    | "Process"
    | "Technique";
  mainProjectName: string;
  cloudVendorInfo?: VendorInfo[];
  supplyVendorInfo?: VendorInfo[];
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  timestamp: number;
}

export interface EmployeePersonalDetail {
  fullName: string;
  role: string;
  jobGroup: string;
  salary: string;
  country?: string;
  state: string;
  RDPercentage?: string;
  majorityOwner?: boolean;
  additionalActivies?: number;
}

export interface EmployeePersonalDetails
  extends Array<EmployeePersonalDetail> {}

export interface ContractorPersonalDetail extends EmployeePersonalDetail {
  payType:
    | "Variable (hourly, monthly, etc)"
    | "Fixed (fix scope and cost)"
    | "Fixed"
    | "Variable"
    | string;
}

export interface ContractorPersonalDetails
  extends Array<ContractorPersonalDetail> {}

export interface EmployeeDetails {
  salaryLastMonth: number;
  firstPayrollMonth: string;
  contractorsNotInPayRoll: "Yes" | "No";
  contractorPayrollSpending: number;
  developingNewProduct: "Yes" | "No";
  mostRAndDStates: string[];
  technicalPercentage: string;
  employeeCountJan: number;
  expectedEmployeeCountDec: number;
  firstParollMonth?: string;
}

export interface QualifyingAnswers {
  generatedRevenue: "Yes" | "No";
  firstYearWithGrossReceipts: number; //<5 years of gross receipt qualify for QSB
  moreThan5MthisYear: "Yes" | "No";
  expectMoreThan5MthisYear?: "Yes" | "No";
  expectMoreThan5MnextYear?: "Yes" | "No";
  expectOweIncomeTax: "Yes" | "No" | "Unsure";
  acquiredOtherBuz:
    | "Yes - we acquired a full business"
    | "Yes - we acquired assets only, no employees or customers"
    | "No"
    | "Unsure";
  foundYearAquiredCompnay?: number;
  nameOfAcquiredBuz?: string;
  moreThan50Ownership: "Yes" | "No" | "Unsure";
  companyInControlRAndD?: "Yes" | "No";
  companyInControlEarliestFounded?: number;
  transitionEntityType:
    | "Yes- but we kept the same EIN"
    | "Yes - we changed EIN"
    | "No"
    | "Unsure";
  transitionYear?: number;
  originalEntityFoundYear?: number;
  cpaFirmName: string;
  cpaFirmEmail: string;
}

export interface RandDActivities {
  claimedRDBefore: "Yes" | "No" | "Unsure";
  buzDescription: string;
  randDActivityInhouse:
    | "Entirely with own employees"
    | "Some employees and some contractors or outside firms"
    | "Entirely contractors or outside firms";
  contractorActivityInUS?:
    | "Entirely in the US"
    | "Some in the US, some not in the US"
    | "None in the US";
  ownIntellectualPropery:
    | "Yes, we own all of the intellectual property"
    | "Yes, we own some of the intellectual property"
    | "No, we do not own any of the intellectual property";
  inHouseEmployeeInUS?:
    | "Everybody works in the US"
    | "Some work is done in the US, some abroad"
    | "Nobody works in the US";
  grantsUsedForRDExpense: "Yes" | "No" | "Unsure";
  grantOrigin?: string[];
  // grantOrigin?: [
  //   | "NIH"
  //   | "DOD"
  //   | "NSF"
  //   | "SBA"
  //   | "DOE"
  //   | "SBIR"
  //   | "Other federal government agency"
  //   | "State or local government agency"
  //   | "Private foundation"
  //   | "Private company"
  //   | "University"
  //   | "PPP loan"
  //   | "Other"
  // ];
  grantUsedForRandDSpending?: string;
  consultingAgency?:
    | "Yes, we exclusively build products for clients"
    | "Yes, but we also build our own products where we own the IP"
    | "No, we exclusively build our own products where we own the IP";
  buildOwnProductTimePercentage?: string;
  trackTime?: "Yes" | "No" | "Unsure";
}

export interface FinalizeQualifyingAnswer {
  howRandDImproveProduct: string[]; // ['new features' | 'performance, shelf life' | 'interal process' | 'final customer experience' | 'None of the above'],
  technicalUncertainties: string[]; // ['Design, or algorithms' | 'Processes or methodologies' | 'desired outcome' | 'other technical uncertainties' | 'None of the above']
  processOfExperimentation: string[];
  kindOfTechnicalProjects: string[];
}

export interface GmailQuery {
  userId: string;
  q: string;
}

export interface StripeCardInfo {
  cardNumber: string;
  expDate: string;
  secCode: string;
  zipCode: string;
}

export interface CompanyTokenInfo {
  token: string;
  programId?: string;
  companyId: string;
  url: string;
}

export interface TMCompanyInfo {
  legalName: string;
  companyPhone: string;
  EIN: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CompanyOwner {
  firstName: string;
  lastName: string;
  ssn: string;
  phone: string;
  title?: string;
  birthday: string;
  ownership: number;
  citizenship: string;
  email: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const questionMap = {
  sellProductAfter2020:
    "Did you and/or your employees begin selling your product or service after 2/16/2020?",
  averageMonthlyRevLess80k:
    "Is your current average monthly revenue less than $80k?",
  wasAverageMonthlyRevLess80k:
    "Was your average monthly revenue in tax year 2020 less than $80k?",
  salaryLastMonth:
    "Roughly how much did you pay in salaries to US-based employees (W-2 and contractors) through your payroll system last month?",
  firstPayrollMonth: "What month was your first payroll 2021?",
  contractorsNotInPayRoll:
    "Are there US based contractors or contracting firms who are not currently in your payroll system?",
  contractorPayrollSpending:
    "Roughly how much did you spend on contractors or contracting firms outside your payroll last month?",
  developingNewProduct:
    "Do you currently employ or contract with US-based people that help develop a new product or software?",
  mostRAndDStates: ["California", "Massachusetts"],
  employeeCountJan: "How many employees do you currently have?",
  expectedEmployeeCountDec: 5,
  noPaymentFoundInPayroll:
    "We couldn't find any payments in your payroll system.",
  technicalPercentage: "What percentage of your company is technical?",
  generatedRevenue: "Has your company generated revenue yet?",
  firstYearWithGrossReceipts:
    "What was the first year your company had gross receipts? (If you haven't earned revenue yet, enter your incorporation year)",
  expectMoreThan5MthisYear:
    "Do you expect to make more than $5 million in gross receipts this tax year?",
  moreThan5MthisYear:
    "Did you make more than 5 million dollars in revenue this year?",
  expectMoreThan5MnextYear:
    "Do you expect to make more than $5 million in gross receipts next tax year?",
  expectOweIncomeTax:
    "Do you expect to owe any federal income tax when you file this tax year?",
  acquiredOtherBuz:
    "Has your business ever acquired another business or established a subsidiary?",
  foundYearAquiredCompnay: "What year was the acquired company founded?",
  nameOfAcquiredBuz: "",
  moreThan50Ownership:
    "Did any person, company or group own more than 50% of your business during the past year?",
  companyInControlRAndD:
    "Do any of the other companies in the control group also do R&D in any form in the US?",
  companyInControlEarliestFounded:
    "What is the earliest any of these companies was founded?",
  transitionEntityType:
    "Has your company ever transitioned your corporate entity type (eg. from an LLC to a C corp)?",
  transitionYear: "What year did the transition occur?",
  originalEntityFoundYear: "What year was the original entity founded?",
  cpaFirmName:
    "What CPA or firm do you work with to file your corporate taxes?",
  cpaFirmEmail:
    "What's their email? Can be a general contact email or your personal account manager.",
  claimedRDBefore: "Have you ever claimed the US Federal R&D credit before?",
  buzDescription:
    "Give an overview of your company's product(s) and/or service(s)", // "Quickly describe your business. How do you explain your product(s) to customers?",
  randDActivityInhouse:
    "Are R&D activities conducted solely by employees or are outside contractors/firms brought in to help?",
  inHouseEmployeeInUS: "Are your in-house employees working in the US?",
  contractorActivityInUS:
    "For your contractors or outside firms, are their activities conducted in the US?",
  ownIntellectualPropery:
    "Do you own the intellectual property generated by your contractors?",
  consultingAgency:
    "Does your company build products on behalf of other companies?",
  buildOwnProductTimePercentage:
    "What % of your time is spent building your own products?",
  trackTime:
    "Do you use time tracking software (eg. Microsoft TSheets) to track hours by individuals spent on specific R&D projects and tasks?",
  howRandDImproveProduct:
    "How does your R&D work this year improve your product, service, or internal process?",
  technicalUncertainties:
    "What type of technical uncertainties does your business face this year",
  processOfExperimentation:
    "How did your business follow a process of experimentation this year?",
  kindOfTechnicalProjects:
    "What kinds of technical projects did your company perform this year?",
  grantsUsedForRDExpense:
    "Has your company received government grants to pay for R&D expenses this year? ",
  grantOrigin: "Who was the grant from?",
  claimCreditOutsideMS:
    "Did you claim any of the following credits outside of MainStreet this year?",
  taxPreparer: "Who at your company is going to prepare your taxes this year?",
  taxPreparerEmail:
    "What's the email address of the person who will prepare your taxes this year?",
  taxFilingMonth:
    "What month do you plan to file your federal income taxes for this tax year?",
  sellTangibleProperty: "Do you sell tangible property in California?",
  currentYearTaxLiability: "Current Year Tax Liability",
  spend10kMoreCloudComputing:
    "Did you spend more than $10,000 on cloud computing services (eg. AWS) for development - not production - services?",
  cloudComputingSpendingPercentage:
    "Roughly what percentage of your cloud computing expenses is eligible for R&D?",
  serverUsagePurpose:
    "Select the option that best describes what these servers were used for",
  spend10kMoreRDSupplies:
    "Did you spend more than $10,000 on R&D eligible supplies (tangible items)?",
  RDsuppliesSpendingPercentage:
    "What percentage of these spendings was used for eligible R&D supplies?",
  suppliesUsageDescription:
    "Select the option that best describes what these supplies were used for",
  moreThanOneRDProject:
    "Does your business have one R&D project, or are you large enough to have multiple projects?",
  mainRDProjectDescription:
    "Which of the following options best describes your main R&D project?",
  mainProjectName: "What name would you give to your main project?",
  allEmployeeIncludedInTable:
    "Are all your company full-time, US-based employees included in this table?",
  allContractorsIncludedInTable:
    "Are all your company full-time, US-based contractors included in this table?",
  grantUsedForRandDSpending:
    "How much of the grant are you using to cover R&D expenses this tax year?",
  amountClaimedForEachTaxCredit: "How much did you claim for each credit?",
  acquiredCompDoRandD: "Do any of the acquired companies do R&D?",
  typeOfAcquisition: "What type of acquisition was it?",
  mostRecentAcquisition: "When did the most recent acquisition occur?",
  cloudVendorPurchase:
    "Add all your vendors and expenses on cloud computing services for this year",
  supplyVendorPurchase:
    "Add all vendors you use to purchase these supplies and the total amount spent this year with each of them",
  naicsCode: "What is your NAICS code?",
  georgiaPortionGrossReceipt:
    "Provide the Georgia portion of gross receipts for each of the prior three years",
};
