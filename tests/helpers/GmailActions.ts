import { assert } from "console";
import { Auth } from "googleapis";
import {
  authorize,
  listMessages,
  extractMessageContentAsHTML,
  extractMessageContentAsPlainText,
} from "./GmailHelper";
import { JSDOM } from "jsdom";

/**
 * given a email address and query param, validate if we are able to get any messageIds
 * after querying. Then validate result against expected exsits folag
 * @param {*} emailAddress
 * @param {*} emailQueryParam
 * @param {*} exits
 */
export async function checkEmailExists(
  emailAddress: string,
  emailQueryParam: string,
  exits = true
) {
  console.log(emailQueryParam);
  // emailAddress = emailAddress.replace('@gmail.com', '')
  const query = { userId: "me", q: emailQueryParam };
  // Authorize a client with credentials, then call the Gmail API.
  const auth = await authorize(emailAddress);
  const messages = await listMessages(auth, query);
  console.log(`found messages: ${messages.length}`);
  assert(messages.length > 0 === exits);
}

/**
 * Given email address and query, extablish oauth2client and complete gmail query flow.
 * Then extract message content and href info based on given selector
 * @param {string} emailAddress
 * @param {string} emailQueryParam
 */
export async function getHrefLinkValue(
  emailAddress: string,
  emailQueryParam: string,
  linkSelector: string
): Promise<string> {
  console.log(emailQueryParam);
  // emailAddress = emailAddress.replace('@gmail.com', '')
  const query = { userId: "me", q: emailQueryParam };
  // Authorize a client with credentials, then call the Gmail API.
  const auth = await authorize(emailAddress);
  const messages = await listMessages(auth, query);
  console.log(`found messages: ${messages.length}`);
  const targetLink = await parseHrefLinkValue(auth, messages[0], linkSelector);
  console.log(`found link: ${targetLink}`);
  return targetLink;
}

/**
 * locate the email, then get html form of the email. Checks for selectors that needs to appear in the email,
 * checks for selectors that should not appear in the email, finally grabs branding image url for further image
 * compare testing
 * @param {*} emailAddress
 * @param {*} emailQueryParam
 * @param {*} expectedSelectors: list of selectors must appear
 * @param {*} excludeSelectors: list of selectors shouldn't apppear
 * @param {*} brandingSelector: image branding selector
 * @returns
 */
export async function validateEmailGeneral(
  emailAddress: string,
  emailQueryParam: string,
  expectedSelectors: string[],
  excludeSelectors: string[],
  brandingSelector: string
): Promise<string> {
  // console.log(emailQueryParam)
  // emailAddress = emailAddress.replace('@gmail.com', '')
  const query = { userId: "me", q: emailQueryParam };
  const auth = await authorize(emailAddress);
  const messages = await listMessages(auth, query);
  // console.log(`found messages: ${messages.length}`)
  const html_body = await extractMessageContentAsHTML(auth, messages[0]);
  const dom = new JSDOM(html_body);
  expectedSelectors.forEach((expectedSelector) => {
    const links = dom.window.document.querySelectorAll(expectedSelector);
    assert(links.length > 0);
  });
  if (excludeSelectors !== undefined && excludeSelectors.length > 0) {
    excludeSelectors.forEach((excludeSelector) => {
      const links = dom.window.document.querySelectorAll(excludeSelector);
      assert(links.length > 0);
    });
  }
  const brandingURLs = dom.window.document.querySelectorAll(brandingSelector);
  let brandingURL = brandingURLs[0].getAttribute("src");
  brandingURL = brandingURL === null ? "" : brandingURL;
  console.log("email general branding and support link validated.........");
  return brandingURL;
}

export async function validateEmailText(
  emailAddress: string,
  emailQueryParam: string,
  regexPatternsToRemove: string[],
  expectedEmailText: string
) {
  console.log(emailQueryParam);
  // emailAddress = emailAddress.replace('@gmail.com', '')
  const query = { userId: "me", q: emailQueryParam };
  const auth = await authorize(emailAddress);
  const messages = await listMessages(auth, query);
  console.log(`found messages: ${messages.length}`);
  let msg_body = await extractMessageContentAsPlainText(auth, messages[0]);
  console.log(JSON.stringify(msg_body));
  regexPatternsToRemove.forEach((regexPattern) => {
    const matched = msg_body.match(regexPattern);
    if (matched) {
      msg_body = msg_body.replace(matched[0], "");
    }
  });
  console.log(JSON.stringify(msg_body));
  assert(msg_body === expectedEmailText);
}

/**
 * given oAuth2Client and messageId, retrieve message content based on ID and
 * parse body content, convert it into dom and exract href value from given selector
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get
 * @param {*} auth
 * @param {*} messageId
 */
async function parseHrefLinkValue(
  auth: Auth.OAuth2Client,
  messageId: string,
  linkSelector?: string
): Promise<string> {
  const html_body = await extractMessageContentAsHTML(auth, messageId);
  // convert html text into Dom and parse content as desired
  const dom = new JSDOM(html_body);
  linkSelector = linkSelector === undefined ? "a[href]" : linkSelector;
  const links = dom.window.document.querySelectorAll(linkSelector!);
  let resetLink = links[0].getAttribute("href");
  resetLink = resetLink === null ? "" : resetLink;
  return resetLink;
}

/**
 * given oAuth2Client and messageId, retrieve message content based on ID and
 * parse body content, convert it into dom and exract href value from given selector
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get
 * @param {*} auth
 * @param {*} messageId
 */
export async function extractPlainTextMessage(
  auth: Auth.OAuth2Client,
  messageId: string
): Promise<string> {
  const msg_body = await extractMessageContentAsPlainText(auth, messageId);
  // convert html text into Dom and parse content as desired
  return msg_body;
}
