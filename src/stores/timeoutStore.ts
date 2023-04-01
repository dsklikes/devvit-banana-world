import { createContextStore } from "./contextStore.js";
import { JSONObject } from "@devvit/shared-types/json.js";

type TimeoutStore = {
  getCurrentTimeoutExpirationForUser(username: string): Promise<Date | undefined>;
  addTimeoutForUser(username: string, expiresAt: Date): Promise<void>;
  removeTimeoutForUser(username: string): Promise<void>;
};

export function createTimeoutStore(): TimeoutStore {
  const timeoutStore = createContextStore("timeout");

  return {
    async getCurrentTimeoutExpirationForUser(username) {
      const result = await timeoutStore.get<JSONObject>("timeout-" + username);

      if (result === undefined)
        return undefined;

      const timeoutExpiration = result["expiresAt"];

      if (timeoutExpiration === undefined)
        return undefined;

      if (typeof timeoutExpiration !== "number") {
        throw new Error(`Unexpected timeout expiration value: ${timeoutExpiration} (Type=${typeof timeoutExpiration})`);
      }

      return new Date(timeoutExpiration);
    },
    async addTimeoutForUser(username, expiresAt) {
      const currentExpiration = await this.getCurrentTimeoutExpirationForUser(username);
      if (currentExpiration !== undefined)
        throw new Error(`Timeout already exists for /u/${username} and will expire at ${currentExpiration}`);

      await timeoutStore.put("timeout-" + username, { expiresAt: expiresAt.getUTCMilliseconds() });
    },
    async removeTimeoutForUser(username) {
      const currentExpiration = await this.getCurrentTimeoutExpirationForUser(username);

      if (currentExpiration === undefined)
        throw new Error(`No timeout exists for /u/${username}`);

      await timeoutStore.delete("timeout-" + username);
    }
  };
}