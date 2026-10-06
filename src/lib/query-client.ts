import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR we want a non-zero staleTime so data prefetched on the server
        // isn't refetched immediately on the client.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Client errors (4xx) won't fix themselves on retry
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      dehydrate: {
        // Also dehydrate pending queries so streamed server prefetches hydrate
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: always a fresh client per request (no data leaks between users).
 * Browser: a singleton, so React suspending during the initial render doesn't
 * throw the cache away.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
