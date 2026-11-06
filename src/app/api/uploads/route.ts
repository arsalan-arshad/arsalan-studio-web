import {
  getSessionUser,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import {
  assertAllowedUpload,
  isR2Configured,
  uploadToR2,
} from "@/lib/r2";
import { NextResponse } from "next/server";

/** Authenticated multipart upload → private Cloudflare R2 object. */
export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "File storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Expected multipart field `file`" },
        { status: 400 },
      );
    }

    const meta = assertAllowedUpload({
      size: file.size,
      type: file.type,
      name: file.name,
    });
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToR2({
      userId: user.id,
      file: buffer,
      contentType: meta.type,
      filename: meta.name,
    });

    return NextResponse.json({
      ok: true,
      key: uploaded.key,
      name: uploaded.name,
      size: uploaded.size,
      contentType: uploaded.contentType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status =
      message.includes("not allowed") || message.includes("10 MB")
        ? 400
        : 500;
    console.error("[uploads POST]", err);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
