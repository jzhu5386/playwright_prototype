import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { EmployeeDetails, User } from "../../helpers/TestObjects";
import { EmployeePage } from "../../pages/EmployeePage";

test.describe.serial("Onboarding Flow: GA disqualified Label:SMOKE", () => {
  let connectPayRollPage: ConnectPayrollPage;
  let loginPage: LoginPage;
  let accountsPage: AccountsPage;
  let companyDetailPage: CompanyDetailPage;
  let employeePage: EmployeePage;
  let estimatePage: EstimatePage;
  let newUser: User;
  let page: Page;
  const timestamp = Math.floor(Date.now() / 1000);

  const employeeDetail: EmployeeDetails = {
    salaryLastMonth: 35000,
    firstPayrollMonth: "January",
    contractorsNotInPayRoll: "No",
    contractorPayrollSpending: 100000,
    developingNewProduct: "Yes",
    mostRAndDStates: ["Georgia", "Arizona"],
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
  });

  /**
   * For this test, we are using the 2020 for year of Incorporation question, that triggers more questions
   * after redeem list selection. See companyDetails object listed above. This test also skips finch connection
   */
  test("Geogria State tax is qualified because of 1065 tax type", async () => {
    let companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      yearofIncorporation: 2020,
    });
    companyDetails.redeemList = [
      "Tax Credit for Qualified Sick Leave Wages",
      "Tax Credit for Qualified Family Leave Wages",
    ];
    companyDetails.taxType = "As a partnership (I file form 1065)"; // this would disqualify AZ state tax
    newUser = await accountsPage.createDefaultNewAccount("skipPayRollGA");
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );
    await connectPayRollPage.skipPayRollConnection();
    await companyDetailPage.completeCompanyDetails({
      companyDetails: companyDetails,
    });
    await companyDetailPage.proceedToContinue();
    await employeePage.completeEmployeeDetailSkippedConnection(employeeDetail);

    const expectedItemizedEstimate = [
      "$16,200–$18,000",
      "Federal R&D Tax Credit",
      "$3,240–$3,600",
      "Georgia R&D Tax Credit",
    ];

    const expectedTotal = [
      "$19,440–$21,600",
      "Across 2 credits and incentives.",
    ];
    await estimatePage.validateCreditEstimateContent(
      companyDetails.buzName,
      expectedTotal,
      expectedItemizedEstimate
    );
    await estimatePage.proceedToContinue();
    await loginPage.logOut();
  });
});
