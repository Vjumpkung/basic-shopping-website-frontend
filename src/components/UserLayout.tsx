import { ProfileResponseDto, settingsSchema } from "@/types/swagger.types";
import Footer from "./Footer";
import Header from "./Header";

export default function UserLayout({
  children,
  settings,
  profile,
}: {
  children: React.ReactNode;
  settings: settingsSchema;
  profile: ProfileResponseDto | null | undefined;
}) {
  return (
    <>
      <main>
        <Header settings={settings} profile={profile} />
        {children}
        <Footer />
      </main>
    </>
  );
}
