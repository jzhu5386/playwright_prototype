import { test, firefox, chromium, webkit } from "@playwright/test";
import { getTokenViaServiceAccount } from "../../helpers/TokenHelpers";

test("user is able to login and logout of mainstreet site", async ({}) => {
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const jwtToken = await getTokenViaServiceAccount(
    "https://remove-the-10k-limit-dashboard.preview.sandbox.mainstreet.com/welcome"
  );
  console.log(jwtToken);
  await page.setExtraHTTPHeaders({
    "proxy-authorization": jwtToken,
  });
  await page.goto(
    //"https://ops.staging.mainstreet.com"
    "https://remove-the-10k-limit-dashboard.preview.sandbox.mainstreet.com/welcome"
  );
  console.log(jwtToken);
});
