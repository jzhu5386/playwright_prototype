import { expect, Frame, FrameLocator, Locator, Page } from "@playwright/test";
import credentials from "../resources/testAccounts/external_credentials.json";

export class AlloyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async logInAlloy() {
    await this.page.goto("https://app.alloy.co/login/");
    await this.page.fill("#id_email", credentials.alloy_sandbox.username);
    await this.page.fill("#id_password", credentials.alloy_sandbox.password);
    await this.page.click("#sign-in > button");
  }

  async approveDocs(
    entityName: string,
    status: "review" | "approve" | "deny" | "resubmit" = "approve"
  ) {
    await this.page.click('svg[class="icon entities-icon"]');
    await this.page.waitForTimeout(3000);
    await this.page.click(
      `td[class="entity_name-cell "]:text-is("${entityName}")`
    );
    await this.page.waitForTimeout(3000);
    await this.page.click(
      'div:has-text("Corporate Investor Accreditation") a[href*="review"]'
    );
    await this.page.waitForTimeout(2000);
    let outcome = "Approved";
    let reason = "Approved- Other";
    if (status === "review") {
      outcome = "Manual Review";
      reason = "Manual Review- Other";
    } else if (status === "deny") {
      outcome = "Denied";
      reason = "Denied- Other";
    } else if (status === "resubmit") {
      outcome = "Resubmit Document";
      reason = "Manual Review- Other";
    }

    await this.page.locator('button[id*="review"]').waitFor();
    await this.page.click('button[id*="review"]');
    await this.page.click("#customer_outcome");
    await this.page.click(`div[id*="react-select"]:text-is("${outcome}")`);
    await this.page.click("#customer_reason");
    await this.page.click(`div[id*="react-select"]:text-is("${reason}")`);
    await this.page.fill('textarea[name="review_notes"]', entityName);
    await this.page.click('#manual-review-form button[type="submit"]');
    await this.page.click("div.completed-review button");
  }

  async approveAllDocs() {
    let i = 20;
    while (i > 0) {
      await this.page.click('svg[class="icon entities-icon"]');
      await this.page.waitForTimeout(3000);
      await this.page.click(
        'div[class*="flex start align-end"] div:nth-child(4) button:nth-child(1)'
      );
      await this.page.waitForTimeout(2000);
      await this.page.click(
        'button[class*="dropdown-item"] span:text-is("Manual Review")'
      );

      await this.page.waitForTimeout(4000);
      let entityName = "Manual Review";

      // await this.page.click('svg[class="icon entities-icon"]');
      // await this.page.waitForTimeout(3000);
      await this.page.click(
        `td[class="outcome-cell "] span:text-is("${entityName}")`
      );
      let outcome = "Approved";
      let reason = "Approved- Other";
      // await this.page.click(
      //   `td[class="entity_name-cell "] span:text-is("${entityName}")`
      // );
      await this.page.waitForTimeout(3000);
      await this.page.waitForSelector('a[href*="review"]');
      await this.page.locator('a[href*="review"]').first().click();
      await this.page.locator('button[id*="review"]').waitFor();
      await this.page.click('button[id*="review"]');
      await this.page.click("#customer_outcome");
      await this.page.click(`div[id*="react-select"]:text-is("${outcome}")`);
      await this.page.click("#customer_reason");
      await this.page.click(`div[id*="react-select"]:text-is("${reason}")`);
      await this.page.fill('textarea[name="review_notes"]', entityName);
      await this.page.click('#manual-review-form button[type="submit"]');
      await this.page.click("div.completed-review button");
      await this.page.waitForTimeout(2000);
      i--;
    }
  }
}
