import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Avatar,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@nextui-org/react";
import { ProfileResponseDto, settingsSchema } from "@/types/swagger.types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import client from "@/api/client";
import { toast } from "react-toastify";

export default function Header({
  settings,
}: {
  settings: settingsSchema | undefined;
}) {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const router = useRouter();

  const [me, setMe] = useState<ProfileResponseDto | undefined>();

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      setIsLogin(true);
      client
        .GET("/api/v1/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setMe(res.data);
        });
    }
  }, [router]);

  if (router.pathname === "/signin" || router.pathname === "/signup")
    return null;

  const logout_notify = () =>
    toast.info("คุณได้ออกจากระบบแล้ว", { position: "bottom-right" });

  return (
    <header>
      <Navbar>
        <NavbarContent>
          <Link href="/">
            <NavbarBrand>
              <Image
                src={
                  settings
                    ? settings.logo
                    : "https://upload.wikimedia.org/wikipedia/commons/7/70/Solid_white.svg"
                }
                alt="logo"
                width={32}
                height={32}
                className="mx-2"
              />
              <p className="font-bold text-inherit hidden sm:block">
                {settings?.name}
              </p>
            </NavbarBrand>
          </Link>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            {isLogin ? (
              <Link href="/cart">
                <Image
                  src={`/shopping-cart.svg`}
                  width={32}
                  height={32}
                  alt="cart"
                />
              </Link>
            ) : null}
          </NavbarItem>
          <NavbarItem>
            {isLogin ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered={true}
                    name={me?.username[0].toUpperCase()}
                    as="button"
                    className="transition-transform"
                    color={me?.role === 100 ? "primary" : "default"}
                    size="sm"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold text-xl">{me?.username}</p>
                    <p className="text-gray-500">
                      {me?.role === 100 ? "Admin" : "User"}
                    </p>
                  </DropdownItem>

                  <DropdownItem
                    key="profile-button"
                    onClick={() => router.push("/profile")}
                  >
                    บัญชีของฉัน
                  </DropdownItem>
                  <DropdownItem
                    key="address"
                    onClick={() => router.push("/address")}
                  >
                    จัดการที่อยู่
                  </DropdownItem>
                  <DropdownItem
                    key="logout-button"
                    color="danger"
                    onClick={() => {
                      logout_notify();
                      localStorage.removeItem("shopping-jwt");
                      setIsLogin(false);
                      router.push("/");
                    }}
                  >
                    ออกจากระบบ
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Link href={isLogin ? "/profile" : "/signin"}>
                <Avatar
                  isBordered={true}
                  showFallback={true}
                  as="button"
                  className="transition-transform"
                  color="default"
                  size="sm"
                />
              </Link>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </header>
  );
}
