import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ManageOrders({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      setToken(token);
      client
        .GET("/api/v1/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data?.role !== 100) {
            router.push("/404");
          }
        });
    } else {
      router.push("/signin");
    }
  }, []);

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - จัดการออเดอร์ทั้งหมด`}</title>
      <main>
        <div className="flex flex-row">
          <div>
            <p className="text-2xl font-semibold">จัดการออเดอร์ทั้งหมด</p>
          </div>
        </div>
        <div>
          <p>Work in progress...</p>
        </div>
      </main>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  return {
    props: {
      settings,
    },
  };
}
