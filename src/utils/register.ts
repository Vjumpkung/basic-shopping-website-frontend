import client from "@/api/client";
import { RegisterResponseDto } from "@/types/swagger.types";

export const useRegister = () => {
  const register = async (username: string, password: string) => {
    const { data, error, response } = await client.POST(
      "/api/v1/auth/register",
      {
        body: {
          username: username,
          password: password,
        },
      }
    );

    const registerResponse = data as RegisterResponseDto;

    return registerResponse;
  };
  return { register };
};
