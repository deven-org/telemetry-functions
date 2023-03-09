import { HandlerEvent } from "@netlify/functions";
import { ERRORS, MANDATORY_ENV_VARS } from "./config";

import {
  join,
  pipe,
  toLower,
  propIs,
  difference,
  keys,
  equals,
  length,
} from "ramda";

export const getPath = (pieces: string[]) => pipe(join("/"), toLower)(pieces);

export const isHandlerEvent = (obj) => propIs(String, "body")(obj);

export const areMandatoryEnvVarsSet = (vars) => {
  return pipe(keys, difference(MANDATORY_ENV_VARS), length, equals(0))(vars);
};

export const validateDataObject = (data) => {
  const path = propIs(String, data.path);
  const message = propIs(String, data.message);
  const content = propIs(Object, data.content);
  // return path && message && content;
  return data;
};

export const throwError = (message: string): never => {
  throw new Error(message);
};
