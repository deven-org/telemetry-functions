const dotenv = require("dotenv");

global.console = {
  ...console,
  //log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

dotenv.config({ path: ".test.env" });
