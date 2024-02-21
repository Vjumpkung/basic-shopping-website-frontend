import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { settingsSchema } from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import {
  OrderStatus,
  OrderStatusTH,
  chipStatusColor,
} from "@/utils/orders_status";
import { getProfile } from "@/utils/profile";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditOrder({
  settings,
  order,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [selectedStatus, setSelectedStatus] = useState<
    | "MUST_BE_PAID"
    | "MUST_BE_SHIPPED"
    | "MUST_BE_RECEIVED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED"
    | undefined
  >(order?.status);

  const token = getCookie("shopping-jwt") as string;
  const router = useRouter();
  const [trackingname, setTrackingName] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingUrl, setTrackingUrl] = useState<string>("");
  const [cancelledreason, setCancelledReason] = useState<string>("");

  useEffect(() => {
    if (order?.shipping !== null && selectedStatus === "MUST_BE_RECEIVED") {
      setTrackingName(order?.shipping?.provider as string);
      setTrackingNumber(order?.shipping?.tracking_number as string);
      setTrackingUrl(order?.shipping?.tracking_url as string);
    }
  }, [selectedStatus]);

  function onSave() {
    if (selectedStatus === "MUST_BE_PAID") {
      client
        .PATCH("/api/v1/orders/{id}/must_be_paid", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    } else if (selectedStatus === "MUST_BE_SHIPPED") {
      client
        .PATCH("/api/v1/orders/{id}/must_be_shipped", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    } else if (selectedStatus === "MUST_BE_RECEIVED") {
      if (trackingname === "" || trackingNumber === "" || trackingUrl === "") {
        toast.error("กรุณากรอกข้อมูลให้ครบ", { position: "bottom-right" });
        return;
      }
      client
        .PATCH("/api/v1/orders/{id}/must_be_recieved", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
          body: {
            provider: trackingname,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    } else if (selectedStatus === "COMPLETED") {
      client
        .PATCH("/api/v1/orders/{id}/completed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    } else if (selectedStatus === "CANCELLED") {
      if (cancelledreason === "") {
        toast.error("กรุณากรอกเหตุผลที่ยกเลิก", { position: "bottom-right" });
        return;
      }
      client
        .PATCH("/api/v1/orders/{id}/cancelled", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
          body: {
            cancelled_reason: cancelledreason,
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    } else if (selectedStatus === "REFUNDED") {
      client
        .PATCH("/api/v1/orders/{id}/refunded", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: order?._id as string,
            },
          },
        })
        .then(() => {
          toast.success("อัพเดทสถานะออเดอร์เรียบร้อย", {
            position: "bottom-right",
          });
          router.push("/admin/orders");
        });
    }
  }

  function onDelete() {
    client
      .DELETE("/api/v1/orders/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: order?._id as string,
          },
        },
      })
      .then(() => {
        toast.success("ลบออเดอร์เรียบร้อย", { position: "bottom-right" });
        router.push("/admin/orders");
      });
  }

  return (
    <AdminLayout settings={settings}>
      <Head>
        <title>{`${settings.name} - แก้ไขออเดอร์ ${order?._id}`}</title>
      </Head>
      <div className="flex flex-row">
        <div className="flex-grow">
          <h1 className="text-2xl font-semibold">แก้ไขออเดอร์ {order?._id}</h1>
        </div>
        <div className="flex-none self-end">
          <Popover placement="bottom-end" color="default">
            <PopoverTrigger>
              <Button size="sm" color="danger" className="mx-1">
                ลบ
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <p>คุณต้องการลบออเดอร์นี้ใช่หรือไม่</p>
              <div className="flex flex-row gap-2 mt-2">
                <Button
                  size="sm"
                  color="danger"
                  onClick={() => {
                    onDelete();
                  }}
                >
                  ลบออเดอร์
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            color="default"
            className="mx-1"
            onClick={() => router.push("/admin/orders")}
          >
            ยกเลิก
          </Button>
          <Button
            size="sm"
            color="primary"
            className="mx-1"
            onClick={() => {
              onSave();
            }}
          >
            ยืนยันการแก้ไขออเดอร์
          </Button>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">รายละเอียดออเดอร์</p>
        </div>
        <div>
          <Card className="w-full mx-auto px-1">
            <CardHeader>
              <div className="flex flex-row">
                <div className="flex-grow">
                  <p>
                    วันที่ :{" "}
                    {new Date(order?.created_at as string).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p>
                    เวลา :{" "}
                    {new Date(order?.created_at as string).toLocaleTimeString(
                      "th-TH"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-grow justify-end">
                <div>
                  <Chip
                    radius="sm"
                    color={chipStatusColor(order?.status as OrderStatus)}
                  >
                    {OrderStatusTH(order?.status as OrderStatus)}
                  </Chip>
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {order?.shopping_cart.map((item) => {
                return (
                  <div key={item._id} className="flex flex-col py-2">
                    <div>
                      <Image
                        src={item.product.image[0]}
                        width={80}
                        height={80}
                        alt={"รูปภาพนั่นแหล่ะ"}
                        className="object-cover h-auto"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-none">
                      <p className="text-clip truncate text-lg">
                        {item.product.name}
                      </p>
                      {item.choice ? (
                        <p className="text-gray-500">
                          <span className="font-medium">ตัวเลือก</span> :{" "}
                          {item.choice.name}
                        </p>
                      ) : null}
                      <p className="font-semibold">
                        {item.choice
                          ? item.choice.price.toLocaleString()
                          : item.product.price.toLocaleString()}{" "}
                        บาท
                      </p>
                      <p>x{item.amount}</p>
                      {item.additional_info ? (
                        <p>ข้อมูลเพิ่มเติม : {" " + item.additional_info}</p>
                      ) : null}
                      <p className="text-right text-lg">
                        {item.total_price.toLocaleString()} บาท
                      </p>
                    </div>
                    <Divider />
                  </div>
                );
              })}
              {order?.shipping ? (
                <div>
                  <p className="text-right text-md">
                    บริการขนส่ง : {order.shipping.provider}
                  </p>
                  <p className="text-right text-md">
                    หมายเลขพัสดุ : {order.shipping.tracking_number}
                  </p>
                  <a
                    href={order.shipping.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p className="text-right text-md hover:text-blue-700 text-blue-500">
                      ติดตามพัสดุ
                    </p>
                  </a>
                </div>
              ) : null}
            </CardBody>
            <CardFooter>
              <div className="w-full">
                <div className="flex flex-col justify-end">
                  <div className="self-end flex-grow">
                    <p className="text-lg font-semibold">
                      ราคารวม : {order?.total_price.toLocaleString()} บาท
                    </p>
                  </div>
                  <Divider />
                  <div className="self-end flex-grow">
                    <p className="text-lg">ที่อยู่สำหรับจัดส่ง</p>
                  </div>
                  <div className="self-end flex-grow">
                    <p className="text-end">
                      {order?.address.title + " " + order?.address.telephone}
                    </p>
                    <p className="text-end">{order?.address.address}</p>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">ปรับสถานะออเดอร์</p>
        </div>
        <div>
          <Select
            selectedKeys={
              selectedStatus === undefined ? undefined : [selectedStatus]
            }
            onChange={(e) => {
              setSelectedStatus(
                e.target.value as
                  | "MUST_BE_PAID"
                  | "MUST_BE_SHIPPED"
                  | "MUST_BE_RECEIVED"
                  | "COMPLETED"
                  | "CANCELLED"
                  | "REFUNDED"
                  | undefined
              );
            }}
            items={[
              { label: OrderStatus.MUST_BE_PAID, value: "MUST_BE_PAID" },
              { label: OrderStatus.MUST_BE_SHIPPED, value: "MUST_BE_SHIPPED" },
              {
                label: OrderStatus.MUST_BE_RECEIVED,
                value: "MUST_BE_RECEIVED",
              },
              { label: OrderStatus.COMPLETED, value: "COMPLETED" },
              { label: OrderStatus.CANCELLED, value: "CANCELLED" },
              { label: OrderStatus.REFUNDED, value: "REFUNDED" },
            ]}
            disabledKeys={[selectedStatus as string]}
            size="sm"
            placeholder="เลือกสถานะ"
          >
            <SelectItem key={"MUST_BE_PAID"}>
              {OrderStatus.MUST_BE_PAID}
            </SelectItem>
            <SelectItem key={"MUST_BE_SHIPPED"}>
              {OrderStatus.MUST_BE_SHIPPED}
            </SelectItem>
            <SelectItem key={"MUST_BE_RECEIVED"}>
              {OrderStatus.MUST_BE_RECEIVED}
            </SelectItem>
            <SelectItem key={"COMPLETED"}>{OrderStatus.COMPLETED}</SelectItem>
            <SelectItem key={"CANCELLED"}>{OrderStatus.CANCELLED}</SelectItem>
            <SelectItem key={"REFUNDED"}>{OrderStatus.REFUNDED}</SelectItem>
          </Select>
        </div>
      </div>
      <div
        className={`mt-2 flex flex-col ${
          selectedStatus === "MUST_BE_RECEIVED" ? "block" : "hidden"
        }`}
      >
        <div>
          <p className="text-lg">ผู้จัดส่งออเดอร์</p>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <div className="flex-1">
            <Input
              value={trackingname}
              onValueChange={setTrackingName}
              type="text"
              size="sm"
              label="ชื่อผู้จัดส่ง"
            />
          </div>
          <div className="flex-1">
            <Input
              value={trackingNumber}
              onValueChange={setTrackingNumber}
              type="text"
              size="sm"
              label="หมายเลข Tracking"
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg">Tracking URL</p>
        </div>
        <div className="w-full">
          <Input
            value={trackingUrl}
            onValueChange={setTrackingUrl}
            type="url"
            size="sm"
            label="tracking URL"
          />
        </div>
      </div>
      <div
        className={`mt-2 flex flex-col ${
          selectedStatus === "CANCELLED" ? "block" : "hidden"
        }`}
      >
        <div>
          <p className="text-lg">เหตุผลที่ยกเลิกออเดอร์</p>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <div className="flex-1">
            <Input
              value={cancelledreason}
              onValueChange={setCancelledReason}
              type="text"
              size="sm"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const order_id = ctx.query.id;

  if (order_id === undefined) {
    return { redirect: { destination: "/orders", permanent: false } };
  }

  if (await apiCheck()) {
    return { redirect: { destination: "/500", permanent: false } };
  }
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", {
    req: ctx.req,
    res: ctx.res,
  }) as string | null;

  const get_order = await client.GET("/api/v1/orders/{id}", {
    params: {
      path: {
        id: order_id,
      },
    },
    headers: {
      Authorization: `Bearer ${shopping_jwt}`,
    },
  });

  const order = get_order.data;

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
        order,
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
