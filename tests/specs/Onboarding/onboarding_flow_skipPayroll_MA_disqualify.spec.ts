import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { EmployeeDetails, User } from "../../helpers/TestObjects";
import { EmployeePage } from "../../pages/EmployeePage";

test.describe(
  "Onboarding Flow: No PayRoll Connection and MA disqualified Label: SMOKE",
  () => {
    let connectPayRollPage: ConnectPayrollPage;
    let loginPage: LoginPage;
    let accountsPage: AccountsPage;
    let companyDetailPage: CompanyDetailPage;
    let employeePage: EmployeePage;
    let estimatePage: EstimatePage;
    let newUser: User;
    let page: Page;
    const timestamp = Math.floor(Date.now() / 1000);

    const employeeDetails: EmployeeDetails = {
      salaryLastMonth: 35000,
      firstPayrollMonth: "January",
      contractorsNotInPayRoll: "No",
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
    });

    /**
     * For this test, we are using the 2020 for year of Incorporation question, that triggers more questions
     * after redeem list selection. See companyDetails object listed above. This test also skips finch connection
     */
    test("onboarding flow with MA state tax desqualified", async () => {
      let companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
        yearofIncorporation: 2020,
      });
      companyDetails.redeemList = [
        "Massachusetts life sciences credit", // by selecting this we would disqualify MA RD credit
        "Tax Credit for Qualified Sick Leave Wages",
        "Tax Credit for Qualified Family Leave Wages",
      ];
      newUser = await accountsPage.createDefaultNewAccount("manualAddCAL");
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );
      await connectPayRollPage.makePayRollSelection({
        payRollName: "Add manually",
        fileToUpload: ["sampleData.pdf", "sampleData2.pdf"],
      });
      await companyDetailPage.completeCompanyDetails({
        companyDetails: companyDetails,
      });
      await companyDetailPage.proceedToContinue();
      await employeePage.completeEmployeeDetailSkippedConnection(
        employeeDetails
      );
      const expectedItemizedEstimate = [
        "$16,200–$18,000",
        "Federal R&D Tax Credit",
        "$2,430–$2,700",
        "California Research Credit",
      ];

      const expectedTotal = [
        "$18,630–$20,700",
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
  }
);
