import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
  webkit,
} from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { DashboardPage } from "../../pages/DashboardPage";
import {
  CompanyTokenInfo,
  TMCompanyInfo,
  User,
} from "../../helpers/TestObjects";
import {
  createNewUserAPI,
  setCompanyDetailAPI,
  setEmployeeDetailsAPI,
  setPayrollConnectionAPI,
} from "../../helpers/OnboardingAPIActions";
import {
  getTokenByGivenTestSession,
  getTokenViaServiceAccount,
  setupOpsLoginByPass,
} from "../../helpers/TokenHelpers";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import {
  generateRandomNumber,
  getCurrentYear,
  getTimestamp,
} from "../../helpers/Utils";
import { EmployeePage } from "../../pages/EmployeePage";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { TMPage } from "../../pages/TMPage";
import { AlloyPage } from "../../pages/AlloyPage";

test.describe.serial("Treasury Management Flow label:SMOKE", () => {
  let dashboardPage: DashboardPage;
  let opsContext: BrowserContext;
  let opsPage: Page;
  let tmPage: TMPage;
  let newUser: User;
  let page: Page;
  let context: BrowserContext;
  let opsCompanyPage: OpsCompanyPage;
  let companyInfo: CompanyTokenInfo;
  let alloyPage: AlloyPage;

  const timestamp = getTimestamp();
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright, browser, baseURL, headless }) => {
    context = await browser.newContext();
    page = await context.newPage();
    let accountsPage = new AccountsPage(page);
    tmPage = new TMPage(context, page);
    let logIn = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: baseURL,
    });

    newUser = accountsPage.buildDefaultUserInfo({
      prefix: "TMCompanyInfoONLY",
      timestamp: timestamp,
    });
    let companyId = await createNewUserAPI(apiContext, newUser);

    await logIn.logIn(newUser.email, newUser.password);
    companyInfo = await getTokenByGivenTestSession(page);
    // const jwtToken = await getTokenViaServiceAccount();
    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: baseURL,
      extraHTTPHeaders: {
        baseURL: baseURL!,
        Authorization: companyInfo.token,
      },
    });

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
    let opsBrowser = await webkit.launch({
      headless: headless,
      slowMo: 120,
    });
    opsContext = await opsBrowser.newContext({
      viewport: { width: 1460, height: 800 },
    });
    opsPage = await opsContext.newPage();
    let url = "https://ops.staging.mainstreet.com";
    opsPage = await setupOpsLoginByPass(opsPage, url);
    await opsPage.goto(url);
    opsCompanyPage = new OpsCompanyPage(opsPage);
    await opsCompanyPage.navigateToCompanyDetailPage(newUser.email);
    await opsCompanyPage.createPromissoryNote({
      amount:
        generateRandomNumber(1, 25) * 1000000 + Number(companyInfo.companyId),
    });
    await opsCompanyPage.enableTreasuryManagment(newUser.email);
    await page.goto(baseURL!);

    // let alloyContext = await browser.newContext();
    // let alloyPageObject = await alloyContext.newPage();
    // alloyPage = new AlloyPage(alloyPageObject);
  });

  test.afterAll(async ({}) => {
    await apiContext.dispose();
  });

  test("only submit company info form, whhich puts user in KYC in review state, make sure we can return and continue", async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
    await dashboardPage.goto();
    await dashboardPage.navigateToTab("Treasury Management");
    await tmPage.kickOffKycFlow();
    let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm({
      timestamp: timestamp,
    });
    await tmPage.uploadAccreditationDocuments();
    await tmPage.submitCompanyForm();
    await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
    await tmPage.proceedToContinue();

    // this definitely takes abit to take affect to save copmpany info, so waiting for 5s in
    // this loading method
    await tmPage.loadingCompanyOwnerForm();

    await tmPage.exitTMVerificationFlow();
    // await dashboardPage.navigateToTab("Treasury Management");
    // await page.reload();
    // // check that we still see the start verification button and user can enter
    // // company owner information afterwards
    // await tmPage.kickOffKycFlow();
    // await tmPage.completeBeneficialOnwerForm({
    //   timestamp: timestamp,
    //   denied: true,
    // });

    await opsCompanyPage.updateKYCStatusforCompany("in_review");
  });
});
