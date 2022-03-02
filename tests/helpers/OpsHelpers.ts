import axios from "axios";
import { getHostURL } from "./Utils";

/**
 * given programID, token and url, set program substage via api call
 * @param programId
 * @param token
 * @param url
 * @returns
 */
export const updateProgramSubstage = async (
  programId: string,
  token: string,
  url: string,
  programSubStage: string = "expense_classification_overview"
) => {
  url = getHostURL(url);
  const res = await axios.put(
    `${url}/api/v1/program/program-substage`,
    {
      programId: programId,
      programSubStage: programSubStage,
    },
    {
      withCredentials: true,
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: token,
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    }
  );
  console.log(await res.data);
};

/**
 * Given programId, token and url, set programStage
 * @param programId
 * @param token
 * @param url
 * @returns
 */
export const updateProgramStage = async (
  programId: string,
  token: string,
  url: string,
  programStage: string = "expense_classification"
) => {
  url = getHostURL(url);
  console.log(programStage);
  const res = await axios.put(
    `${url}/api/v1/program/program-stage`,
    {
      programId: programId,
      programStage: programStage,
    },
    {
      withCredentials: true,
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: token,
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    }
  );
  console.log(await res.data);
};

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
