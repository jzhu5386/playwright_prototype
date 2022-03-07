import { expect, Locator, Page } from "@playwright/test";
import { CommonOperations } from "./CommonOperations";

export class DocumentsPage extends CommonOperations {
  readonly page: Page;
  readonly docListTitles: Locator;
  readonly uploadedByHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.docListTitles = this.page.locator(
      'div[class^="MuiCollapse-container MuiCollapse-entered"] div[class^="Card__content"] p'
    );
    this.uploadedByHeader = this.page.locator(
      'div.MuiCollapse-wrapper div:has-text("Uploaded by")'
    );
  }

  async goto() {
    await this.page.goto("/documents");
    this.docListTitles;
  }

  async validateFilesInDocumentTab(
    expectedFiles: string[],
    uploadedBy: string
  ) {
    if (expectedFiles.length > 0) {
      await this.page.waitForSelector(
        `div.MuiCollapse-wrapper div:text-is("Uploaded by ${uploadedBy}")`
      );
      await this.docListTitles.first().waitFor();
      const foundDocTitles = await this.docListTitles.allTextContents();
      console.log(foundDocTitles);
      expect(foundDocTitles).toEqual(expectedFiles);
    } else {
      // TODO check for empty state
    }
  }
}
