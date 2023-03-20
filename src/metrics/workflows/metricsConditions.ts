import { collectWorkflowsMetrics } from ".";
import { Conditions, DataEvent, DataEventSignature } from "../../interfaces";

const isSignedAsWorkflowJob = (dataEvent: DataEvent) =>
  dataEvent.dataEventSignature === DataEventSignature.WorkflowJob;

const conditions: Conditions = [
  [isSignedAsWorkflowJob, collectWorkflowsMetrics],
];

export default conditions;
