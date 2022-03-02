import { Locator, Page } from "@playwright/test";
import { CompanyDetails, questionMap } from "../helpers/TestObjects";
import {
  generateRandomNames,
  generateRandomNumber,
  getCurrentYear,
  makeDropDownSelection,
  selectRandom,
} from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class CompanyDetailPage extends CommonOperations {
  readonly page: Page;
  readonly legalBusinessName: Locator;
  readonly DBA: Locator;
  readonly website: Locator;
  readonly industry: Locator;
  readonly yearOfIncorporation: Locator;
  readonly businessType: Locator;
  readonly howBuzTaxed: Locator;
  readonly endOfTaxYear: Locator;
  readonly companyRole: Locator;
  readonly secContact: Locator;
  readonly phoneNumber: Locator;
  readonly redeemCreditList: Locator;
  readonly saveButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.legalBusinessName = page.locator(
      'input[aria-label="Legal business name"]'
    );
    this.DBA = page.locator(
      'input[aria-label="DBA (doing business as; if applicable)"]'
    );
    this.website = page.locator('input[aria-label="Website"]');
    this.industry = page.locator("input[aria-label='Industry']");
    this.yearOfIncorporation = page.locator(
      'input[aria-label="Year of incorporation"]'
    );
    this.businessType = page.locator('input[aria-label="Business type"]');
    this.howBuzTaxed = page.locator(
      'input[aria-label="How is your business taxed?"]'
    );
    this.endOfTaxYear = page.locator('input[aria-label="End of tax year"]');
    this.companyRole = page.locator(
      'input[aria-label="What is your role at the company?"]'
    );
    this.secContact = page.locator(
      'input[aria-label="Add a secondary contact from your company"]'
    );
    this.phoneNumber = page.locator(
      'input[aria-label="Business Phone Number"]'
    );
    this.redeemCreditList = page.locator(
      'span[class*="MuiFormControlLabel-label"]'
    );
    this.saveButton = page.locator("data-testid=account_info_save");
    this.continueButton = page.locator('button:text("Continue")');
  }

  async goto() {
    await this.page.goto("/company-detail");
  }

  static buildDefaultCompanyDetail(options?: {
    timestamp?: number;
    yearofIncorporation?: number;
  }) {
    const timestamp =
      options === undefined || options!.timestamp === undefined
        ? Math.floor(Date.now() / 1000)
        : options!.timestamp;
    const curruentYear = getCurrentYear();
    let _default: CompanyDetails = {
      buzName: `QA Buz ${timestamp}`,
      dba: `DBA ${timestamp}`,
      website: `https://${generateRandomNames()}.com`,
      industry: "Automotive",
      yearOfIncorporation:
        options === undefined || options!.yearofIncorporation === undefined
          ? generateRandomNumber(curruentYear - 5, curruentYear).toString()
          : options!.yearofIncorporation.toString(),
      buzType: "LLC",
      taxType: "As a corporation (I file form 1120)",
      endOfTaxYear: "December",
      companyRole: "CEO",
      secondContact: "",
      phoneNumber: "4051231231",
      redeemList: ["None"],
      sellProductAfter2020: "Yes",
      averageMonthlyRevLess80k: "Yes",
      wasAverageMonthlyRevLess80k: "No",
    };
    console.log(`${_default.dba}, ${_default.buzName}`);
    return _default;
  }

  async completeCompanyDetails(options?: {
    companyDetails?: CompanyDetails;
    timestamp?: number;
  }): Promise<CompanyDetails> {
    const companyDetails =
      options === undefined || options!.companyDetails === undefined
        ? options !== undefined && options!.timestamp !== undefined
          ? CompanyDetailPage.buildDefaultCompanyDetail({
              timestamp: options!.timestamp,
            })
          : CompanyDetailPage.buildDefaultCompanyDetail()
        : options!.companyDetails;

    if (companyDetails.buzName !== undefined) {
      await this.legalBusinessName.waitFor();
      await this.legalBusinessName.type(companyDetails.buzName);
    }

    if (companyDetails.dba !== undefined) {
      await this.DBA.type(companyDetails.dba!);
    }

    if (companyDetails.website != undefined) {
      await this.website.type(companyDetails.website);
    }

    if (companyDetails.industry !== undefined) {
      await makeDropDownSelection(
        this.page,
        this.industry,
        companyDetails.industry
      );
    }

    if (companyDetails.yearOfIncorporation !== undefined) {
      await this.yearOfIncorporation.type(companyDetails.yearOfIncorporation);
    }

    if (companyDetails.buzType !== undefined) {
      await makeDropDownSelection(
        this.page,
        this.businessType,
        companyDetails.buzType
      );
    }

    if (companyDetails.taxType !== undefined) {
      await makeDropDownSelection(
        this.page,
        this.howBuzTaxed,
        companyDetails.taxType
      );
    }

    if (companyDetails.endOfTaxYear !== undefined) {
      await makeDropDownSelection(
        this.page,
        this.endOfTaxYear,
        companyDetails.endOfTaxYear
      );
    }

    if (companyDetails.companyRole !== undefined) {
      await makeDropDownSelection(
        this.page,
        this.companyRole,
        companyDetails.companyRole
      );
    }

    if (companyDetails.secondContact !== undefined) {
      await this.secContact.type(companyDetails.secondContact!);
    }

    if (companyDetails.phoneNumber !== undefined) {
      await this.phoneNumber.type(companyDetails.phoneNumber);
    }

    await this.saveButton.click();

    await this.completeRedeemOutsideOfMainStreet(companyDetails.redeemList);
    await this.handleSellProductQuestions(companyDetails);
    return companyDetails;
  }

  async completeRedeemOutsideOfMainStreet(
    redeemList?: string[]
  ): Promise<string[]> {
    let selected = new Array<string>();
    if (redeemList === undefined) {
      const selections = await this.redeemCreditList.allTextContents();
      selected = selectRandom(selections);
    } else {
      selected = redeemList;
    }

    for (let i = 0; i < selected.length; i++) {
      await this.page.click(`input[name="${selected[i]}"]`);
    }
    return selected;
  }

  async handleSellProductQuestions(companyDetails: CompanyDetails) {
    if (Number(companyDetails.yearOfIncorporation) == 2021) {
      await this.handleButtonQuestions(
        questionMap.averageMonthlyRevLess80k,
        companyDetails.averageMonthlyRevLess80k!
      );
    }

    if (Number(companyDetails.yearOfIncorporation) == 2020) {
      await this.handleButtonQuestions(
        questionMap.sellProductAfter2020,
        companyDetails.sellProductAfter2020!
      );
      if (companyDetails.sellProductAfter2020 === "Yes") {
        await this.handleButtonQuestions(
          questionMap.wasAverageMonthlyRevLess80k,
          companyDetails.wasAverageMonthlyRevLess80k!
        );
      }
    }
  }
}
