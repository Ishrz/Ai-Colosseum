export function threadTitle(message, maxLength = 40) {
  const text = (message || "").trim();
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
