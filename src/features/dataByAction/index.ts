import R from "ramda";
import { createCommonDataObject, extractByClosed } from "./data-extractors";
import { CommonData, Data, EventBody } from "../../interface";
import { createReturnObject } from "./createReturnObject";

const isClosed = R.propEq("action", "closed");

const callOrThen = (f, val) => (val && val.then ? val.then(f) : f(val));

const extractByAction = async (data: CommonData): Promise<Data> =>
  R.cond([
    [isClosed, await extractByClosed],
    [R.T, R.always(data)],
  ])(data);

export const dataByAction = (eventBody: EventBody): Data =>
  R.pipeWith(callOrThen, [
    createCommonDataObject,
    extractByAction,
    createReturnObject,
  ])(eventBody);
