import client from "@/api/client";
import { LoginResponseDto } from "@/types/swagger.types";

export const useLogin = () => {
  const login = async (username: string, password: string) => {
    const { data, error, response } = await client.POST("/api/v1/auth/login", {
      body: {
        username: username,
        password: password,
      },
    });

    if (response?.status === 401) {
      throw new Error("Invalid username or password");
    }

    const loginResponse = data as LoginResponseDto;

    return loginResponse;
  };
  return { login };
};
