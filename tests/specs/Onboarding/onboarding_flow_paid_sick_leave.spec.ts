import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { EmployeeDetails, User } from "../../helpers/TestObjects";
import { EmployeePage } from "../../pages/EmployeePage";
import { getCurrentYear } from "../../helpers/Utils";

test.describe("Onboarding Flow: Paid Slick Leave Label:SMOKE", () => {
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
    mostRAndDStates: ["Colorado"],
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
  test("with selection of qualified sick/family leave, found year more than 5 year, connected to Gusto, No to contractor outside payroll, we get more credits for hiring", async () => {
    let companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      yearofIncorporation: getCurrentYear() - 1,
    });
    companyDetails.redeemList = [
      "Tax Credit for Qualified Sick Leave Wages",
      "Tax Credit for Qualified Family Leave Wages",
    ];

    newUser = await accountsPage.createDefaultNewAccount("PaidSickLeave");
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );
    await connectPayRollPage.makePayRollSelection({
      payRollName: "Quickbooks",
    });
    await companyDetailPage.completeCompanyDetails({
      companyDetails: companyDetails,
    });

    await companyDetailPage.proceedToContinue();
    await employeePage.completeEmployeeDetailAfterFinch(employeeDetail);
    // await estimatePage.handleNoPayrollFoundQuestions(employeeDetail);
    const expectedItemizedEstimate = [""];

    const expectedTotal = [
      "$4,500–$5,000",
      "Federal R&D Tax Credit",
      "more credits coming soon",
      "hiring, training, covid relief, etc.",
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
