import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import { getProfile } from "@/utils/profile";
import { Button, Input } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateChoice({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const [choiceName, setChoiceName] = useState<string>("");
  const [choicePrice, setChoicePrice] = useState<number>(0);

  const token = getCookie("shopping-jwt") as string | null;

  function onCreate() {
    client.POST("/api/v1/choices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: choiceName,
        price: choicePrice,
      },
    });
    toast.success("เพิ่มตัวเลือกเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/choices");
    }, 500);
  }

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - เพิ่มตัวเลือก`}</title>
      <main>
        <div className="flex flex-row">
          <div className="flex-grow">
            <h1 className="text-3xl">เพิ่มตัวเลือก</h1>
          </div>
          <div className="flex-none self-end">
            <Button
              size="sm"
              color="default"
              className="mx-1"
              onClick={() => router.push("/admin/choices")}
            >
              ยกเลิก
            </Button>
            <Button
              size="sm"
              color="primary"
              className="mx-1"
              onClick={() => onCreate()}
            >
              เพิ่มตัวเลือก
            </Button>
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <div>
            <p className="text-lg">ชื่อตัวเลือก</p>
          </div>
          <div className="flex-grow">
            <Input
              value={choiceName}
              onChange={(e) => setChoiceName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <div>
            <p className="text-lg">ราคา</p>
          </div>
          <div>
            <Input
              value={choicePrice?.toString()}
              type="number"
              onChange={(e) => setChoicePrice(Number(e.target.value))}
              endContent="บาท"
            />
          </div>
        </div>
      </main>
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
