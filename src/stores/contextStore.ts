import { KeyValueStorage } from "@devvit/public-api";

type ContextStore = {
  get: KeyValueStorage["get"];
  put: KeyValueStorage["put"];
  delete: KeyValueStorage["delete"];
  list: KeyValueStorage["list"];
  getContext(): string;
};

function createKeyFromContext(context: string, key: string): string {
  return `<<${context}>> ${key}`;
}

export function createContextStore(context: string): ContextStore {
  const store = new KeyValueStorage();

  return {
    async get(key, metadata, defaultValue) {
      return await store.get(createKeyFromContext(context, key), metadata, defaultValue);
    },
    async put(key, value, metadata) {
      return await store.put(createKeyFromContext(context, key), value, metadata);
    },
    async delete(key, metadata) {
      return await store.delete(createKeyFromContext(context, key), metadata);
    },
    async list(metadata) {
      return await store.list(metadata);
    },
    getContext() {
      return context;
    },
  };
}