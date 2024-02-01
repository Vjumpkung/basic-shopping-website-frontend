import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import ProductForm from "@/components/ProductForm";
import { ProductCreateDto, settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import { Button } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateProduct({
  settings,
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const token = getCookie("shopping-jwt") as string | null;

  const [published_at, setPublishedAt] = useState(false);

  const [create_product, setCreateProduct] = useState<ProductCreateDto>({
    name: "",
    description: "",
    price: 0,
    choices: [],
    image: [],
  });

  function onSave() {
    if (create_product?.name === "") {
      toast.error("กรุณากรอกชื่อสินค้า", { position: "bottom-right" });
      return;
    }

    client.POST("/api/v1/products", {
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: create_product.name,
        description: create_product?.description,
        price: create_product?.price,
        choices: create_product?.choices,
        image: create_product?.image,
        published_at: published_at ? new Date().toISOString() : undefined,
      },
    });
    toast.success("เพิ่มสินค้าเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/products");
    }, 500);
  }

  return (
    <AdminLayout settings={settings}>
      <Head>
        <title>{`${settings.name} - เพิ่มสินค้า`}</title>
      </Head>
      <div className="flex flex-row">
        <div className="flex-grow">
          <h1 className="text-2xl font-bold">เพิ่มสินค้า</h1>
        </div>
        <div className="flex-none self-end">
          <Button
            size="sm"
            color="default"
            className="mx-1"
            onClick={() => router.push("/admin/products")}
          >
            ยกเลิก
          </Button>
          <Button
            size="sm"
            color="primary"
            className="mx-1"
            onClick={() => onSave()}
          >
            ยืนยันการเพิ่มสินค้า
          </Button>
        </div>
      </div>
      <ProductForm
        setIsPublish={setPublishedAt}
        setProductCreate={setCreateProduct}
      />
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
