import { HandlerEvent } from "@netlify/functions";
import { ERRORS, MANDATORY_ENV_VARS } from "./config";

export const isHandlerEvent = (obj: any): obj is HandlerEvent =>
  obj && obj.body && typeof obj.body === "string";

export const areMandatoryEnvVarsSet = () => {
  const invalidVars = [];
  MANDATORY_ENV_VARS.forEach((p) => {
    if (!process.env.hasOwnProperty(p) || !p) {
      console.error(ERRORS.localEnvVarNotSet.replace("{p}", p));
    }
  });
  return invalidVars.length === 0;
};
