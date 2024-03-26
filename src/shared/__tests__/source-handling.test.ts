import { LogErrors } from "../log-messages";
import {
  identifySourceAndEvent,
  validateRequest,
  handleEvent,
  HTMLError,
} from "../source-handling";

describe("source-handling", () => {
  describe("identifySourceAndEvent", () => {
    it("returns 'deven' as source when 'x-deven-event' header is set", () => {
      const headers = { "x-deven-event": "tooling-usage" };

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.source).toBe("deven");
    });
    it("returns 'github' as source when 'x-github-event' header is set", () => {
      const headers = { "x-github-event": "pull_request" };

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.source).toBe("github");
    });
    it("returns 'unknown' as source when no known header is set", () => {
      const headers = {};

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.source).toBe("unknown");
    });
    it("returns source event signature behind 'x-deven-event' header", () => {
      const headers = { "x-deven-event": "tooling-usage" };

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.sourceEventSignature).toBe("tooling-usage");
    });
    it("returns source event signature behind 'x-github-event' header", () => {
      const headers = { "x-github-event": "pull_request" };

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.sourceEventSignature).toBe("pull_request");
    });
    it("returns source event signature 'unknown' when no known header is set", () => {
      const headers = {};

      const sourceAndEvent = identifySourceAndEvent(headers);

      expect(sourceAndEvent.sourceEventSignature).toBe("unknown");
    });
  });
  describe("validateRequest", () => {
    it("returns status code 400 when signature header is not set", () => {
      expect(() => {
        validateRequest({}, "", "");
      }).toThrow(new HTMLError(LogErrors.badRequestError, 400));
    });
    it("returns status code 401 when signature can not be verified", () => {
      const secret = "thisIsASecret";
      const body = "9876543210";
      // signature is created with a body of '0123456789' and the same secret
      const headers = {
        "x-hub-signature-256":
          "sha256=eb572fb4698e9e6994f3545bdbc634e5e174876a0defe1fc22e3b89f08c1afb9",
      };

      expect(() => {
        validateRequest(headers, body, secret);
      }).toThrow(new HTMLError(LogErrors.forbiddenRequestError, 401));
    });
    it("returns undefined when signature can be verified", () => {
      const secret = "thisIsASecret";
      const body = "0123456789";
      // signature is created with a body of '0123456789' and the same secret
      const headers = {
        "x-hub-signature-256":
          "sha256=eb572fb4698e9e6994f3545bdbc634e5e174876a0defe1fc22e3b89f08c1afb9",
      };
      const returnValue = validateRequest(headers, body, secret);

      expect(returnValue).toBe(undefined);
    });
  });
  describe("handleEvent", () => {
    it("throws a HTML error when the source is unknown", () => {
      const headers = {};
      expect(() => handleEvent(headers, "", "", "")).rejects.toBeInstanceOf(
        HTMLError
      );
    });
  });
});
