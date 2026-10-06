"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { userKeys } from "@/lib/queryKeys";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

export function useRegister() {
  return useMutation({ mutationFn: authService.register });
}

/** Full profile of the signed-in user (only fetched when authenticated). */
export function useCurrentUser() {
  const { status } = useSession();
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: ({ signal }) => userService.me(signal),
    enabled: status === "authenticated",
  });
}

/** Signs out and drops all cached (possibly user-specific) query data. */
export function useLogout() {
  const queryClient = useQueryClient();
  return async () => {
    queryClient.clear();
    await signOut({ redirectTo: "/" });
  };
}
