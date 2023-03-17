import moment from "moment";

export const getDuration = (created_at, merged_at): number => {
  const created = moment.utc(created_at, "YYYY-MM-DD HH:mm:ss Z");
  const merged = moment.utc(merged_at, "YYYY-MM-DD HH:mm:ss Z");
  const duration = moment.duration(merged.diff(created));
  return duration.asMilliseconds();
};
