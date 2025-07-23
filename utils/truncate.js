//Trunca la longitu de una cadena, se usara para la pubkey

export const truncate = (longString, limit = 10) => {
  if (typeof longString !== "undefined" && longString.length > limit) {
    return longString.substring(0, limit) + "...";
  }

  return longString;
};

export function truncateWallet(str) {
  if (!str) return "";
  const adrTruncated = str.slice(0, 3) + "..." + str.slice(-4);
  return adrTruncated;
}
