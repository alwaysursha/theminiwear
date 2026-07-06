import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ADMIN_NOTIFY_ROLES: Role[] = [
  Role.ADMIN,
  Role.ORDER_MANAGER,
  Role.SUPPORT_AGENT,
];

const DEFAULT_ADMIN_EMAIL = "faiza.farook85@gmail.com";

export async function getAdminNotificationEmails(): Promise<string[]> {
  const fromEnv = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  const fallback = fromEnv || DEFAULT_ADMIN_EMAIL;

  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ADMIN_NOTIFY_ROLES } },
      select: { email: true },
    });

    const emails = [
      ...new Set(
        admins
          .map((user) => user.email.trim().toLowerCase())
          .filter((email) => email.length > 0),
      ),
    ];

    if (emails.length > 0) {
      return emails;
    }
  } catch (error) {
    console.error("[admin-notifications] Failed to load admin emails:", error);
  }

  return [fallback];
}
