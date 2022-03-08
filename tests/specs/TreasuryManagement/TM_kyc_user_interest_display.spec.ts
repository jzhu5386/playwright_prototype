import { test, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { TMPage } from '../../pages/TMPage';

test.describe(
  'Make sure user is earning interest and amount is displayed properly',
  () => {
    let dashboardPage: DashboardPage;
    let logInPage: LoginPage;
    let tmPage: TMPage;
    let page: Page;
    let context: BrowserContext;
    let timestamp: number;

    test.beforeAll(async ({ browser, baseURL }) => {
      context = await browser.newContext();
      page = await context.newPage();
      dashboardPage = new DashboardPage(page);
      logInPage = new LoginPage(page);
      tmPage = new TMPage(context, page);

      await logInPage.logIn(
        'qamainstreet+TMKYCEmails1646075555@gmail.com',
        'Temp12345',
        baseURL,
      );
      timestamp = 1646075555;
    });

    test.afterAll(async ({}) => {
      await page.close();
      await context.close();
    });

    test('From TM tab, check accrued interest amount and correlate that with Date transaction was complete', async () => {
      await dashboardPage.navigateToTab('Treasury Management');
      await tmPage.calculateInterest();
    });
  },
);
