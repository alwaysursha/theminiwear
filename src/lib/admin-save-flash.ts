import { cookies } from "next/headers";
import { ADMIN_SAVED_COOKIE } from "@/lib/admin-save-flash.constants";

export async function flashAdminSaved() {
  const jar = await cookies();
  jar.set(ADMIN_SAVED_COOKIE, "1", {
    path: "/",
    maxAge: 30,
    sameSite: "lax",
  });
}
