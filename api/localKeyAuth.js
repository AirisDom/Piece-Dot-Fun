// Local Key Storage and Bearer Authorization Utility

function getKeyName(field) {
  return `piece_dot_fun_${field}`;
}

export function setLocalBearerKey(field, key) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getKeyName(field), key);
  }
}

export function getLocalBearerKey(field) {
  if (typeof window !== "undefined") {
    return localStorage.getItem(getKeyName(field));
  }
  return null;
}

export function removeLocalBearerKey(field) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(getKeyName(field));
  }
}

export function getBearerAuthHeader(field) {
  const key = getLocalBearerKey(field);
  if (key) {
    return { Authorization: `Bearer ${key}` };
  }
  return {};
}
