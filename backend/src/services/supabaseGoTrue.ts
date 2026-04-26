import { config } from "../config.js";

const jsonHeaders = {
  apikey: config.supabaseAnonKey,
  "Content-Type": "application/json",
} as const;

export type GoTrueAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: { id: string; email?: string };
  error_description?: string;
  msg?: string;
  message?: string;
};

export async function goTruePasswordGrant(
  email: string,
  password: string
): Promise<{ res: Response; data: GoTrueAuthResponse }> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as GoTrueAuthResponse;
  return { res, data };
}

export async function goTrueSignup(body: {
  email: string;
  password: string;
  data: Record<string, unknown>;
}): Promise<{ res: Response; data: GoTrueAuthResponse }> {
  const adminRes = await fetch(`${config.supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: config.supabaseJwtSecret,
      Authorization: `Bearer ${config.supabaseJwtSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: body.data,
    }),
  });
  if (!adminRes.ok) {
    const errorData = (await adminRes.json()) as GoTrueAuthResponse;
    return { res: adminRes, data: errorData };
  }
  return goTruePasswordGrant(body.email, body.password);
}

export async function goTrueRecover(
  email: string,
  redirectTo?: string
): Promise<{ res: Response; data: GoTrueAuthResponse }> {
  const url = new URL(`${config.supabaseUrl}/auth/v1/recover`);
  if (redirectTo) url.searchParams.set("redirect_to", redirectTo);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
  const data = (await res.json()) as GoTrueAuthResponse;
  return { res, data };
}

export async function goTrueUpdatePassword(
  accessToken: string,
  password: string
): Promise<{ res: Response; data: GoTrueAuthResponse }> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json()) as GoTrueAuthResponse;
  return { res, data };
}

export function goTrueErrorMessage(data: GoTrueAuthResponse, fallback: string): string {
  return (
    data.error_description ??
    data.msg ??
    (typeof data.message === "string" ? data.message : undefined) ??
    fallback
  );
}
