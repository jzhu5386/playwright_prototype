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

test.describe("Onboarding Flow: Disqualified label:SMOKE", () => {
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
  let newUser: User;
  let page: Page;

  const timestamp = Math.floor(Date.now() / 1000);

  const employeeDetails: EmployeeDetails = {
    salaryLastMonth: 10000,
    firstPayrollMonth: "January",
    contractorsNotInPayRoll: "No",
    contractorPayrollSpending: 0,
    developingNewProduct: "No", //answer no disqualifies R&D Tax Credits
    mostRAndDStates: ["Colorado"],
    employeeCountJan: 5,
    expectedEmployeeCountDec: 5,
    technicalPercentage: "Less than 50%",
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
  });

  test("When user enters info leading to Disqualified state for RD tax credit, they are redirected to dashboard after employee details", async () => {
    newUser = await accountsPage.createDefaultNewAccount(
      "disqualified",
      timestamp
    );
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );

    await connectPayRollPage.skipPayRollConnection();
    await companyDetailPage.completeCompanyDetails();
    await companyDetailPage.proceedToContinue();
    await employeePage.completeEmployeeDetailSkippedConnection(employeeDetails);
    // await estimatePage.proceedToContinue();
    await dashboardPage.validateDisqualifiedState();
  });
});
