import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const EMAIL_ADMIN_USERNAME = "manager";
const EMAIL_ADMIN_PASSWORD_HASH = "389759402a476c2c751911a1ab22192a6918df850b2e235b209c6809fc98219e";
const EMAIL_REMINDER_URL = "https://employee-email-reminder-center.vercel.app";
const ACCESS_SIGNING_KEY = EMAIL_ADMIN_PASSWORD_HASH;

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).send("Method not allowed");
  }

  const username = String(request.body?.username || "");
  const password = String(request.body?.password || "");

  const submittedHash = createHash("sha256").update(password).digest();
  const expectedHash = Buffer.from(EMAIL_ADMIN_PASSWORD_HASH, "hex");

  if (username === EMAIL_ADMIN_USERNAME && submittedHash.length === expectedHash.length && timingSafeEqual(submittedHash, expectedHash)) {
    const expires = Math.floor(Date.now() / 1000) + 60;
    const signature = createHmac("sha256", ACCESS_SIGNING_KEY)
      .update(String(expires))
      .digest("hex");

    response.setHeader("Cache-Control", "no-store");
    return response.redirect(302, EMAIL_REMINDER_URL + "/dashboard-access?expires=" + expires + "&signature=" + signature);
  }

  return response.redirect(303, "/email-reminder.html?error=1");
}
