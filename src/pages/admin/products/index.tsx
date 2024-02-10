import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { placeholder } from "@/const/placeholder";
import { ProductAllResponseDto, settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";
import isURL from "validator/lib/isURL";

async function fetchAllProducts() {
  const products = await client.GET("/api/v1/products", {
    params: {
      query: {
        status: "all",
      },
    },
  });
  return products.data as ProductAllResponseDto[] | undefined;
}

export default function AllProducts({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [showAll, setShowAll] = useState<boolean>(true);
  const { data } = useQuery({
    queryKey: ["all-products"],
    queryFn: fetchAllProducts,
  });
  const products = data as ProductAllResponseDto[];

  return (
    <AdminLayout settings={settings}>
      <Head>
        <title>{`${settings.name} - สินค้าทั้งหมด`}</title>
      </Head>
      <div className="flex flex-row">
        <div>
          <h1 className="text-2xl font-semibold">สินค้าทั้งหมด</h1>
        </div>
        <div className="ml-auto">
          <div className="flex flex-row gap-3 justify-end">
            <div className="flex flex-row">
              <div className="self-center">
                <span className={`${showAll ? "text-gray-400" : "text-black"}`}>
                  แบบร่าง
                </span>
              </div>
              <Switch
                isSelected={showAll}
                className="ml-2"
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowAll(true);
                  } else {
                    setShowAll(false);
                  }
                }}
              />
              <div className="self-center">
                <span className={`${showAll ? "text-black" : "text-gray-400"}`}>
                  ทั้งหมด
                </span>
              </div>
            </div>
            <div>
              <Button onClick={() => router.push("/admin/products/create")}>
                เพิ่มสินค้า
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Table aria-label="all products">
          <TableHeader>
            <TableColumn>ชื่อสินค้า</TableColumn>
            <TableColumn>รูปภาพ</TableColumn>
            <TableColumn>สถานะ</TableColumn>
            <TableColumn>การเผยแพร่</TableColumn>
            <TableColumn>แก้ไข</TableColumn>
          </TableHeader>
          <TableBody>
            {products?.map((product) => {
              return (
                <TableRow
                  key={product._id}
                  hidden={showAll ? false : product.published_at !== null}
                >
                  <TableCell>
                    <div className="max-w-md">
                      <p className="truncate">{product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell width={80}>
                    <Image
                      src={
                        product.image.length > 0
                          ? isURL(product.image[0])
                            ? product.image[0]
                            : placeholder
                          : placeholder
                      }
                      alt={product.name}
                      width={80}
                      height={80}
                      className="aspect-square object-cover"
                    />
                  </TableCell>
                  <TableCell width={70}>
                    {product.isAvailable ? "มีสินค้า" : "หมด"}
                  </TableCell>
                  <TableCell width={70}>
                    {product.published_at !== null ? "เผยแพร่" : "แบบร่าง"}
                  </TableCell>
                  <TableCell width={20}>
                    <button
                      onClick={() =>
                        router.push(`/admin/products/edit?id=${product._id}`)
                      }
                    >
                      <PencilSquare className="mt-1" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            }) || []}
          </TableBody>
        </Table>
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
