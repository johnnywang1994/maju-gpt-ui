export const channelId = process.env.LINE_CHANNEL_ID ?? "";

export async function verifyAccessToken(accessToken: string) {
  const searchParams = new URLSearchParams({
    access_token: accessToken,
  });
  const params = searchParams.toString();
  const res = await fetch(`https://api.line.me/oauth2/v2.1/verify?${params}`, {
    method: "GET",
  });
  const data = await res.json();
  return data;
}

export async function verifyIDToken(idToken: string, nonce?: string) {
  const body = new URLSearchParams({
    id_token: idToken,
    client_id: channelId,
  });
  if (nonce) {
    body.append("nonce", nonce);
  }
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json();
  return data;
}
