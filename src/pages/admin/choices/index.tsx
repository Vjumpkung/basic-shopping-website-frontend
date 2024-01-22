import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { choiceSchema, settingsSchema } from "@/types/swagger.types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";

export default function ManageChoices({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [token, setToken] = useState<string | null>(null);
  const [choices, setChoices] = useState<choiceSchema[] | undefined>(undefined); // [1
  const router = useRouter();

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
      client
        .GET("/api/v1/choices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setChoices(res.data?.reverse());
        });
    } else {
      router.push("/signin");
    }
  }, []);

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings?.name} - จัดการตัวเลือก`}</title>
      <main>
        <div className="flex flex-row">
          <div>
            <h1 className="text-2xl font-semibold">จัดการตัวเลือกสินค้า</h1>
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => {
                router.push("/admin/choices/create");
              }}
            >
              เพิ่มตัวเลือก
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <Table aria-label="all choices">
            <TableHeader>
              <TableColumn>ชื่อ</TableColumn>
              <TableColumn>ราคา</TableColumn>
              <TableColumn>แก้ไข</TableColumn>
            </TableHeader>

            <TableBody>
              {choices?.map((choice) => (
                <TableRow key={choice._id}>
                  <TableCell>{choice.name}</TableCell>
                  <TableCell>{choice.price}</TableCell>
                  <TableCell width={20}>
                    <button
                      onClick={() =>
                        router.push(`/admin/choices/edit?id=${choice._id}`)
                      }
                    >
                      <PencilSquare className="mt-1" />
                    </button>
                  </TableCell>
                </TableRow>
              )) || []}
            </TableBody>
          </Table>
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
