// Advanced Local Public Key Storage Utility for Piece Dot Fun
// Supports multiple named keys, metadata, key rotation, and advanced queries

const STORAGE_KEY = "piece_dot_fun_public_keys";

function loadStore() {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveStore(store) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

export function addPublicKey({
  label,
  publicKey,
  usage = "general",
  meta = {},
}) {
  const store = loadStore();
  const now = new Date().toISOString();
  store[label] = {
    publicKey,
    usage,
    createdAt: now,
    updatedAt: now,
    ...meta,
  };
  saveStore(store);
}

export function getPublicKey(label) {
  const store = loadStore();
  return store[label] || null;
}

export function removePublicKey(label) {
  const store = loadStore();
  if (store[label]) {
    delete store[label];
    saveStore(store);
  }
}

export function listPublicKeys({ usage } = {}) {
  const store = loadStore();
  return Object.entries(store)
    .filter(([_, v]) => (usage ? v.usage === usage : true))
    .map(([label, v]) => ({ label, ...v }));
}

export function updatePublicKey(label, updates) {
  const store = loadStore();
  if (store[label]) {
    store[label] = {
      ...store[label],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
  }
}

export function rotatePublicKey(label, newPublicKey) {
  updatePublicKey(label, { publicKey: newPublicKey });
}

export function findPublicKeysByMeta(metaKey, metaValue) {
  const store = loadStore();
  return Object.entries(store)
    .filter(([_, v]) => v[metaKey] === metaValue)
    .map(([label, v]) => ({ label, ...v }));
}
