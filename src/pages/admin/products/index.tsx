import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { ProductResponseDto, settingsSchema } from "@/types/swagger.types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";

export default function AllProducts({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponseDto[] | undefined>(
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
          <Button onClick={() => router.push("/admin/products/create")}>
            เพิ่มสินค้า
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Table aria-label="all products">
          <TableHeader>
            <TableColumn>id</TableColumn>
            <TableColumn>ชื่อสินค้า</TableColumn>
            <TableColumn>รูปภาพ</TableColumn>
            <TableColumn>สถานะ</TableColumn>
            <TableColumn>การเผยแพร่</TableColumn>
            <TableColumn>แก้ไข</TableColumn>
          </TableHeader>
          <TableBody>
            {products?.map((product) => {
              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <code>{product._id}</code>
                  </TableCell>
                  <TableCell>
                    <p className="truncate">{product.name}</p>
                  </TableCell>
                  <TableCell>
                    <Image
                      src={product.image[0]}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="aspect-square w-full h-full object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    {product.isAvailable ? "มีสินค้า" : "สินค้าหมด"}
                  </TableCell>
                  <TableCell>
                    {product.published_at !== null ? "เผยแพร่" : "แบบร่าง"}
                  </TableCell>
                  <TableCell>
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
