import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:";

const RESET_TTL_MS = 60 * 60 * 1000;

function resetIdentifier(email: string) {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email.trim().toLowerCase()}`;
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const identifier = resetIdentifier(normalizedEmail);
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + RESET_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function findPasswordResetEmail(token: string) {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: { startsWith: PASSWORD_RESET_IDENTIFIER_PREFIX },
      token: trimmed,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return null;
  }

  return record.identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length);
}

export async function consumePasswordResetToken(token: string) {
  const email = await findPasswordResetEmail(token);
  if (!email) {
    return null;
  }

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: resetIdentifier(email),
      token: token.trim(),
    },
  });

  return email;
}
