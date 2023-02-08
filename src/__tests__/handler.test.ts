import { handler } from "../handler";
import mergedCompletedSuccessfully from "./fixtures/merged-completed-successful.json";

describe("Handler", () => {
  beforeEach(() => {});

  afterEach(() => {});

  it.only("returns the payload enhanced with relative matrix", async () => {
    const data = {
      signature: "packages",
      foo: "foo",
      bar: "bar",
    };
    const output = await handler(data);

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      output: data,
      dataEventSignature: "packages",
    });
  });

  it("...", async () => {
    const output = await handler(mergedCompletedSuccessfully);

    expect(output).toMatchObject({
      created_at: expect.any(Number),
      dataEventSignature: "merged-pr",
    });
  });
});
