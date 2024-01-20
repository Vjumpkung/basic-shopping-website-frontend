import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { choiceSchema, settingsSchema } from "@/types/swagger.types";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CreateChoice({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  const [choiceName, setChoiceName] = useState<string>("");
  const [choicePrice, setChoicePrice] = useState<number>(0);

  const [token, setToken] = useState<string | null>(null);

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
              ยืนยันการแก้ไข
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

export async function getStaticProps() {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  return {
    props: {
      settings,
    },
    revalidate: 1,
  };
}
