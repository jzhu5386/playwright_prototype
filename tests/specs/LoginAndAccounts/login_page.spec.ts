import { test, webkit } from "@playwright/test";
import { setupOpsLoginByPass } from "../../helpers/TokenHelpers";
import { LoginPage } from "../../pages/LoginPage";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";

test.describe("make sure user can login and logout", () => {
  let loginPage: LoginPage;
  let timestamp: number;

  test.beforeEach(async ({ page }, testInfo) => {
    // console.log(`Running: ${testInfo.title}`);
    loginPage = new LoginPage(page);
    timestamp = Math.floor(Date.now() / 1000);
  });

  test("user is able to login and logout of mainstreet site", async ({
    page,
  }) => {
    await loginPage.goto();
    await loginPage.logIn("julie.zhu+3@mainstreet.com", "bgtYHN%67");
    await loginPage.logOut();
  });
});
