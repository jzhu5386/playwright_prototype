import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AccountsPage } from '../../pages/AccountsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import {
  CompanyTokenInfo,
  TMCompanyInfo,
  User,
} from '../../helpers/TestObjects';
import {
  createNewUserAPI,
  setupUserToDashboard,
} from '../../helpers/OnboardingAPIActions';
import { getTokenByGivenTestSession } from '../../helpers/TokenHelpers';
import { getTimestamp } from '../../helpers/Utils';
import { OpsCompanyPage } from '../../pages/OpsCompanyPage';
import { TMPage } from '../../pages/TMPage';
import { BrowserFactory } from '../../helpers/BrowserFactory';

test.describe.serial('Treasury Management Flow label:SMOKE', () => {
  let dashboardPage: DashboardPage;
  let opsContext: BrowserContext;
  let opsPage: Page;
  let tmPage: TMPage;
  let newUser: User;
  let page: Page;
  let context: BrowserContext;
  let opsCompanyPage: OpsCompanyPage;
  let companyInfo: CompanyTokenInfo;
  let opsBrowser: BrowserFactory;
  let opsURL: string;
  let promissoryAmount: number;

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
      prefix: 'TMCompanyInfoONLY',
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

    // let alloyContext = await browser.newContext();
    // let alloyPageObject = await alloyContext.newPage();
    // alloyPage = new AlloyPage(alloyPageObject);
  });

  test.afterAll(async ({}) => {
    await apiContext.dispose();
    await opsBrowser.close();
    await page.close();
    await context.close();
  });

  test('only submit company info form, whhich puts user in KYC in review state, make sure we can return and continue', async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
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

    // this definitely takes abit to take affect to save copmpany info, so waiting for 5s in
    // this loading method
    await tmPage.loadingCompanyOwnerForm();

    await tmPage.exitTMVerificationFlow();

    // await page.waitForTimeout(2000);
    // check that we still see the start verification button and user can enter
    // company owner information afterwards
    await tmPage.validateCurrentActiveSteper(
      'Verify your company information and owners',
    );
    await tmPage.continueKYCFlow();
    await tmPage.validateOnCompanyOwnerPage();
    await tmPage.completeBeneficialOnwerForm({
      timestamp: timestamp,
    });
  });
});
