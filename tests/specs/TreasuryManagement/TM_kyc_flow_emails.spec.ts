import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
  firefox,
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
import { getHrefLinkValue } from "../../helpers/GmailActions";
import { transferFunds } from "../../helpers/ExternalAPIHelpers";

test.describe.serial("Treasury Management Flowlabel:SMOKE", () => {
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
  let promissoryAmount: number;

  let timestamp = getTimestamp();
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
      prefix: "TMKYCEmails",
      timestamp: timestamp,
    });
    let companyId = await createNewUserAPI(apiContext, newUser);

    console.log(newUser.firstName, newUser.lastName);
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

    let opsBrowser = await firefox.launch({
      headless: headless,
      slowMo: 120,
    });
    opsContext = await opsBrowser.newContext({
      viewport: { width: 1460, height: 800 },
    });
    timestamp = 1645587748;

    opsPage = await opsContext.newPage();
    let url = "https://ops.staging.mainstreet.com";
    opsPage = await setupOpsLoginByPass(opsPage, url);
    await opsPage.goto(url);
    opsCompanyPage = new OpsCompanyPage(opsPage);
    await opsCompanyPage.navigateToCompanyDetailPage(newUser.email);
    promissoryAmount = await opsCompanyPage.createPromissoryNote({
      amount:
        generateRandomNumber(1, 25) * 1000000 + Number(companyInfo.companyId),
    });
    await opsCompanyPage.enableTreasuryManagment(newUser.email);

    const q: string = `subject: MainStreet High Yield: The wait is over - let’s get started!, to: ${newUser.email}`;
    const verifyLink: string = await getHrefLinkValue(
      "qamainstreet@gmail.com",
      q,
      'a[href*="treasury-management"]'
    );
    await page.goto(verifyLink);

    let alloyContext = await browser.newContext();
    let alloyPageObject = await alloyContext.newPage();
    alloyPage = new AlloyPage(alloyPageObject);
  });

  test.afterAll(async ({}) => {
    // await apiContext.dispose();
  });

  test("Check all three client side emails and make sure we can navigate from email link", async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
    // await dashboardPage.goto();
    // await dashboardPage.navigateToTab("Treasury Management");
    await tmPage.kickOffKycFlow();
    let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm({
      timestamp: timestamp,
    });
    await tmPage.uploadAccreditationDocuments();
    await tmPage.submitCompanyForm();
    await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
    await tmPage.proceedToContinue();
    await tmPage.completeBeneficialOnwerForm({ timestamp: timestamp });
    await tmPage.certifyAndSubmitBeneficialOnwerForm();
    await tmPage.returnToDashBoardAfterSubmission();

    await alloyPage.logInAlloy();
    await alloyPage.approveDocs(tmCompanyInfo.legalName);

    // TODO: it was taking a bit for the email to be sent, waitig on the fix
    // let q: string = `subject: You're Approved!, to: ${newUser.email}`;
    // let verifyLink: string = await getHrefLinkValue(
    //   "qamainstreet@gmail.com",
    //   q,
    //   'a[href*="reasury-management"]'
    // );
    // await page.goto(verifyLink);

    //await tmPage.approveCreditForUser();
    // this is where we need to manually approve all docs uploaded
    await opsCompanyPage.updateKYCStatusforCompany();
    // await page.goto(verifyLink);
    await tmPage.reviewDocuments();
    await tmPage.completeDocSign(timestamp);
    await tmPage.validateWireTransferInstruction();

    // TODO: modern treasury is no longer auto-reconciling on sandbox, so need to
    // further investigate how to work this one out
    await transferFunds(promissoryAmount);
    let q = `subject: Hi, yields! to: ${newUser.email} "${newUser.firstName}"`;
    let verifyLink = await getHrefLinkValue(
      "qamainstreet@gmail.com",
      q,
      'a[href*="reasury-management"]'
    );
    await page.goto(verifyLink);
    await tmPage.validateHighYieldAccountView(promissoryAmount, "Completed");
  });
});
