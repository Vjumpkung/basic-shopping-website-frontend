import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { ProductAllResponseDto, settingsSchema } from "@/types/swagger.types";
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
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";

export default function AllProducts({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [showAll, setShowAll] = useState<boolean>(true);
  const [products, setProducts] = useState<ProductAllResponseDto[] | undefined>(
    undefined
  );

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
    client
      .GET("/api/v1/products", {
        params: {
          query: {
            status: "all",
          },
        },
      })
      .then((res) => {
        setProducts(res.data);
      });
  }, []);

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - สินค้าทั้งหมด`}</title>
      <div className="flex flex-row">
        <div>
          <h1 className="text-2xl font-semibold">สินค้าทั้งหมด</h1>
        </div>
        <div className="ml-auto">
          <div className="flex flex-row gap-3">
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
            {products
              ?.filter((product) => {
                if (showAll) {
                  return product;
                } else {
                  return product.published_at === null;
                }
              })
              ?.map((product) => {
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="truncate">{product.name}</p>
                      </div>
                    </TableCell>
                    <TableCell width={80}>
                      <Image
                        src={product.image[0]}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="aspect-square object-cover"
                      />
                    </TableCell>
                    <TableCell width={70}>
                      {product.isAvailable ? "มีสินค้า" : "สินค้าหมด"}
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

export async function getServerSideProps() {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  return {
    props: {
      settings,
    },
  };
}
