import { createHash, timingSafeEqual } from "node:crypto";

const EMAIL_ADMIN_PASSWORD_HASH = "389759402a476c2c751911a1ab22192a6918df850b2e235b209c6809fc98219e";
const EMAIL_REMINDER_URL = "https://employee-email-reminder-center.vercel.app";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).send("Method not allowed");
  }

  const password = request.body?.password || "";

  const submittedHash = createHash("sha256").update(password).digest();
  const expectedHash = Buffer.from(EMAIL_ADMIN_PASSWORD_HASH, "hex");

  if (submittedHash.length === expectedHash.length && timingSafeEqual(submittedHash, expectedHash)) {
    response.setHeader("Cache-Control", "no-store");
    return response.redirect(302, EMAIL_REMINDER_URL);
  }

  return response.redirect(303, "/email-reminder.html?error=1");
}
