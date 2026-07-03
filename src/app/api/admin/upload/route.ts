import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const { env } = getCloudflareContext();

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `uploads/${randomUUID()}.${ext}`;
  const body = await file.arrayBuffer();

  await env.UPLOADS.put(key, body, {
    httpMetadata: { contentType: file.type },
  });

  const base = env.R2_PUBLIC_URL.replace(/\/+$/, "");
  return NextResponse.json({ url: `${base}/${key}` });
}
