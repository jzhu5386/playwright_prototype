import { test } from "@playwright/test";
import { AlloyPage } from "../../pages/AlloyPage";

test.skip("Intenal clean up", () => {
  let alloyPage: AlloyPage;

  test("Attemps to clear out all the entities waiting for review", async ({
    page,
  }) => {
    // await loginPage.logIn(newUser.email, newUser.password);
    alloyPage = new AlloyPage(page);
    await alloyPage.logInAlloy();
    await alloyPage.approveAllDocs();
  });
});
