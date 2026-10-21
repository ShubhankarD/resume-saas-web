import { getMe } from "@/lib/auth/api";
import { refreshSession } from "@/lib/auth/session";
import { createSessionLifecycle } from "@/lib/auth/session-lifecycle";
import { useAuthStore } from "@/lib/auth/store";
import { clearTokens, storeTokens } from "@/lib/auth/token-storage";

/** The app's session lifecycle, wired to the real store, storage and API. */
export const sessionLifecycle = createSessionLifecycle({
  tokens: { store: storeTokens, clear: clearTokens },
  store: useAuthStore.getState,
  refresh: refreshSession,
  fetchMe: getMe,
});
