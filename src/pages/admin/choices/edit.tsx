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
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditChoice({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const id = router.query.id;

  const [choice, setChoice] = useState<choiceSchema | undefined>(undefined); // [1
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
    if (id === undefined) {
      router.push("/admin/products");
    }
    client
      .GET("/api/v1/choices/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: id as string,
          },
        },
      })
      .then((res) => {
        setChoice(res.data);
      });
  }, []);

  useEffect(() => {
    setChoiceName(choice?.name as string);
    setChoicePrice(choice?.price as number);
  }, [choice]);

  function onSave() {
    client.PATCH("/api/v1/choices/{id}", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id as string,
        },
      },
      body: {
        name: choiceName,
        price: choicePrice,
      },
    });
    toast.success("แก้ไขตัวเลือกเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/choices");
    }, 500);
  }

  function onDelete() {
    client.DELETE("/api/v1/choices/{id}", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id as string,
        },
      },
    });
    toast.warning("ลบตัวเลือกเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/choices");
    }, 500);
  }

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - แก้ไขตัวเลือก ${id}`}</title>
      <main>
        <div className="flex flex-row">
          <div className="flex-grow">
            <h1 className="text-3xl">แก้ไขตัวเลือก</h1>
          </div>
          <div className="flex-none self-end">
            <Popover placement="bottom-end" color="default">
              <PopoverTrigger>
                <Button size="sm" color="danger" className="mx-1">
                  ลบ
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <p>คุณต้องการลบตัวเลือกนี้ใช่หรือไม่</p>
                <div className="flex flex-row gap-2 mt-2">
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => {
                      onDelete();
                    }}
                  >
                    ลบตัวเลือก
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
              onClick={() => onSave()}
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

export async function getServerSideProps() {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  return {
    props: {
      settings,
    },
  };
}
