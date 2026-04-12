import * as jose from "jose";

export async function signTestAccessToken(
  sub: string,
  email: string,
  secret: string,
  displayName?: string
): Promise<string> {
  return new jose.SignJWT({
    email,
    user_metadata: displayName ? { full_name: displayName } : undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(secret));
}
