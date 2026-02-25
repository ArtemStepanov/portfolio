/**
 * Formats a date string into a localized format.
 * @param {string|null} date - ISO date string or null
 * @param {Object} options - Formatting options
 * @param {'long'|'short'} [options.month='long'] - Month format
 * @returns {string} Formatted date or "Undated"
 */
export function formatDate(date, { month = "long" } = {}) {
  if (!date) return "Undated";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Undated";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month,
      day: "numeric",
      timeZone: "UTC",
    });
  } catch (e) {
    return "Undated";
  }
}
