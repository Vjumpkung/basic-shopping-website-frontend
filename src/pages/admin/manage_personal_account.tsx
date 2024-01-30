import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import EditPersonalAccount from "@/components/EditPersonalAccount";
import { settingsSchema } from "@/types/swagger.types";
import { getProfile } from "@/utils/profile";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";

export default function ManagePersonalAccount({
  settings,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - จัดการบัญชีส่วนตัว`}</title>
      <EditPersonalAccount profile={profile} />
    </AdminLayout>
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
    if (profile?.role !== 100) {
      return {
        notFound: true,
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
