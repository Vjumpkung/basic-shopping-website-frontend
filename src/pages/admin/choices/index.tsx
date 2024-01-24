import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { choiceSchema, settingsSchema } from "@/types/swagger.types";
import { getProfile } from "@/utils/profile";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";

export default function ManageChoices({
  settings,
  choices_res,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [choices, setChoices] = useState<choiceSchema[] | undefined>(
    choices_res
  );
  const router = useRouter();

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

export async function getServerSideProps(ctx: any) {
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

    const choices_res = await client.GET("/api/v1/choices", {
      headers: {
        Authorization: `Bearer ${shopping_jwt}`,
      },
    });

    return {
      props: {
        settings,
        choices_res: (choices_res.data as choiceSchema[] | undefined) || [],
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
