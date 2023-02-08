import { createDataEvent, DataEventSignature } from "../createDataEvent";

describe("CreateEvent", () => {
  describe("handler", () => {
    beforeEach(() => {});

    afterEach(() => {});

    it("creates a dataEvent signed as Packages", async () => {
      const payload = { packageNames: ["foo", "bar"] };
      const dataEvent = createDataEvent({
        dataEventSignature: DataEventSignature.Packages,
        payload,
      });
      expect(dataEvent).toMatchObject({
        dataEventSignature: 0,
        created_at: expect.any(Number),
        payload,
      });
    });
  });
});
