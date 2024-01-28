import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import UserLayout from "@/components/UserLayout";
import { settingsSchema } from "@/types/swagger.types";
import { useLogin } from "@/utils/login";
import { getProfile } from "@/utils/profile";
import { Button, Input } from "@nextui-org/react";
import { getCookie, setCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { toast } from "react-toastify";

//w-full lg:w-1/2 xl:w-1/3 mx-auto px-5

export default function EditProfile({
  settings,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const token = getCookie("shopping-jwt") as string | null;
  const [username, setUsername] = useState<string>(profile?.username as string);
  const [editUsername, setEditUsername] = useState<boolean>(false);
  const [editPassword, setEditPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmnewPassword, setConfirmNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [updateUsernameError, setUpdateUsernameError] = useState<string>("");
  const [newPasswordError, setNewPasswordError] = useState<string>("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] =
    useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [oldPasswordError, setOldPasswordError] = useState<string>("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] =
    useState<boolean>(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] =
    useState<boolean>(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState<boolean>(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleOldPasswordVisibility = () =>
    setIsOldPasswordVisible(!isOldPasswordVisible);
  const toggleNewPasswordVisibility = () =>
    setIsNewPasswordVisible(!isNewPasswordVisible);
  const toggleConfirmNewPasswordVisibility = () =>
    setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible);
  const { login } = useLogin();

  function onUpdateUsername() {
    setConfirmNewPasswordError("");
    setConfirmPasswordError("");
    setUpdateUsernameError("");
    client
      .PATCH("/api/v1/users/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: profile?.id as string,
          },
        },
        body: {
          newUsername: username,
          oldPassword: confirmPassword,
        },
      })
      .then((res) => {
        if (res.response.status === 204) {
          setEditUsername(false);
          setConfirmPasswordError("");
          setUpdateUsernameError("");
          setConfirmPassword("");
          setIsVisible(false);
          toast.success("อัพเดทชื่อผู้ใช้สำเร็จ", { position: "bottom-right" });
          login(username, confirmPassword).then((res) => {
            setCookie("shopping-jwt", res.access_token, {
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });
          });
        } else if (res.response.status === 400) {
          console.log(res.error?.message);
          if (res.error?.message === "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว") {
            setUpdateUsernameError(res.error?.message as string);
          }
          if (res.error?.message === "รหัสผ่านไม่ถูกต้อง") {
            setConfirmPasswordError(res.error?.message as string);
          }
        }
      });
  }

  function onUpdatePassword() {
    setOldPasswordError("");
    setNewPasswordError("");

    if (newPassword !== confirmnewPassword) {
      setConfirmNewPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    client
      .PATCH("/api/v1/users/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: profile?.id as string,
          },
        },
        body: {
          newPassword: newPassword,
          oldPassword: oldPassword,
        },
      })
      .then((res) => {
        if (res.response.status === 204) {
          setOldPassword("");
          setEditPassword(false);
          setIsVisible(false);
          setIsNewPasswordVisible(false);
          setIsConfirmNewPasswordVisible(false);
          setNewPassword("");
          setConfirmNewPassword("");
          setOldPasswordError("");
          setNewPasswordError("");
          setConfirmNewPasswordError("");
          toast.success("อัพเดทรหัสผ่านสำเร็จ", { position: "bottom-right" });
          login(username, newPassword).then((res) => {
            setCookie("shopping-jwt", res.access_token, {
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });
          });
        } else if (res.response.status === 400) {
          setOldPasswordError(res.error?.message as string);
        }
      });
  }

  return (
    <UserLayout settings={settings} profile={profile}>
      <title>{`${settings.name} - จัดการบัญชีส่วนตัว`}</title>
      <main className="w-full lg:w-1/2 xl:w-1/3 mx-auto px-5">
        <div className="flex flex-row">
          <div>
            <p className="text-2xl font-semibold">จัดการบัญชีส่วนตัว</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex-grow">
            <p className="text-lg">ชื่อผู้ใช้</p>
          </div>
          <div className="flex flex-row gap-3">
            <div className="flex-grow">
              <Input
                isInvalid={updateUsernameError !== ""}
                errorMessage={updateUsernameError}
                value={username}
                onValueChange={(value) => setUsername(value)}
                isDisabled={!editUsername}
                size="sm"
              />
            </div>
          </div>
          {!editUsername ? (
            <div className="self-end">
              <Button
                variant="light"
                onClick={() => setEditUsername(true)}
                color="primary"
              >
                แก้ไขชื่อผู้ใช้
              </Button>
            </div>
          ) : null}
        </div>
        {editUsername ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex-grow">
              <p className="text-lg">ยืนยันรหัสผ่าน</p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="flex-grow">
                <Input
                  isInvalid={confirmPasswordError !== ""}
                  errorMessage={confirmPasswordError}
                  type={isVisible ? "text" : "password"}
                  value={confirmPassword}
                  onValueChange={(value) => setConfirmPassword(value)}
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
                  size="sm"
                />
              </div>
            </div>
            <div className="self-end pt-2">
              <Button
                className="ml-2"
                variant="light"
                onClick={() => {
                  setUsername(profile?.username as string);
                  setConfirmPasswordError("");
                  setConfirmPassword("");
                  setUpdateUsernameError("");
                  setEditUsername(false);
                  setIsVisible(false);
                }}
              >
                ยกเลิก
              </Button>
              <Button
                className="ml-2"
                color="primary"
                onClick={onUpdateUsername}
              >
                ยืนยัน
              </Button>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col">
          <div className="flex-grow">
            <p className="text-lg">
              {editPassword ? "รหัสผ่านเก่า" : "รหัสผ่าน"}
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <div className="flex-grow">
              <Input
                isInvalid={oldPasswordError !== ""}
                errorMessage={oldPasswordError}
                placeholder={!editPassword ? "******" : ""}
                onValueChange={(value) => setOldPassword(value)}
                value={oldPassword}
                isDisabled={!editPassword}
                type={isOldPasswordVisible ? "text" : "password"}
                size="sm"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleOldPasswordVisibility}
                  >
                    {isOldPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
          </div>
          {!editPassword ? (
            <div className="self-end pt-2">
              <Button
                color="primary"
                variant="light"
                onClick={() => setEditPassword(true)}
              >
                แก้ไขรหัสผ่าน
              </Button>
            </div>
          ) : null}
        </div>
        {editPassword ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex-grow">
              <p className="text-lg">รหัสผ่านใหม่</p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="flex-grow">
                <Input
                  isInvalid={newPasswordError !== ""}
                  errorMessage={newPasswordError}
                  type={isNewPasswordVisible ? "text" : "password"}
                  value={newPassword}
                  onValueChange={(value) => setNewPassword(value)}
                  size="sm"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleNewPasswordVisibility}
                    >
                      {isNewPasswordVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-lg">ยืนยันรหัสผ่านใหม่</p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="flex-grow">
                <Input
                  isInvalid={confirmNewPasswordError !== ""}
                  errorMessage={confirmNewPasswordError}
                  type={isConfirmNewPasswordVisible ? "text" : "password"}
                  value={confirmnewPassword}
                  onValueChange={(value) => setConfirmNewPassword(value)}
                  size="sm"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleConfirmNewPasswordVisibility}
                    >
                      {isConfirmNewPasswordVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
            <div className="self-end pt-2">
              <Button
                className="ml-2"
                variant="light"
                onClick={() => {
                  setOldPassword("");
                  setIsOldPasswordVisible(false);
                  setEditPassword(false);
                  setIsVisible(false);
                  setIsNewPasswordVisible(false);
                  setIsConfirmNewPasswordVisible(false);
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setNewPasswordError("");
                  setConfirmNewPasswordError("");
                  setOldPasswordError("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={onUpdatePassword}
                className="ml-2"
                color="primary"
              >
                ยืนยัน
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </UserLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", {
    req: ctx.req,
    res: ctx.res,
  }) as string | null;

  const profile = await getProfile(shopping_jwt);

  if (shopping_jwt) {
    if (profile?.role === 100) {
      return {
        redirect: {
          destination: "/admin/manage_personal_account",
          permanent: false,
        },
      };
    }
    return {
      props: {
        settings,
        profile,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
}
