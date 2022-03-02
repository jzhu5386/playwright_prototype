import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { QualifyPage } from "../../pages/QualifyPage";
import { EmployeePage } from "../../pages/EmployeePage";
import { DashboardPage } from "../../pages/DashboardPage";
import { RandDActivitiesPage } from "../../pages/RandDActivitiesPage";
import {
  CompanyDetails,
  EmployeeDetails,
  QualifyingAnswers,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { getCurrentYear } from "../../helpers/Utils";
import { getHrefLinkValue } from "../../helpers/GmailActions";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import {
  updateProgramStage,
  updateProgramSubstage,
} from "../../helpers/OpsHelpers";
import { getTokenByGivenTestSession } from "../../helpers/TokenHelpers";

test.describe.serial(
  "Qualification Flow: Income Tax Credit + disqualified MA tax Credit label:SMOKE",
  () => {
    let connectPayRollPage: ConnectPayrollPage;
    let loginPage: LoginPage;
    let accountsPage: AccountsPage;
    let companyDetailPage: CompanyDetailPage;
    let employeePage: EmployeePage;
    let estimatePage: EstimatePage;
    let dashboardPage: DashboardPage;
    let qualifyingPage: QualifyPage;
    let randDActivities: RandDActivitiesPage;
    let billingPage: BillingPage;
    let opsPage: OpsCompanyPage;
    let newUser: User;
    let page: Page;

    const timestamp = Math.floor(Date.now() / 1000);
    let companyDetails: CompanyDetails;
    let qualificationAnswer: QualifyingAnswers;

    test.beforeEach(async ({ context }, testInfo) => {
      // console.log(`Running: ${testInfo.title}`);
      page = await context.newPage();
      loginPage = new LoginPage(page);
      accountsPage = new AccountsPage(page);
      connectPayRollPage = new ConnectPayrollPage(context, page);
      companyDetailPage = new CompanyDetailPage(page);
      employeePage = new EmployeePage(page);
      estimatePage = new EstimatePage(page);
      dashboardPage = new DashboardPage(page);
      qualifyingPage = new QualifyPage(page);
      billingPage = new BillingPage(page);
      randDActivities = new RandDActivitiesPage(page);
      opsPage = new OpsCompanyPage(page);
      companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
        timestamp: timestamp,
        yearofIncorporation: getCurrentYear() - 8,
      });
      companyDetails.redeemList = [
        "Massachusetts life sciences credit", // by selecting this we would disqualify MA RD credit
        "Tax Credit for Qualified Sick Leave Wages",
        "Tax Credit for Qualified Family Leave Wages",
      ];
      qualificationAnswer = qualifyingPage.buildDefaultQualifyingAnswer(
        getCurrentYear() - 8
      );
      qualificationAnswer.expectOweIncomeTax = "Yes";
      qualificationAnswer.expectMoreThan5MnextYear = "Yes";
      qualificationAnswer.expectMoreThan5MthisYear = "Yes";
    });

    test("Complete Qualification flow for Income Tax Credit and Proceed to Review and Accept using email link", async () => {
      newUser = await accountsPage.createDefaultNewAccount("GB", timestamp);
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );

      // await loginPage.logIn('qamainstreet+QSB1642833461@gmail.com', 'Temp12345')
      await connectPayRollPage.makePayRollSelection({
        payRollName: "Rippling",
      });
      await companyDetailPage.completeCompanyDetails({
        companyDetails: companyDetails,
      });
      await companyDetailPage.proceedToContinue();
      let employeeDetails: EmployeeDetails =
        await employeePage.completeEmployeeDetailAfterRippling();
      // await estimatePage.handleNoPayrollFoundQuestions(employeeDetails);
      await estimatePage.waitForEstimatePageLoadingComplete();
      await estimatePage.proceedToContinue();

      // await dashboardPage.navigateToTab('Dashboard')
      await dashboardPage.navigateToQualifyViaStartSaving();
      await qualifyingPage.completeQualifyingProcess(qualificationAnswer);
      await randDActivities.handleRandDCreditType("general");
      await randDActivities.completeRandDActivitiesQuestions();
      await randDActivities.completeFinalizingQualifyingQuestions();
      await randDActivities.proceedToReview();
    });

    test("Complete review and billing 2021 Federal R&D Tax Credit order via email", async () => {
      const q: string = `subject: ${companyDetails.dba}'s 2021 Federal R&D Tax Credit order details are ready, to: ${newUser.email}`;
      const billingLink: string = await getHrefLinkValue(
        "qamainstreet@gmail.com",
        q,
        'a[href*="billing"]'
      );
      await loginPage.logIn(newUser.email, newUser.password, billingLink);
      await billingPage.accecptOrder();
      await billingPage.handleAllSetPrompt();

      await billingPage.reviewAndAccept("California Research Credit");
      await billingPage.handleAllSetPrompt(true);
    });

    test("set company program stage to Expense Classification and make sure user sees that link in dashboard", async () => {
      await loginPage.logIn(newUser.email, newUser.password);
      const tokenInfo = await getTokenByGivenTestSession(page);
      await updateProgramStage(
        tokenInfo.programId!,
        tokenInfo.token,
        page.url()
      );
      await updateProgramSubstage(
        tokenInfo.programId!,
        tokenInfo.token,
        page.url()
      );
      await page.reload();
      await dashboardPage.validateECLink();
    });
  }
);
