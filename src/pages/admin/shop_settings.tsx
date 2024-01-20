import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import { Button, Image, Input } from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import { CldUploadButton, CldUploadWidgetInfo } from "next-cloudinary";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ShopSettings({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [loadsettings, setLoadSettings] = useState<settingsSchema>(settings);
  const [token, setToken] = useState<string | null>(null);
  const [isLogoHover, setIsLogoHover] = useState<boolean>(false);
  const [showLogoSettings, setShowLogoSettings] = useState<boolean>(false);
  const [configlogo, setConfigLogo] = useState<string>(settings.logo);
  const [configName, setConfigName] = useState<string>(settings.name);
  const [resource, setResource] = useState<CldUploadWidgetInfo | null>(null);
  const [editName, setEditName] = useState<boolean>(true);
  const router = useRouter();

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
    <AdminLayout settings={loadsettings}>
      <title>{loadsettings?.name + " - ตั้งค่าร้านค้า"}</title>
      <div className="w-full">
        <h1 className="text-2xl font-semibold">ตั้งค่าร้านค้า</h1>
      </div>
      <h2 className="text-2xl mt-7">ตั้งค่าโลโก้ร้านค้า</h2>
      <div className="flex flex-row flex-wrap">
        <div className="mx-3 my-3 flex-none">
          <button
            onClick={() => {
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
                } fixed z-50 font-bold self-center text-lg text-white bg-black rounded-lg px-2 py-1`}
              >
                แก้ไขโลโก้
              </div>
              <Image
                src={loadsettings.logo}
                width={120}
                height={120}
                className="aspect-square px-2 py-2"
              />
            </div>
          </button>
        </div>
        {showLogoSettings === false ? null : (
          <div className="my-auto flex-grow" aria-label="change logo">
            URL
            <Input
              value={configlogo}
              onChange={(e) => {
                setConfigLogo(e.target.value);
              }}
            />
            <div className="my-2 flex flex-row">
              <div className="flex-auto self-start">
                <Button>
                  <CldUploadButton
                    uploadPreset="n1wehvy6"
                    onUpload={(result, widget) => {
                      setResource(result?.info as CldUploadWidgetInfo);
                      setConfigLogo(resource?.secure_url as string);
                      widget.close();
                    }}
                  >
                    อัพโหลดรูปภาพ
                  </CldUploadButton>
                </Button>
              </div>
              <div className="self-end">
                <Button
                  className="mx-2"
                  variant="light"
                  onClick={() => setShowLogoSettings(false)}
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
      <h2 className="text-2xl mt-7">ตั้งค่าชื่อร้านค้า</h2>
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
