import { settingsSchema } from "@/types/swagger.types";
import AdminHeader from "./AdminHeader";
import { createContext, useState } from "react";

export const AdminMenuContext = createContext({
  isOpen: true,
  setIsOpen: (isOpen: boolean) => {
    isOpen;
  },
});

export default function AdminLayout({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: settingsSchema;
}) {
  return (
    <>
      <main className="bg-gray-100 w-screen h-screen left-0 right-0 top-0 bottom-0 fixed flex">
        <AdminHeader settings={settings} />
        <div className="mx-5 my-5 px-5 py-5 rounded-md bg-white overflow-auto flex-grow no-scrollbar">
          {children}
        </div>
      </main>
    </>
  );
}
