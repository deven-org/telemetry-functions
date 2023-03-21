import { Signale, SignaleOptions } from "signale";

const options: SignaleOptions = {
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
