import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { Button, Image, Input } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLogin } from "@/utils/login";
import { InferGetStaticPropsType } from "next";
import client from "@/api/client";
import { settingsSchema } from "@/types/swagger.types";
import Link from "next/link";

export default function SignIn({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isExecute, setIsExecute] = useState<boolean>(false);
  const [isUsernameEmpty, setIsUsernameEmpty] = useState<boolean>(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>("");
  const [isPasswordEmpty, setIsPasswordEmpty] = useState<boolean>(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>("");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();
  const { login } = useLogin();

  function onSubmit(e: React.FormEvent<HTMLButtonElement>) {
    setIsUsernameEmpty(false);
    setIsPasswordEmpty(false);
    setPasswordErrorMessage("");
    setIsExecute(true);
    e.preventDefault();

    if (username === "") {
      setIsUsernameEmpty(true);
      setUsernameErrorMessage("กรุณากรอกชื่อผู้ใช้");
    }
    if (password === "") {
      setIsPasswordEmpty(true);
      setPasswordErrorMessage("กรุณากรอกรหัสผ่าน");
    }

    login(username, password)
      .then((res) => {
        localStorage.setItem("shopping-jwt", res.access_token);

        client
          .GET("/api/v1/auth/profile", {
            headers: {
              Authorization: `Bearer ${res.access_token}`,
            },
          })
          .then((res) => {
            if (res.data?.role === 100) {
              router.push("/admin");
            } else {
              router.push("/");
            }
          });
      })
      .catch((err) => {
        setIsUsernameEmpty(true);
        setIsPasswordEmpty(true);
        setPasswordErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      });

    setIsExecute(false);
  }

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      router.push("/");
    }
  });

  return (
    <main
      className={`fixed top-0 bottom-0 right-0 left-0 flex min-h-screen flex-col items-center justify-between`}
    >
      <title>{settings?.name + " - ลงชื่อเข้าใช้"}</title>
      <form className="flex flex-col items-center justify-center gap-4 w-full max-w-xl m-auto px-2">
        <Image
          width={100}
          height={100}
          src={settings?.logo}
          alt="settings logo"
        />
        <h1 className="text-2xl font-bold text-center">{settings?.name}</h1>
        <Input
          className="p-1"
          size="sm"
          type="text"
          placeholder="ชื่อผู้ใช้"
          isInvalid={isUsernameEmpty}
          errorMessage={usernameErrorMessage}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          className="p-1"
          type={isVisible ? "text" : "password"}
          size="sm"
          placeholder="รหัสผ่าน"
          errorMessage={passwordErrorMessage}
          isInvalid={isPasswordEmpty}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          className="font-bold text-md w-full"
          isDisabled={isExecute}
          isLoading={isExecute}
          size="md"
          color="default"
          type="submit"
          onClick={(e) => onSubmit(e)}
        >
          เข้าสู่ระบบ
        </Button>
        <div className="w-full">
          <p className="text-right">
            หรือ{" "}
            <Link href="/signup" className=" text-primary hover:text-blue-700">
              ลงทะเบียน
            </Link>{" "}
            เลย!
          </p>
        </div>
      </form>
    </main>
  );
}

export async function getStaticProps() {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  return {
    props: {
      settings,
    },
    revalidate: 1,
  };
}
