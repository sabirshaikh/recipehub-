import http from "@/lib/axios";
import type { PublicUser } from "@/types/user";

export const userService = {
  async me(signal?: AbortSignal): Promise<PublicUser> {
    const res = await http.get<PublicUser>("/users/me", { signal });
    return res.data;
  },
};

export default userService;
