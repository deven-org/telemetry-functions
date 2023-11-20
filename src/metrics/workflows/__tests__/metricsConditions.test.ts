import { WorkflowJobCompletedEvent } from "../../../github.interfaces";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsWorkflowJob } from "../metricsConditions";

describe("Workflows metric condition: isSignedAsWorkflowJob", () => {
  it("returns false if event is not signed as WorkflowJob", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: {} as WorkflowJobCompletedEvent,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("returns false if event is signed as WorkflowJob but not completed", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: {
        action: "not completed",
      } as WorkflowJobCompletedEvent,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeFalsy();
  });

  it("returns true if event is signed as completed WorkflowJob", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.WorkflowJob,
      payload: {
        action: "completed",
      } as WorkflowJobCompletedEvent,
      created_at: 100,
    };

    expect(isSignedAsWorkflowJob(event)).toBeTruthy();
  });
});
