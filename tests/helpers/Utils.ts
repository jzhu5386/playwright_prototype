import { Page, Locator } from "@playwright/test";

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  names,
} = require("unique-names-generator");

const states = [
  ["Alabama", "AL"],
  ["Alaska", "AK"],
  ["American Samoa", "AS"],
  ["Arizona", "AZ"],
  ["Arkansas", "AR"],
  ["Armed Forces Americas", "AA"],
  ["Armed Forces Europe", "AE"],
  ["Armed Forces Pacific", "AP"],
  ["California", "CA"],
  ["Colorado", "CO"],
  ["Connecticut", "CT"],
  ["Delaware", "DE"],
  ["District Of Columbia", "DC"],
  ["Florida", "FL"],
  ["Georgia", "GA"],
  ["Guam", "GU"],
  ["Hawaii", "HI"],
  ["Idaho", "ID"],
  ["Illinois", "IL"],
  ["Indiana", "IN"],
  ["Iowa", "IA"],
  ["Kansas", "KS"],
  ["Kentucky", "KY"],
  ["Louisiana", "LA"],
  ["Maine", "ME"],
  ["Marshall Islands", "MH"],
  ["Maryland", "MD"],
  ["Massachusetts", "MA"],
  ["Michigan", "MI"],
  ["Minnesota", "MN"],
  ["Mississippi", "MS"],
  ["Missouri", "MO"],
  ["Montana", "MT"],
  ["Nebraska", "NE"],
  ["Nevada", "NV"],
  ["New Hampshire", "NH"],
  ["New Jersey", "NJ"],
  ["New Mexico", "NM"],
  ["New York", "NY"],
  ["North Carolina", "NC"],
  ["North Dakota", "ND"],
  ["Northern Mariana Islands", "NP"],
  ["Ohio", "OH"],
  ["Oklahoma", "OK"],
  ["Oregon", "OR"],
  ["Pennsylvania", "PA"],
  ["Puerto Rico", "PR"],
  ["Rhode Island", "RI"],
  ["South Carolina", "SC"],
  ["South Dakota", "SD"],
  ["Tennessee", "TN"],
  ["Texas", "TX"],
  ["US Virgin Islands", "VI"],
  ["Utah", "UT"],
  ["Vermont", "VT"],
  ["Virginia", "VA"],
  ["Washington", "WA"],
  ["west Virginia", "WV"],
  ["wisconsin", "WI"],
  ["wyoming", "WY"],
];
export function convertState(input: string): string {
  if (input.length == 2) {
    input = input.toUpperCase();
    for (let i = 0; i < states.length; i++) {
      if (states[i][1] == input) {
        return states[i][0];
      }
    }
  } else {
    input = input.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    for (let i = 0; i < states.length; i++) {
      if (states[i][0] == input) {
        return states[i][1];
      }
    }
  }
  return "";
}

export function generateRandomNames(length: number = 2): string {
  const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
    length: length,
  }); // big-donkey
  return shortName;
}

export function convertCurrencyStringToNumber(currency: string): number {
  return Number(currency.replace(/[^0-9.-]+/g, ""));
}

export function getHostURL(url: string): string {
  return url.match("^https?://[^/]+")![0];
}

export function generateRandomHumanNames(): string {
  const name = uniqueNamesGenerator({
    dictionaries: [names], // colors can be omitted here as not used
  }); // big-donkey
  return name;
}

export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getCurrentYear(offset?: number): number {
  return new Date().getFullYear();
}

export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function selectRandom(
  selections: string[],
  selectNum: number = 1
): string[] {
  let randomIndex = 0;
  let selected = new Array<string>();

  while (selected.length < selectNum) {
    randomIndex = Math.floor(Math.random() * selections.length);
    if (!selected.includes(selections[randomIndex])) {
      selected.push(selections[randomIndex]);
    }
  }
  return selected;
}

export async function makeDropDownSelection(
  page: Page,
  selector: Locator,
  option: string
) {
  await selector.click();
  await page.click(`text="${option}"`);
}

export async function waitForElementToAppear(
  page: Page,
  locator: Locator,
  timeout: number = 5000
) {
  while (timeout > 0 && !(await locator.isVisible())) {
    page.waitForTimeout(1000);
    timeout -= 1000;
  }
}

/**
 * Given a page, selector and scorlling offsets vertically, attempt to scroll element into viewport
 * @param page
 * @param selector
 * @param y_segment
 */
export async function scrollElementIntoView(
  page: Page,
  selector: string,
  y_segment: number = 2000
) {
  let retry = 5;
  while (!(await isIntersectingViewport(page, selector)) && retry > 0) {
    await page.mouse.wheel(0, y_segment);
    retry -= 1;
  }
  if (retry == 0) {
    console.log("scrolling did not appear to work");
  }
}

/**
 * @returns {!Promise<boolean>}
 */
async function isIntersectingViewport(
  page: Page,
  selector: string
): Promise<boolean> {
  return page.$eval(selector, async (element) => {
    const visibleRatio: number = await new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        resolve(entries[0].intersectionRatio);
        observer.disconnect();
      });
      observer.observe(element);
      // Firefox doesn't call IntersectionObserver callback unless
      // there are rafs.
      requestAnimationFrame(() => {});
    });
    return visibleRatio > 0;
  });
}
