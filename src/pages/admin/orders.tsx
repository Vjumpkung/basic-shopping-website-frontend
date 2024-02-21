import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { OrdersAllResponseDto, settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { OrderStatusTH, chipStatusColor } from "@/utils/orders_status";
import { getProfile } from "@/utils/profile";
import {
  Chip,
  Input,
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
import { useRouter } from "next/router";
import { PencilSquare } from "react-bootstrap-icons";

const getOrders = async (shopping_jwt: string) => {
  const res = await client.GET("/api/v1/orders", {
    headers: {
      authorization: `Bearer ${shopping_jwt}`,
    },
  });
  return res.data;
};

export default function ManageOrders({
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const shopping_jwt = getCookie("shopping-jwt") as string;

  const { data } = useQuery({
    queryKey: [],
    queryFn: () => getOrders(shopping_jwt),
  });

  const orders = data;

  const router = useRouter();

  return (
    <AdminLayout settings={settings}>
      <Head>
        <title>{`${settings.name} - จัดการออเดอร์ทั้งหมด`}</title>
      </Head>
      <main>
        <div className="flex flex-row">
          <div className="flex-none">
            <p className="text-2xl font-semibold">จัดการออเดอร์ทั้งหมด</p>
          </div>
        </div>
        <div className="mt-6">
          <Table aria-label="all orders">
            <TableHeader>
              <TableColumn>ผู้ใช้</TableColumn>
              <TableColumn>สินค้าที่สั่ง</TableColumn>
              <TableColumn>ราคารวม</TableColumn>
              <TableColumn>สถานะ</TableColumn>
              <TableColumn>วันที่สั่งซื้อ</TableColumn>
              <TableColumn>ปรับสถานะ</TableColumn>
            </TableHeader>
            <TableBody>
              {orders?.map((order: OrdersAllResponseDto) => (
                <TableRow key={order._id}>
                  <TableCell>{order.user.username}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="truncate">
                        {order.shopping_cart
                          .map((cart) => {
                            return cart.product.name;
                          })
                          .join(", ")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell width={150}>
                    {order.total_price.toLocaleString()} บาท
                  </TableCell>
                  <TableCell width={120}>
                    <div className="flex justify-center">
                      <Chip radius="sm" color={chipStatusColor(order.status)}>
                        {OrderStatusTH(order.status)}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell width={200}>
                    {new Date(order.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {new Date(order.created_at).toLocaleTimeString("th-TH")}
                  </TableCell>
                  <TableCell width={60}>
                    <button
                      onClick={() =>
                        router.push(`/admin/orders/edit?id=${order._id}`)
                      }
                    >
                      <PencilSquare />
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
