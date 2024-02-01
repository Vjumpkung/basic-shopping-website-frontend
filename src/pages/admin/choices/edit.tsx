import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { choiceSchema, settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { get } from "http";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function EditChoice({
  settings,
  choice_res,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const id = router.query.id;
  const [choice, setChoice] = useState<choiceSchema | undefined>(choice_res);
  const [choiceName, setChoiceName] = useState<string>(choice?.name as string);
  const [choicePrice, setChoicePrice] = useState<number>(
    choice?.price as number
  );
  const token = getCookie("shopping-jwt") as string | null;

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
      <Head>
        <title>{`${settings.name} - แก้ไขตัวเลือก ${choiceName}`}</title>
      </Head>
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

    if (ctx.query.id === undefined) {
      return {
        redirect: {
          destination: "/admin/choices",
          permanent: false,
        },
      };
    }

    const choice = await client.GET("/api/v1/choices/{id}", {
      headers: {
        Authorization: `Bearer ${shopping_jwt}`,
      },
      params: {
        path: {
          id: ctx.query.id as string,
        },
      },
    });

    return {
      props: {
        settings,
        choice_res: choice.data as choiceSchema | undefined,
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
