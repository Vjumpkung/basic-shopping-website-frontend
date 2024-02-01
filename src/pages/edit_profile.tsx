import client from "@/api/client";
import EditPersonalAccount from "@/components/EditPersonalAccount";
import UserLayout from "@/components/UserLayout";
import { ProfileResponseDto, settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";

export default function EditProfile({
  settings,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <UserLayout settings={settings} profile={profile}>
      <Head>
        <title>{`${settings.name} - แก้ไขข้อมูลส่วนตัว`}</title>
      </Head>
      <EditPersonalAccount
        profile={profile}
        className="w-full lg:w-1/2 xl:w-1/3 mx-auto px-5"
      />
    </UserLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  if (await apiCheck()) {
    return { redirect: { destination: "/500", permanent: false } };
  }

  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", {
    req: ctx.req,
    res: ctx.res,
  }) as string | null;

  const profile = (await getProfile(shopping_jwt)) as ProfileResponseDto;

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
