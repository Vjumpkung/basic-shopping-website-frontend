import { settingsSchema } from "@/types/swagger.types";
import { Listbox, ListboxItem } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bag,
  CheckCircle,
  DoorClosed,
  FileEarmarkPerson,
  Gear,
  House,
  Person,
  Shop,
} from "react-bootstrap-icons";

export default function AdminHeader({
  settings,
}: {
  settings: settingsSchema;
}) {
  const router = useRouter();

  return (
    <div className="rounded-md max-w-xs flex-none mx-5 my-5 px-2 py-2 bg-white">
      <Link href="/" prefetch={false}>
        <div className="flex flex-row flex-wrap">
          <div className="mx-2 mt-2">
            <Image src={settings.logo} width={32} height={32} alt="logo" />
          </div>
          <div className="flex-grow mt-3 mr-4">
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
            localStorage.removeItem("shopping-jwt");
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
  );
}
