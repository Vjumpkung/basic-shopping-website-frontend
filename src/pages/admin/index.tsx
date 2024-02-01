import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";

export default function AdminPage({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout settings={settings}>
      <Head>
        <title>{settings?.name + " - หน้าแอดมิน"}</title>
      </Head>
      <div className="">
        <div className="w-full">
          <h1 className="text-3xl">หน้าแอดมิน</h1>
          <p>ยินดีต้อนรับเข้าสู่หลังบ้านของ {settings.name}</p>
        </div>
      </div>
    </AdminLayout>
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

  const profile = await getProfile(shopping_jwt);

  if (shopping_jwt) {
    if (profile?.role !== 100) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        settings,
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
