import { settingsSchema } from "@/types/swagger.types";
import Footer from "./Footer";
import Header from "./Header";

export default function UserLayout({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: settingsSchema;
}) {
  return (
    <>
      <main>
        <Header settings={settings} />
        {children}
        <Footer />
      </main>
    </>
  );
}
