import { APIRequestContext, Page, expect } from "@playwright/test";
import { CompanyDetailPage } from "../pages/CompanyDetailPage";
import { EmployeePage } from "../pages/EmployeePage";
import {
  CompanyDetails,
  CompanyTokenInfo,
  EmployeeDetails,
  User,
} from "./TestObjects";
import { getCurrentYear } from "./Utils";

export async function createNewUserAPI(
  apiContext: APIRequestContext,
  newUser: User
): Promise<string> {
  const response = await apiContext.post("/api/v1/auth/signup", {
    data: {
      primaryUserEmail: newUser.email,
      primaryUserFirstName: newUser.firstName,
      primaryUserLastName: newUser.lastName,
      adminPassword: newUser.password,
      adminPasswordConfirmation: newUser.confirmPassword,
      referrer: "",
      creditCategories: [],
      procurement: false,
    },
  });
  expect(response.ok()).toBeTruthy();
  const userInfo = await response.json();
  console.log(
    `created new user: ${userInfo.data.company.adminEmail}, ${userInfo.data.company.id}, ${userInfo.data.firstName}`
  );
  return userInfo.data.company.id;
}

export async function setPayrollConnectionAPI(
  apiContext: APIRequestContext,
  payrollName: string
) {
  let response = await apiContext.put("/api/v1/company/payroll-system", {
    data: { payrollSystemId: payrollName },
  });
  expect(response.ok()).toBeTruthy;
}

export async function setCompanyDetailAPI(
  apiContext: APIRequestContext,
  companyDetails: CompanyDetails
) {
  const response = await apiContext.put("/api/v1/company/details", {
    data: {
      adminJobTitle: companyDetails.companyRole,
      avgMonthlyRevLessThan80k: "cko1vhf488xt90b3020aodbfq",
      avgMonthlyRevLessThan80k2020: null,
      businessType: "LLC",
      businessPhoneNumber: "(789) 768-4654",
      creditsSelected: ["cknqfyh5kiu4k0c328jngiq46"],
      doingBusinessAs: companyDetails.dba,
      fiscalYearEndDate: "December",
      foundedAfterMinDate: null,
      industry: companyDetails.industry,
      legalName: companyDetails.buzName,
      qualificationTaxYear: getCurrentYear() - 1,
      secondaryEmail: "automation@gmail.com",
      taxType: "personal",
      website: companyDetails.website,
      yearFounded: companyDetails.yearOfIncorporation,
    },
  });
  expect(response.ok()).toBeTruthy;
  // console.log(await response.status());
}

export async function setEmployeeDetailsAPI(
  apiContext: APIRequestContext,
  employeeDetails: EmployeeDetails
) {
  const response = await apiContext.put("api/v1/company/employee-details", {
    data: {
      doesEmploySoftwarePeople: employeeDetails.developingNewProduct,
      mostEmployeeStates: employeeDetails.mostRAndDStates,
      fedRdBasePercentage: employeeDetails.technicalPercentage,
      payrollEstimateCents: employeeDetails.contractorPayrollSpending,
      nonPayrollEstimateCents: 0,
      startingPayrollMonth: 1,
      qualificationTaxYear: getCurrentYear() - 1,
      currentEmployeeCount: employeeDetails.employeeCountJan,
      yearEndEmployeeCount: 0,
    },
  });
  expect(response.ok()).toBeTruthy;
  // console.log(await response.status());
}

export async function setCompanyQualificationAPI(
  apiContext: APIRequestContext,
  companyId: string,
  payload: any
) {
  // this set of answers are currently qualifying for Payroll Tax
  const response = await apiContext.put(
    `api/v1/company/${companyId}/survey/company_qualification`,
    {
      data: payload,
    }
  );
  expect(response.ok()).toBeTruthy;
  // console.log(await response.status());
}

export async function handleQualificationQuestionSets(
  apiContext: APIRequestContext,
  companyId: string
) {
  const payloads = [
    {
      taxYear: 2021,
      qualificationQuestions: {
        ckgij0c7s0zny0a74fn7ljlc6: "ckgs2mhu039w70b27myarddrz",
        ckgij1tgg0zrh0a67jclfz173: "2021",
        ckgij1soo0zrv0a74xmmxz35s: "ckgs2o2xk3a060b25djyo3yrd",
        ckif2zhwg01ny0a251aqjn88a: "ckif300f401p60a141v5cvzxy",
        ckgij1qdc0zr90a26pxicagh4: "ckgs2nl6o3a000a827r17rulm",
        ckrmh2stk5y7i0c75myozp6io: "ckrml1qnk6zn10b20sc0dtz6w",
        cktj27lqg1zw40b705t0n2zrk: "cktj29bgo205d0b70ojmmdbuv",
        ckre0sk74ibur0a29rl3kr0ce: "ckre0r7l4ibof0a29vvt8t05y",
        ckrp0x2a82tqb0b26x2b71r6f: "cpa name",
        ckrp0xj9c2ttw0b2690946a4q: "wonderemail@gmail.com",
      },
    },
    {
      taxYear: 2021,
      qualificationQuestions: {
        ckgij2hdk0ztt0a749q6qaw0y: "ckgs2oei83a0w0b25wv1r55ds",
        ckgij2sy80zu70b176xwsokxx: "make this happen",
        ckgij3fbs0zw30a74m7wdhred: "ckgij6xvc104m0a6784314bgr",
        ckgijbai810hf0b17qvzt3hmr: "ckgijaml410fg0a266bsh8dmj",
        ckgijgo6g10xa0a74oocdk38r: "ckgs2pk683a360b27gwd514jq",
        ckgijgxfs10xo0a26t7f0t8yd: "ckspk2ttcbcgv0b64mrky7y3d",
        ckrl4a7xst6890c654vcqq3h7: "ckrl561rstmku0c75v4fd47pz",
        ckrmejwg05am00b202mvbu0cb: [],
      },
    },
    {
      taxYear: 2021,
      qualificationQuestions: {
        ckqmpk0qgkkjq0c75ys8010ob: ["ckqmpj53kkkd80c751qrd8837"],
      },
    },
    {
      taxYear: 2021,
      qualificationQuestions: {
        ckqmtwf4wlvob0b27lvvrk6sr: [
          "ckqmtve3kln0n0a67vimajim2",
          "ckqmtvl1klvft0b27jxv3x9k0",
        ],
      },
    },
    {
      taxYear: 2021,
      qualificationQuestions: {
        ckqmpgdk8k8an0a67so892y08: ["ckqmpf1q0kewi0b27cs3a8oyk"],
      },
    },
  ];
  for (let i = 0; i < payloads.length; i++) {
    await setCompanyQualificationAPI(apiContext, companyId, payloads[i]);
  }
}

export async function irsTestPartFourAPI(apiContext: APIRequestContext) {
  const response = await apiContext.put(
    "api/v1/company/qualification/irs-test-part-four",
    {
      data: {
        ckqla1uqg7dgv0c69yrv1vx1n: [
          "ckql9zwio73820a67cevb1hyb",
          "ckql9yw9479ti0c75ffl66d7x",
        ],
        programTaxYear: 2021,
      },
    }
  );
  expect(response.ok()).toBeTruthy;
  // console.log(await response.json());
}

export async function extractProgramIDAPI(
  apiContext: APIRequestContext
): Promise<string> {
  const response = await apiContext.get("/api/company/current");
  const res = await response.json();
  const programId = res.data.company.programs[1].id;
  return programId;
}

export async function setProgramStageAPI(
  apiContext: APIRequestContext,
  programId: string,
  programStage: string
) {
  const response = await apiContext.put("/api/v1/program/program-stage", {
    data: {
      programId: programId,
      programStage: programStage,
    },
    params: {
      withCredentials: true,
    },
  });
  expect(response.ok()).toBeTruthy;
  // console.log(await response.status());
}

export async function setProgramSubStageAPI(
  apiContext: APIRequestContext,
  programId: string,
  programSubStage: string
) {
  const response = await apiContext.put("/api/v1/program/program-substage", {
    data: {
      programId: programId,
      programSubStage: programSubStage,
    },
    params: {
      withCredentials: true,
    },
  });
  expect(response.ok()).toBeTruthy;
  // console.log(await response.status());
}

/**
 * this is a wrapper method that assumes we already have apicontext
 * that can be used for making api calls. then we make all desired calls
 * up to the point user has completed qualification questions for QSB qualification
 * then set program stages to open EC classification flow.
 * @param apiContext
 * @param employeeDetail
 * @param companyInfo
 * @param timestamp
 */
export async function setupUserInECState(
  apiContext: APIRequestContext,
  employeeDetail: EmployeeDetails,
  companyInfo: CompanyTokenInfo,
  timestamp: number
) {
  await setPayrollConnectionAPI(apiContext, "Gusto");
  await setCompanyDetailAPI(
    apiContext,
    CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
      yearofIncorporation: getCurrentYear() - 3,
    })
  );
  await setEmployeeDetailsAPI(apiContext, employeeDetail);
  await handleQualificationQuestionSets(apiContext, companyInfo.companyId);
  await irsTestPartFourAPI(apiContext);
  const programId = await extractProgramIDAPI(apiContext);
  await setProgramStageAPI(apiContext, programId, "expense_classification");
  await setProgramSubStageAPI(
    apiContext,
    programId,
    "expense_classification_overview"
  );
}

/**
 * this is a wrapper method that assumes we already have apicontext
 * that can be used for making api calls. then we make all desired calls
 * up to the point user has reached dashboard
 * @param apiContext
 * @param timestamp
 */
export async function setupUserToDashboard(
  apiContext: APIRequestContext,
  timestamp: number
) {
  await setPayrollConnectionAPI(apiContext, "Gusto");
  await setCompanyDetailAPI(
    apiContext,
    CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
      yearofIncorporation: getCurrentYear() - 3,
    })
  );
  await setEmployeeDetailsAPI(
    apiContext,
    EmployeePage.buildDefaultEmployeeDetails()
  );
}
