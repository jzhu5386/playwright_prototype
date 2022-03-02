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
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { generateRandomNumber, getCurrentYear } from "../../helpers/Utils";
import { getHrefLinkValue } from "../../helpers/GmailActions";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";

test.describe.serial(
  "Qualification Flow: Payroll Tax Credit label:SMOKE",
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
    let payrollConnection: string;
    let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
    let page: Page;

    const timestamp = Math.floor(Date.now() / 1000);
    let companyDetails: CompanyDetails;

    const employeeDetails: EmployeeDetails = {
      salaryLastMonth: 35000,
      firstPayrollMonth: "January",
      contractorsNotInPayRoll: "Yes",
      contractorPayrollSpending: 100000,
      developingNewProduct: "Yes",
      mostRAndDStates: ["California", "Massachusetts"],
      employeeCountJan: 5,
      expectedEmployeeCountDec: 5,
      technicalPercentage: "More than 50%",
    };

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
      ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
        context,
        page
      );
      opsPage = new OpsCompanyPage(page);
      payrollConnection = "ADP TotalSource";
      //QBS criteria: < 5 years of gross receipts and < 5Mthis year
      const currentYear = getCurrentYear();
      const qbsYear = generateRandomNumber(currentYear - 6, currentYear);
      companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
        timestamp: timestamp,
        yearofIncorporation: qbsYear,
      });
    });

    test("completing qualifying flow and reach QSB qualified state", async () => {
      newUser = await accountsPage.createDefaultNewAccount("QSB", timestamp);
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );

      // await loginPage.logIn('qamainstreet+QBS1642810130@gmail.com', 'Temp12345')
      await connectPayRollPage.makePayRollSelection({
        payRollName: payrollConnection,
      });
      await companyDetailPage.completeCompanyDetails({
        companyDetails: companyDetails,
      });
      await companyDetailPage.proceedToContinue();
      let employeeDtails =
        await employeePage.completeEmployeeDetailsBasedOnPayrollConnection(
          payrollConnection
        );
      await estimatePage.handleNoPayrollFoundQuestions(employeeDetails);
      await estimatePage.waitForEstimatePageLoadingComplete();
      await estimatePage.proceedToContinue();

      // await dashboardPage.navigateToTab('Dashboard')
      await dashboardPage.navigateToQualifyViaStartSaving();
      await qualifyingPage.completeQualifyingProcess();
      await randDActivities.handleRandDCreditType("QSB");
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
      await billingPage.handleAllSetPrompt();
      await billingPage.reviewAndAccept("Massachusetts Research Credit");
      await billingPage.handleAllSetPrompt(true);
    });

    test("set company program stage to Expense Classification and make sure user sees that link in dashboard", async () => {
      await loginPage.logIn(newUser.email, newUser.password);
      await opsPage.updateProgramStage();
      await opsPage.updateProgramSubstage();
      await page.reload();
      await dashboardPage.validateECLink();
      await dashboardPage.proceedToCreditClassification();
      await ecOverviewAndIntegrationsPage.validateConnectedState(
        true,
        payrollConnection
      );
    });
  }
);
