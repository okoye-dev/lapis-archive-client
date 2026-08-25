// Formats an ISO date as e.g. "3rd August 2026". All fields read in UTC so the
// day, month, and year can't disagree at a timezone boundary.
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const month = date.toLocaleString("default", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();

  function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};
