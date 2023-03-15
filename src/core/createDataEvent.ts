import moment from "moment";

export enum DataEventSignature {
  Packages = "packages",
  MergedPR = "merged-pr",
  WorkflowJobCompleted = "workflow-job-completed",
  TestCoverage = "test-coverage",
}

export type EnhancedDataEvent = Omit<DataEvent, "payload">;

export interface MergedPrOutput {
  commits: number;
  comments: number;
  merged: boolean;
  changed_files: number;
  review_comments: number;
  release: any;
  duration: number;
}

export type WorkflowJobCompletedPayload = any;
type PackagesOutput = any;
type TestCoverageOutput = any;

type PackagesPayload = any;
export type MergedPrPayload = any;
type TestCoveragePayload = any;
interface DataEventPayloadMap {
  [DataEventSignature.Packages]: PackagesPayload;
  [DataEventSignature.MergedPR]: MergedPrPayload;
  [DataEventSignature.TestCoverage]: TestCoveragePayload;
}

interface DataEventOutputMap {
  [DataEventSignature.Packages]: PackagesOutput;
  [DataEventSignature.MergedPR]: MergedPrOutput;
  [DataEventSignature.TestCoverage]: TestCoverageOutput;
}

export interface DataEvent<T extends DataEventSignature = DataEventSignature> {
  dataEventSignature: T;
  payload: T extends keyof DataEventPayloadMap ? DataEventPayloadMap[T] : never;
  output: T extends keyof DataEventOutputMap ? DataEventOutputMap[T] : never;
  created_at: Number;
}

export function createDataEvent<T extends DataEventSignature>(
  dataEvent: Omit<DataEvent<T>, "created_at">
): DataEvent<T> {
  return {
    ...dataEvent,
    created_at: moment().unix(),
  };
}
