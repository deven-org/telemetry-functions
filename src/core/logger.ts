import { Signale, SignaleOptions, DefaultMethods } from "signale";

const options: SignaleOptions<DefaultMethods | "skip"> = {
  stream: process.stdout,
  types: {
    skip: {
      badge: "*",
      color: "yellow",
      label: "skip",
      logLevel: "info",
    },
  },
};

export const logger = new Signale(options);
