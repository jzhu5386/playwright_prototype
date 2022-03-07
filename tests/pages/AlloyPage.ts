import { Page } from "@playwright/test";
import { CompanyOwner } from "../helpers/TestObjects";
import credentials from "../resources/testAccounts/qa_external_credentials.json";

export class AlloyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async logInAlloy() {
    await this.page.goto("https://app.alloy.co/login/");
    await this.page.waitForSelector("#id_email");
    await this.page.fill("#id_email", credentials.alloy_sandbox.username);
    await this.page.fill("#id_password", credentials.alloy_sandbox.password);
    await this.page.click("#sign-in > button");
  }

  async approveDocs(options: {
    entityName: string;
    type?: "accreditation" | "business" | "individual";
    status?: "review" | "approve" | "deny" | "resubmit";
  }) {
    await this.page.click('svg[class="icon entities-icon"]');
    await this.page.waitForTimeout(3000);
    await this.page.click(
      `td[class="entity_name-cell "]:text-is("${options.entityName}")`
    );
    await this.page.waitForTimeout(3000);
    if (options.type === undefined || options.type === "accreditation") {
      await this.page.click(
        ' a[href*="review"]:right-of(:text("Corporate Investor Accreditation"))'
      );
    } else if (options.type === "business") {
      await this.page.click(
        'a[href*="review"]:right-of(:text("MainStreet Business Onboarding"))'
      );
    } else if (options.type === "individual") {
      await this.page.click(
        ' a[href*="review"]:right-of(:text("MainStreet Individual Onboarding"))'
      );
    }
    await this.page.waitForTimeout(2000);
    let outcome = "Approved";
    let reason = "Approved- Other";
    if (options.status === "review") {
      outcome = "Manual Review";
      reason = "Manual Review- Other";
    } else if (options.status === "deny") {
      outcome = "Denied";
      reason = "Denied- Other";
    } else if (options.status === "resubmit") {
      outcome = "Resubmit Document";
      reason = "Manual Review- Other";
    }

    await this.page.locator('button[id*="review"]').waitFor();
    await this.page.click('button[id*="review"]');
    await this.page.click("#customer_outcome");
    await this.page.click(`div[id*="react-select"]:text-is("${outcome}")`);
    await this.page.click("#customer_reason");
    await this.page.click(`div[id*="react-select"]:text-is("${reason}")`);
    await this.page.fill('textarea[name="review_notes"]', options.entityName);
    await this.page.click('#manual-review-form button[type="submit"]');
    await this.page.click("div.completed-review button");
  }

  async approveAllDocs() {
    let i = 20;
    let empty = false;
    while (i > 0 && !empty) {
      await this.page.click('svg[class="icon entities-icon"]');
      await this.page.waitForTimeout(2000);
      await this.page.click(
        'div[class*="flex start align-end"] div:nth-child(4) button:nth-child(1)'
      );
      await this.page.click(
        'button[class*="dropdown-item"] span:text-is("Manual Review")'
      );

      await this.page.waitForTimeout(2000);
      let entityName = "Manual Review";

      // await this.page.click('svg[class="icon entities-icon"]');
      // await this.page.waitForTimeout(3000);
      if (
        await this.page.locator('td:text-is("No data available.")').isVisible()
      ) {
        empty = true;
        break;
      }
      await this.page.click(
        `td[class="outcome-cell "] span:text-is("${entityName}")`
      );
      let outcome = "Approved";
      let reason = "Approved- Other";
      // await this.page.click(
      //   `td[class="entity_name-cell "] span:text-is("${entityName}")`
      // );
      await this.page.waitForTimeout(2000);
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
