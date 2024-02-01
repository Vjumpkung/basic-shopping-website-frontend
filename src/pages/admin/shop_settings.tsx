import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import { Button, Image, Input } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import { CldUploadButton, CldUploadWidgetInfo } from "next-cloudinary";
import Head from "next/head";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ShopSettings({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loadsettings, setLoadSettings] = useState<settingsSchema>(settings);
  const [previewlogo, setPreviewLogo] = useState<string>(settings.logo);
  const token = getCookie("shopping-jwt") as string | null;
  const [isLogoHover, setIsLogoHover] = useState<boolean>(false);
  const [showLogoSettings, setShowLogoSettings] = useState<boolean>(false);
  const [configlogo, setConfigLogo] = useState<string>(settings.logo);
  const [configName, setConfigName] = useState<string>(settings.name);
  const [resource, setResource] = useState<CldUploadWidgetInfo | null>(null);
  const [editName, setEditName] = useState<boolean>(true);

  function updateLogo() {
    client
      .PATCH("/api/v1/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          logo: configlogo,
        },
      })
      .then((res) => {
        toast.success("อัพเดทโลโก้ร้านค้าแล้ว", { position: "bottom-right" });
        setLoadSettings({ ...loadsettings, logo: configlogo });
      });
  }

  function updateName() {
    client
      .PATCH("/api/v1/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: configName,
        },
      })
      .then((res) => {
        toast.success("อัพเดทชื่อร้านค้าแล้ว", { position: "bottom-right" });
        setLoadSettings({ ...loadsettings, name: configName });
      });
  }

  useEffect(() => {
    setPreviewLogo(resource ? resource?.secure_url : loadsettings.logo);
    setConfigLogo(resource?.secure_url as string);
  }, [resource]);

  return (
    <AdminLayout settings={loadsettings}>
      <Head>
        <title>{loadsettings?.name + " - ตั้งค่าร้านค้า"}</title>
      </Head>
      <div className="w-full">
        <h1 className="text-2xl font-semibold">ตั้งค่าร้านค้า</h1>
      </div>
      <h2 className="text-xl mt-7">ตั้งค่าโลโก้ร้านค้า</h2>
      <div className="flex flex-row flex-wrap max-h-[164px] h-full">
        <div className="mx-3 my-3 flex-none">
          <button
            onClick={() => {
              setPreviewLogo(loadsettings.logo);
              setConfigLogo(loadsettings.logo);
              setShowLogoSettings(true);
            }}
          >
            <div
              className={`hover:bg-gray-400 rounded-lg flex justify-center`}
              onMouseEnter={() => {
                setIsLogoHover(true);
              }}
              onMouseLeave={() => {
                setIsLogoHover(false);
              }}
            >
              <div
                className={`${
                  isLogoHover ? "block" : "hidden"
                } fixed z-50 self-center text-lg text-white bg-black rounded-lg px-2 py-1`}
              >
                แก้ไขโลโก้
              </div>
              <Image
                src={previewlogo}
                width={120}
                height={120}
                className="aspect-square object-cover px-2 py-2"
              />
            </div>
          </button>
        </div>
        {showLogoSettings === false ? null : (
          <div className="my-auto flex-grow" aria-label="change logo">
            URL
            <p className="text-red-500 text-sm">
              *รูปภาพควรเป็นสี่เหลี่ยมจตุรัส
            </p>
            <Input
              className="py-2"
              size="sm"
              value={configlogo}
              onChange={(e) => {
                setPreviewLogo(e.target.value);
                setConfigLogo(e.target.value);
              }}
            />
            <div className="mt-2 flex flex-row">
              <div className="flex-auto self-start">
                <CldUploadButton
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  uploadPreset="n1wehvy6"
                  onUpload={(result, widget) => {
                    setResource(result?.info as CldUploadWidgetInfo);
                    widget.close();
                  }}
                >
                  อัพโหลดรูปภาพ
                </CldUploadButton>
              </div>
              <div className="self-end">
                <Button
                  className="mx-2"
                  variant="light"
                  onClick={() => {
                    setShowLogoSettings(false);
                    setPreviewLogo(loadsettings.logo);
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="mx-2"
                  color="primary"
                  onClick={() => {
                    updateLogo();
                    setShowLogoSettings(false);
                  }}
                >
                  เสร็จสิ้น
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <h2 className="text-xl mt-7">ตั้งค่าชื่อร้านค้า</h2>
      <div className="flex flex-row flex-wrap">
        <div className="flex-grow">
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            isDisabled={editName}
          />
        </div>
        <div className="flex-none pl-5 self-center">
          <Button className="mx-2" onClick={() => setEditName(false)}>
            แก้ไข
          </Button>
        </div>
      </div>
      <div className="flex flex-col py-3">
        {!editName ? (
          <div className="self-end">
            <Button
              className="mx-2"
              variant="light"
              onClick={() => setEditName(true)}
            >
              ยกเลิก
            </Button>
            <Button
              className="mx-2"
              color="primary"
              onClick={() => {
                updateName();
                setEditName(true);
              }}
            >
              เสร็จสิ้น
            </Button>
          </div>
        ) : null}
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
