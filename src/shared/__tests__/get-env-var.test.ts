import cloneDeep from "lodash.clonedeep";
import {
  EnvVarAccessError,
  getOptionalEnvVar,
  getOptionalNumericEnvVar,
  getRequiredEnvVar,
  getRequiredNumericEnvVar,
} from "../get-env-var";

describe("get-env-var", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = cloneDeep(OLD_ENV);
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe("getOptionalEnvVar", () => {
    it("returns var if it is set", () => {
      process.env.REPO_NAME = "(p)reposterous";
      expect(getOptionalEnvVar("REPO_NAME")).toBe("(p)reposterous");
    });

    it("returns null if var is not set", () => {
      delete process.env.TARGET_BRANCH;
      expect(getOptionalEnvVar("TARGET_BRANCH")).toBe(null);
      process.env.TARGET_BRANCH = "";
      expect(getOptionalEnvVar("TARGET_BRANCH")).toBe(null);
    });
  });

  describe("getRequiredEnvVar", () => {
    it("returns var if it is set", () => {
      process.env.AUTHOR_NAME = "Becky Chambers";
      expect(getRequiredEnvVar("AUTHOR_NAME")).toBe("Becky Chambers");
    });

    it("throws error if var is not set", () => {
      delete process.env.AUTHOR_NAME;
      expect(() => getRequiredEnvVar("AUTHOR_NAME")).toThrow(EnvVarAccessError);
      process.env.AUTHOR_NAME = "";
      expect(() => getRequiredEnvVar("AUTHOR_NAME")).toThrow(EnvVarAccessError);
    });
  });

  describe("getOptionalNumericEnvVar", () => {
    it("returns parsed var if it is set", () => {
      process.env.CONFLICT_RETRIES = "42";
      expect(getOptionalNumericEnvVar("CONFLICT_RETRIES")).toBe(42);
    });

    it("returns null if var is not set", () => {
      delete process.env.CONFLICT_RETRIES;
      expect(getOptionalNumericEnvVar("CONFLICT_RETRIES")).toBe(null);
      process.env.CONFLICT_RETRIES = "";
      expect(getOptionalNumericEnvVar("CONFLICT_RETRIES")).toBe(null);
    });

    it("throws error if var is set but not a number", () => {
      process.env.CONFLICT_RETRIES = "drölf";
      expect(() => getOptionalNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
    });

    it("throws error if var is set but not a safe integer", () => {
      process.env.CONFLICT_RETRIES =
        "12234567890123456789012345678901234567890";
      expect(() => getOptionalNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
    });
  });

  describe("getRequiredNumericEnvVar", () => {
    it("returns var if it is set", () => {
      process.env.CONFLICT_RETRIES = "-10";
      expect(getRequiredNumericEnvVar("CONFLICT_RETRIES")).toBe(-10);
    });

    it("throws error if var is not set", () => {
      delete process.env.CONFLICT_RETRIES;
      expect(() => getRequiredNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
      process.env.CONFLICT_RETRIES = "";
      expect(() => getRequiredNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
    });

    it("throws error if var is set but not a number", () => {
      process.env.CONFLICT_RETRIES = "drölf";
      expect(() => getRequiredNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
    });

    it("throws error if var is set but not a safe integer", () => {
      process.env.CONFLICT_RETRIES =
        "12234567890123456789012345678901234567890";
      expect(() => getRequiredNumericEnvVar("CONFLICT_RETRIES")).toThrow(
        EnvVarAccessError
      );
    });
  });
});
