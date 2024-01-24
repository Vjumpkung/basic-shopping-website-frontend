import client from "@/api/client";

export async function getProfile(token: string | null) {
  if (!token) {
    return null;
  }

  const { data, error } = await client.GET("/api/v1/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
