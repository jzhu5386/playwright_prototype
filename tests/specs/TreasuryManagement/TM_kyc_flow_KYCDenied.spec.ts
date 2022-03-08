import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
  webkit,
} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AccountsPage } from '../../pages/AccountsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import {
  CompanyOwner,
  CompanyTokenInfo,
  TMCompanyInfo,
  User,
} from '../../helpers/TestObjects';
import {
  createNewUserAPI,
  setCompanyDetailAPI,
  setEmployeeDetailsAPI,
  setPayrollConnectionAPI,
  setupUserToDashboard,
} from '../../helpers/OnboardingAPIActions';
import {
  getTokenByGivenTestSession,
  getTokenViaServiceAccount,
  setupOpsLoginByPass,
} from '../../helpers/TokenHelpers';
import { CompanyDetailPage } from '../../pages/CompanyDetailPage';
import {
  generateRandomNumber,
  getCurrentYear,
  getTimestamp,
} from '../../helpers/Utils';
import { EmployeePage } from '../../pages/EmployeePage';
import { OpsCompanyPage } from '../../pages/OpsCompanyPage';
import { TMPage } from '../../pages/TMPage';
import { AlloyPage } from '../../pages/AlloyPage';
import { BrowserFactory } from '../../helpers/BrowserFactory';

test.describe.serial('Treasury Management Flow label:SMOKE', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let opsBrowser: BrowserFactory;
  let opsURL: string;
  let promissoryAmount: number;
  let alloyContext: BrowserContext;
  let alloyPageObject: Page;
  let opsPage: Page;
  let tmPage: TMPage;
  let newUser: User;
  let page: Page;
  let context: BrowserContext;
  let opsCompanyPage: OpsCompanyPage;
  let companyInfo: CompanyTokenInfo;
  let alloyPage: AlloyPage;
  let companyOwner: CompanyOwner[];

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
      prefix: 'TMKYCDenied',
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

    await setupUserToDashboard(apiContext, timestamp);
    await page.goto(baseURL!);

    // create a dedicated browser window just for ops tool
    opsURL = baseURL
      ? baseURL.replace('dashboard.', 'ops.')
      : 'https://ops.staging.mainstreet.com';
    opsBrowser = new BrowserFactory(opsURL, 'webkit', headless!);
    await opsBrowser.setupBrowserForOps();
    opsPage = opsBrowser.page!;
    await opsPage.goto(opsURL);
    opsCompanyPage = new OpsCompanyPage(opsPage);
    promissoryAmount = await opsCompanyPage.setUserUpForTM(newUser, companyId);

    alloyContext = await browser.newContext();
    alloyPageObject = await alloyContext.newPage();
    alloyPage = new AlloyPage(alloyPageObject);
  });

  test.afterAll(async ({}) => {
    await apiContext.dispose();
    await opsBrowser.close();
    await alloyPageObject.close();
    await alloyContext.close();
    await page.close();
    await context.close();
  });

  test('Trigger Denied state in KYC and user sees proper message from UI', async () => {
    await dashboardPage.goto();
    await dashboardPage.navigateToTab('Treasury Management');
    await tmPage.kickOffKycFlow();
    let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm({
      timestamp: timestamp,
    });
    await tmPage.uploadAccreditationDocuments();
    await tmPage.submitCompanyForm();
    await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
    await tmPage.proceedToContinue();
    companyOwner = await tmPage.completeBeneficialOnwerForm({
      timestamp: timestamp,
      denied: true,
    });
    await tmPage.certifyAndSubmitBeneficialOnwerForm();
    await tmPage.returnToDashBoardAfterSubmission();

    await opsCompanyPage.updateKYCStatusforCompany('rejected');
    await tmPage.validateKYCverificationFailed();

    await alloyPage.logInAlloy();
    await alloyPage.approveDocs({
      entityName: tmCompanyInfo.legalName,
    });
    await alloyPage.approveDocs({
      entityName: `${companyOwner[0].firstName} ${companyOwner[0].lastName}`,
      type: 'individual',
    });

    await opsCompanyPage.updateKYCStatusforCompany('approved');
    await tmPage.reload();
    await tmPage.validateStepIsComplete(
      'Verify your company information and owners',
    );
  });
});
