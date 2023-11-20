import { DeploymentCreatedEvent } from "../../../github.interfaces";
import { DataEventSignature, SignedDataEvent } from "../../../interfaces";
import { isSignedAsDeployment } from "../metricsConditions";

describe("Deployment metric condition: isSignedAsDeployment", () => {
  it("returns false if event is not signed as Deployment", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.CheckSuite,
      payload: {} as DeploymentCreatedEvent,
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns false if event is signed as Deployment but not with the action created", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.Deployment,
      payload: {} as DeploymentCreatedEvent,
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeFalsy();
  });

  it("returns true if event is signed as Deployment with the action created", async () => {
    const event: SignedDataEvent = {
      dataEventSignature: DataEventSignature.Deployment,
      payload: {
        action: "created",
      } as DeploymentCreatedEvent,
      created_at: 100,
    };

    expect(isSignedAsDeployment(event)).toBeTruthy();
  });
});
