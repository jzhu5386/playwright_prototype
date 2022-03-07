import { test, Page, BrowserContext } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TMPage } from "../../pages/TMPage";

test.describe(
  "From user on company detail form, check all required fields are flagged for errors when missing",
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
        "qamainstreet+TMKYCEmails1646457067@gmail.com",
        "Temp12345",
        baseURL
      );
      timestamp = 1646457067;
    });

    test.afterAll(async ({}) => {});

    test("From user on Beneficial form, check all required fields are flagged for errors when missing", async () => {
      await dashboardPage.navigateToTab("Treasury Management");
      await tmPage.kickOffKycFlow();

      let tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.EIN = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.uploadAccreditationDocuments();
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: ein number"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.city = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: for address - city"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.companyPhone = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: valid phone number"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.legalName = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: name"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.street = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: for address - street"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.zip = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: for address - postal code"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.country = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: for address - country"
      );

      tmCompanyDetail = TMPage.buildDefaultTMCompanyInfo(timestamp);
      tmCompanyDetail.state = "";
      await tmPage.completKYCCompanyInfoForm({
        tmCompanyInfo: tmCompanyDetail,
      });
      await tmPage.submitCompanyForm(
        "Please fill out missing company information: for address - state"
      );
    });
  }
);
