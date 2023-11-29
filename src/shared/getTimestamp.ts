export class GetTimestampError extends Error {
  name = "GetTimestampError";
}

export function getTimestamp(dateString: string): number {
  const dateDataType = typeof dateString;
  // This should be checked by typescript, but since it is a critical point not
  // to accidentally pass undefined due to a bad type, we also check at runtime.
  if (dateDataType !== "string") {
    throw new GetTimestampError(
      `Tried to parse date from value of type "${dateDataType}"`
    );
  }

  const timestamp = new Date(dateString).getTime();
  if (isNaN(timestamp)) {
    throw new GetTimestampError(
      `Tried to parse invalid date. Input: "${dateString}"`
    );
  }

  return timestamp;
}
