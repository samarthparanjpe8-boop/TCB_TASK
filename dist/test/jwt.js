import * as jose from "jose";
export async function signTestAccessToken(sub, email, secret, displayName) {
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
