import {
  createDataEvent,
  DataEvent,
  DataEventSignature,
} from "../createDataEvent";

import { addSignature } from "../addSignature";

describe("Entry", () => {
  beforeEach(() => {});

  afterEach(() => {});

  it("...s", async () => {
    const data = {
      signature: "packages",
      foo: "foo",
      bar: "bar",
    };

    const output = addSignature(data);
    expect(output).toMatchObject({
      created_at: expect.any(Number),
      payload: { foo: "foo", bar: "bar" },
      dataEventSignature: "packages",
    });
  });
});
