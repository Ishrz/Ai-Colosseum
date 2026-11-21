import client from "./client.js";

export async function invoke(message) {
  const { data } = await client.post("/api/v1/invoke", { message });
  return data;
}
