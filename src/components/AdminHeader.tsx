import { settingsSchema } from "@/types/swagger.types";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { deleteCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
  Bag,
  CaretLeftFill,
  CaretRightFill,
  CheckCircle,
  DoorClosed,
  FileEarmarkPerson,
  Gear,
  Person,
  Shop,
} from "react-bootstrap-icons";
import { AdminMenuContext } from "./AdminLayout";

export default function AdminHeader({
  settings,
}: {
  settings: settingsSchema;
}) {
  const { isOpen, setIsOpen } = useContext(AdminMenuContext);

  const router = useRouter();

  return (
    <div
      className={`rounded-md flex ${
        isOpen ? "flex-row" : "flex-col"
      } ml-5 my-5 px-2 py-2 bg-white max-w-xs flex-none`}
    >
      <div className={`flex-none ${isOpen ? "block" : "hidden"}`}>
        <Link href="/" prefetch={false}>
          <div className="flex flex-row flex-wrap">
            <div className="mx-2 mt-2">
              <Image
                src={settings.logo}
                width={32}
                height={32}
                alt="logo"
                className="aspect-square object-cover"
              />
            </div>
            <div className="flex-grow mt-3 mr-4 truncate">
              <p className="text-xl">{settings.name}</p>
            </div>
          </div>
        </Link>
        <Listbox
          aria-label="admin menu"
          className="py-4"
          itemClasses={{
            base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100/80",
          }}
          onAction={(item) => {
            if (item !== "logout") {
              router.push(`/admin/${item}`);
            } else {
              deleteCookie("shopping-jwt");
              router.push(`/signin`);
            }
          }}
        >
          <ListboxItem startContent={<Bag className="mb-1" />} key="products">
            จัดการสินค้า
          </ListboxItem>
          <ListboxItem
            startContent={<CheckCircle className="mb-1" />}
            key="choices"
          >
            จัดการตัวเลือกสินค้า
          </ListboxItem>
          <ListboxItem startContent={<Shop className="mb-1" />} key="orders">
            จัดการออเดอร์
          </ListboxItem>
          <ListboxItem
            startContent={<Gear className="mb-1" />}
            key="shop_settings"
          >
            ตั้งค่าร้านค้า
          </ListboxItem>
          <ListboxItem
            startContent={<FileEarmarkPerson className="mb-1" />}
            key="manage_accounts"
          >
            จัดการบัญชีทั้งหมด
          </ListboxItem>
          <ListboxItem
            startContent={<Person className="mb-1" />}
            key="manage_personal_account"
          >
            จัดการบัญชีส่วนตัว
          </ListboxItem>
          <ListboxItem
            startContent={<DoorClosed className="mb-1" />}
            key="logout"
          >
            ออกจากระบบ
          </ListboxItem>
        </Listbox>
      </div>
      <div className={`flex-none ${isOpen ? "hidden" : "block"} mx-auto`}>
        <Link href="/" prefetch={false}>
          <div className="flex flex-row flex-wrap">
            <div className="mx-2 mt-2">
              <Image
                src={settings.logo}
                width={32}
                height={32}
                alt="logo"
                className="aspect-square object-cover"
              />
            </div>
          </div>
        </Link>
        <Listbox
          aria-label="admin menu"
          className="py-4"
          itemClasses={{
            base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100/80",
            title: "hidden",
          }}
          onAction={(item) => {
            if (item !== "logout") {
              router.push(`/admin/${item}`);
            } else {
              deleteCookie("shopping-jwt");
              router.push(`/signin`);
            }
          }}
        >
          <ListboxItem
            startContent={<Bag className="mb-1" />}
            key="products"
            title="products"
          />
          <ListboxItem
            startContent={<CheckCircle className="mb-1" />}
            key="choices"
            title="choices"
          />
          <ListboxItem
            startContent={<Shop className="mb-1" />}
            key="orders"
            title="orders"
          />
          <ListboxItem
            startContent={<Gear className="mb-1" />}
            key="shop_settings"
            title="shop_settings"
          />
          <ListboxItem
            startContent={<FileEarmarkPerson className="mb-1" />}
            key="manage_accounts"
            title="manage_accounts"
          />

          <ListboxItem
            startContent={<Person className="mb-1" />}
            key="manage_personal_account"
            title="manage_personal_account"
          />
          <ListboxItem
            startContent={<DoorClosed className="mb-1" />}
            key="logout"
            title="logout"
          />
        </Listbox>
      </div>

      <div className="w-full max-w-[20px] self-center">
        <button onClick={() => setIsOpen(!isOpen)}>
          <p className="text-center text-xl text-gray-500 transition hover:scale-125">
            {isOpen ? <CaretLeftFill /> : <CaretRightFill />}
          </p>
        </button>
      </div>
    </div>
  );
}
