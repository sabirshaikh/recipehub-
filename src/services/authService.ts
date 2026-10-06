import http from "@/lib/axios";
import type { RegisterInput } from "@/schemas/auth";
import type { PublicUser } from "@/types/user";

export const authService = {
  async register(payload: RegisterInput): Promise<PublicUser> {
    // 4xx are shown inline on the form, so skip the global toast
    const res = await http.post<PublicUser>("/auth/register", payload, {
      skipErrorNotification: true,
    });
    return res.data;
  },
};

export default authService;
