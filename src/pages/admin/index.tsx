import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import { InferGetServerSidePropsType, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminPage({
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
  }, [token]);

  return (
    <AdminLayout settings={settings}>
      <title>{settings?.name + " - หน้าแอดมิน"}</title>
      <div className="">
        <div className="w-full">
          <h1 className="text-3xl">หน้าแอดมิน</h1>
          <p>ยินดีต้อนรับเข้าสู่หลังบ้านของ {settings.name}</p>
        </div>
      </div>
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
