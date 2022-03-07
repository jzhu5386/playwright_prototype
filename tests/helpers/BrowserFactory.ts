import {
  Browser,
  BrowserContext,
  chromium,
  firefox,
  Page,
  webkit,
} from "@playwright/test";
import { setupOpsLoginByPass } from "./TokenHelpers";

export class BrowserFactory {
  browser!: Browser;
  browserContext!: BrowserContext;
  page!: Page;
  browserType: "webkit" | "firefox" | "chromium" = "chromium";
  targetURL: string;
  headless: boolean;

  constructor(
    targetURL: string,
    browserType: "webkit" | "firefox" | "chromium" = "chromium",
    headless: boolean
  ) {
    this.browserType = browserType;
    this.targetURL = targetURL;
    this.headless = headless;
  }

  async createBrowserWindow() {
    if (this.browserType === "webkit") {
      this.browser = await webkit.launch({
        headless: this.headless,
        slowMo: 120,
      });
    } else if (this.browserType === "firefox") {
      this.browser = await firefox.launch({
        headless: this.headless,
        slowMo: 120,
      });
    } else {
      this.browser = await chromium.launch({
        headless: this.headless,
        slowMo: 120,
      });
    }
  }

  async setupBrowserForOps() {
    await this.createBrowserWindow();
    this.browserContext = await this.browser!.newContext({
      viewport: { width: 1460, height: 800 },
    });
    this.page = await this.browserContext.newPage();
    this.page = await setupOpsLoginByPass(this.page, this.targetURL);
  }

  async close() {
    if (this.page !== undefined) {
      await this.page!.close();
    }
    if (this.browserContext !== undefined) {
      await this.browserContext!.close();
    }
    if (this.browser !== undefined) {
      await this.browser!.close();
    }
  }
}
