const DASHBOARD_PASSWORD_HASH = "cb5f7ff127dc97931a31d99a4524df1ae6b1496d02029fdb9eb74c0af75edfdb";

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default async function middleware(request) {
  const authorization = request.headers.get("authorization");

  if (authorization && authorization.startsWith("Basic ")) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(":");
      const password = separator >= 0 ? decoded.slice(separator + 1) : "";

      if ((await sha256(password)) === DASHBOARD_PASSWORD_HASH) {
        return;
      }
    } catch {
      // Invalid authorization data falls through to the login prompt.
    }
  }

  return new Response("Password required to access the SOS Apps Dashboard.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="SOS Manager Dashboard", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

export const config = {
  matcher: "/((?!favicon.ico).*)"
};
