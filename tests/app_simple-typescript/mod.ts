import dayjs from "dayjs";

export function getDateString() {
  return dayjs().format("YYYY-MM-DD");
}
