import createClient from "openapi-fetch";
import { paths } from "@/schema";

const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

export default client;
