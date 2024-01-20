import { settingsSchema } from "@/types/swagger.types";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: settingsSchema;
}) {
  return (
    <>
      <main className="bg-gray-100 w-screen h-screen flex">
        <AdminHeader settings={settings} />
        <div className="mx-5 my-5 px-5 py-5 border border-black rounded-md bg-white overflow-auto flex-grow">
          {children}
        </div>
      </main>
    </>
  );
}
