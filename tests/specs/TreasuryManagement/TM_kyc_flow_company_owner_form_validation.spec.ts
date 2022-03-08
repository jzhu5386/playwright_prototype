import { test, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { TMPage } from '../../pages/TMPage';

test.describe(
  'From user on company owner form, check all required fields are flagged for errors when missing',
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
        'qamainstreet+TMCompanyInfoONLY1646452206@gmail.com',
        'Temp12345',
        baseURL,
      );
      timestamp = 1646452206;
    });

    test.afterAll(async ({}) => {
      await page.close();
      await context.close();
    });

    test('From user on Beneficial form, check all required fields are flagged for errors when missing', async () => {
      await dashboardPage.navigateToTab('Treasury Management');
      await tmPage.continueKYCFlow();
      let companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].birthday = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg: 'Please fill out missing personal information: date of birth',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].phone = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg: 'Please fill out missing personal information: phone number',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].city = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: for address - city',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].street = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: for address - street',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].zip = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: for address - postal code',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].ownership = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: ownership percentage',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].ssn = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg: 'Please fill out missing personal information: social security',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].email = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: valid email address',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].firstName = '';
      companyOwner[0].lastName = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: first name, last name',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].state = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: for address - state',
      });

      companyOwner = TMPage.buildDefaultTMBeneficialOwners(1, timestamp);
      companyOwner[0].country = '';
      await tmPage.completeBeneficialOnwerForm({
        companyOnwers: companyOwner,
        errMsg:
          'Please fill out missing personal information: for address - country',
      });
    });
  },
);
