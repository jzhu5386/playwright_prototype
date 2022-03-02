import { APIRequestContext, expect, Page } from "@playwright/test";
import auth0Info from "../resources/testAccounts/qa_ops_auth0_account.json";
import targetInfo from "../resources/testAccounts/qa_target_audience.json";
import path from "path";
import { GoogleAuth } from "googleapis-common";
import axios from "axios";
import { CompanyTokenInfo } from "./TestObjects";
import { getHostURL } from "./Utils";

/**
 * Given page object, extract root URL from url, and look for company/current
 * api call, extract token from header and company id from response and return as a
 * pair. This call however only works when you are in dashboard view.
 * @param page
 * @returns
 */
export async function getTokenByGivenTestSession(
  page: Page
): Promise<CompanyTokenInfo> {
  let url = page.url();
  expect(url.length).toBeGreaterThan(0);
  url = getHostURL(url);
  const [request, response] = await Promise.all([
    page.waitForRequest((request) =>
      request.url().includes(`${url}/api/company/current`)
    ),
    page.waitForResponse((response) =>
      response.url().includes(`${url}/api/company/current`)
    ),
  ]);

  let compId: string = "";
  let progId: string = "";
  //depending on when the query was issued, user might not have any programs yet
  try {
    let jsonResponse = await response.json();
    compId = jsonResponse.data.company.id;
    progId = jsonResponse.data.company.programs[1].id;
  } catch {}

  // get token and programID
  let token = await request.headerValue("Authorization");
  expect(token).not.toBeNull();

  return {
    token: token!,
    url: url,
    programId: progId,
    companyId: compId,
  };
}

/**
 * to obtain a IAP token you must have a service account key, a target audience
 * and target url. To obtain these information for new accounts or projects, check
 * with SRE team. Currently this only supports access to preview and ops tools.
 * By default, this returns IAP token for ops tool
 * @param serviceAcctType
 * @param previewURL : when pointing to preview, previewURL MUST be supplied
 * @returns
 */
export async function getTokenViaServiceAccount(url: string): Promise<string> {
  url = getHostURL(url);
  if (!url.includes("staging") && !url.includes("sandbox")) {
    console.log(`only support preview and staging. ${url}`);
    return "";
  }
  let serviceKeyFile = path.join(
    __dirname,
    "../resources/testAccounts/qa_sa_staging_service_account.json"
  );

  let targetAudience = url.includes("sandbox")
    ? targetInfo.preview_targetAudience
    : targetInfo.ops_targetAudience;

  const auth = new GoogleAuth({ keyFilename: serviceKeyFile });
  const client = await auth.getIdTokenClient(targetAudience);
  const res = await client.request({ url });
  const jwtToken = "Bearer " + client.credentials.id_token;

  return jwtToken;
}

/**
 * if url is not given, we will attempt to extract root url from page object
 * @param page
 * @param url
 * @returns
 */
export async function setupPreviewByPass(
  page: Page,
  url?: string
): Promise<Page> {
  if (url === undefined) {
    url = page.url();
    expect(url.length).toBeGreaterThan(0);
    url = url.match("^https?://[^/]+")![0];
  }
  const jwtToken = await getTokenViaServiceAccount(url);
  page.setExtraHTTPHeaders({
    "proxy-authorization": jwtToken,
  });
  return page;
}

/**
 * given a page object, assign IAP token, auth0 bypass to given page so that we can login
 * ops tool
 * @param page
 * @returns
 */
export async function setupOpsLoginByPass(
  page: Page,
  url: string
): Promise<Page> {
  const jwtToken = await getTokenViaServiceAccount(url);
  const audience = auth0Info.audience;
  const issuerUrl = auth0Info.issuerUrl;
  const client_id = auth0Info.client_id;
  const client_secret = auth0Info.client_secret;
  const scope = auth0Info.scope;
  const username = auth0Info.username;
  const password = auth0Info.password;

  // TODO: "openid profile email name nickname read:all write:all"; need to understand why
  // this scope doesn't get you opstool access.
  const key = `@@auth0spajs@@::${client_id}::${audience}::${scope}`;
  // console.log(key);
  let response;
  try {
    response = await axios.post(issuerUrl, {
      audience,
      client_id,
      client_secret,
      grant_type: "password",
      password,
      scope,
      username,
    });
  } catch (e) {
    console.log(e.response.data);
    throw e;
  }

  const { access_token, expires_in, id_token } = response.data;
  const decodedToken = { user: decodeJwt(id_token) };
  const session = JSON.stringify({
    body: {
      access_token,
      client_id,
      decodedToken,
      expires_in,
      id_token,
      scope, // if scope is set incorrectly, auth0 fails silently.
    },
    expiresAt: Math.floor(Date.now() / 1000) + expires_in,
  });

  // this is the header that is needed to bypass IAP
  // once we are logged in, we no longer need it
  // console.log("token: " + jwtToken);
  page.setExtraHTTPHeaders({
    "proxy-authorization": jwtToken,
  });

  await page.addInitScript(
    ({ key, session }) => localStorage.setItem(key, session),
    { key, session }
  );

  return page;
}

function decodeJwt(token: string): string {
  const tokenBody = token.split(".")[1];
  const buff = Buffer.from(tokenBody, "base64");
  return JSON.parse(buff.toString("ascii"));
}
