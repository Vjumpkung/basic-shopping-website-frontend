import client from "@/api/client";
import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import { settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { useRegister } from "@/utils/register";
import { Button, Image, Input } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function SignUp({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);
  const [isExecute, setIsExecute] = useState<boolean>(false);
  const [isUsernameEmpty, setIsUsernameEmpty] = useState<boolean>(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>("");
  const [isPasswordEmpty, setIsPasswordEmpty] = useState<boolean>(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>("");
  const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] =
    useState<boolean>(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState<string>("");
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibilty = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  const router = useRouter();
  const { register } = useRegister();

  function onSubmit(e: React.FormEvent<HTMLButtonElement>) {
    setUsernameErrorMessage("");
    setPasswordErrorMessage("");
    setConfirmPasswordErrorMessage("");
    setIsUsernameEmpty(false);
    setIsPasswordEmpty(false);
    setIsConfirmPasswordEmpty(false);
    setIsExecute(true);
    e.preventDefault();

    if (username === "") {
      setIsUsernameEmpty(true);
      setUsernameErrorMessage("กรุณากรอกชื่อผู้ใช้");
      setIsExecute(false);
      return;
    }
    if (password === "") {
      setIsPasswordEmpty(true);
      setPasswordErrorMessage("กรุณากรอกรหัสผ่าน");
      setIsExecute(false);
      return;
    }

    if (confirmPassword === "") {
      setIsConfirmPasswordEmpty(true);
      setConfirmPasswordErrorMessage("กรุณากรอกรหัสผ่านอีกครั้ง");
      setIsExecute(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsConfirmPasswordEmpty(true);
      setConfirmPasswordErrorMessage("กรุณากรอกรหัสผ่านให้ตรงกัน");
      setIsExecute(false);
      return;
    }

    register(username, password)
      .then((res) => {
        toast.success("ลงทะเบียนสำเร็จ", { position: "bottom-right" });
        router.push("/signin");
      })
      .catch((err) => {
        setIsUsernameEmpty(true);
        setUsernameErrorMessage("มีชื่อผู้ใช้นี้อยู่แล้ว");
      });

    setIsExecute(false);
  }

  return (
    <main
      className={`fixed top-0 bottom-0 right-0 left-0 flex min-h-screen flex-col items-center justify-between`}
    >
      <Head>
        <title>{settings?.name + "- ลงทะเบียน"}</title>
      </Head>
      <form className="flex flex-col items-center justify-center gap-4 w-full max-w-xl m-auto px-2">
        <Link href="/">
          <Image
            as={NextImage}
            width={100}
            height={100}
            src={settings?.logo}
            quality={100}
            alt="settings logo"
          />
        </Link>
        <h1 className="text-2xl text-center">{settings?.name}</h1>
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
          type={isPasswordVisible ? "text" : "password"}
          size="sm"
          placeholder="รหัสผ่าน"
          errorMessage={passwordErrorMessage}
          isInvalid={isPasswordEmpty}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          className="p-1"
          type={isConfirmPasswordVisible ? "text" : "password"}
          size="sm"
          placeholder="ยืนยันรหัสผ่าน"
          errorMessage={confirmPasswordErrorMessage}
          isInvalid={isConfirmPasswordEmpty}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleConfirmPasswordVisibilty}
            >
              {isConfirmPasswordVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          ลงทะเบียน
        </Button>
      </form>
    </main>
  );
}

export async function getServerSideProps({ req, res }: { req: any; res: any }) {
  if (await apiCheck()) {
    return { redirect: { destination: "/500", permanent: false } };
  }

  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", { req, res }) as
    | string
    | undefined
    | null;

  if (shopping_jwt) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      settings,
    },
  };
}
