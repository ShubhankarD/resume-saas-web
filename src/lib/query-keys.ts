/**
 * Every TanStack Query cache key in the app, in one place, so a hook that
 * writes a cache entry and a hook that invalidates it can never drift apart
 * on spelling. Detail keys nest under their list key (`["profiles", id]`
 * under `["profiles"]`), so invalidating a list also invalidates its
 * details.
 */
export const queryKeys = {
  content: ["content"] as const,
  templates: ["templates"] as const,
  builds: ["builds"] as const,
  profiles: {
    all: ["profiles"] as const,
    detail: (id: string) => ["profiles", id] as const,
  },
  jds: {
    all: ["jds"] as const,
    detail: (id: string) => ["jds", id] as const,
  },
  evaluations: {
    all: ["evaluations"] as const,
    detail: (id: string) => ["evaluations", id] as const,
  },
  curations: {
    all: ["curations"] as const,
    detail: (id: string) => ["curations", id] as const,
  },
  applications: {
    all: ["applications"] as const,
    detail: (id: string) => ["applications", id] as const,
  },
};
