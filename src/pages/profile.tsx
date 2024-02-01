import client from "@/api/client";
import UserLayout from "@/components/UserLayout";
import {
  OrdersByUserIdResponseDto,
  ProfileResponseDto,
  settingsSchema,
} from "@/types/swagger.types";
import apiCheck from "@/utils/apicheck";
import { getProfile } from "@/utils/profile";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";

enum OrderStatus {
  MUST_BE_PAID = "รอการชำระเงิน",
  MUST_BE_SHIPPED = "รอการจัดส่ง",
  MUST_BE_RECEIVED = "รอการรับสินค้า",
  COMPLETED = "สำเร็จ",
  CANCELED = "ยกเลิก",
  REFUNDED = "คืนเงิน",
}

function OrderStatusTH(status: string) {
  if (status === "MUST_BE_PAID") {
    return OrderStatus.MUST_BE_PAID;
  }
  if (status === "MUST_BE_SHIPPED") {
    return OrderStatus.MUST_BE_SHIPPED;
  }
  if (status === "MUST_BE_RECEIVED") {
    return OrderStatus.MUST_BE_RECEIVED;
  }
  if (status === "COMPLETED") {
    return OrderStatus.COMPLETED;
  }
  if (status === "CANCELED") {
    return OrderStatus.CANCELED;
  }
  if (status === "REFUNDED") {
    return OrderStatus.REFUNDED;
  }
}

function chipStatusColor(status: string) {
  if (status === "MUST_BE_PAID") {
    return "default";
  }
  if (status === "MUST_BE_SHIPPED") {
    return "primary";
  }
  if (status === "MUST_BE_RECEIVED") {
    return "secondary";
  }
  if (status === "COMPLETED") {
    return "success";
  }
  if (status === "CANCELED") {
    return "danger";
  }
  if (status === "REFUNDED") {
    return "danger";
  }
}

async function getUserOrders(token: string) {
  const { data } = await client.GET("/api/v1/orders/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export default function Profile({
  settings,
  profile,
  orders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [me, setMe] = useState<ProfileResponseDto | undefined | null>(profile);
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>();
  const [recentOrders, setRecentOrders] = useState<
    OrdersByUserIdResponseDto[] | undefined
  >(orders);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  return (
    <UserLayout settings={settings} profile={profile}>
      <Head>
        <title>{settings?.name + " - บัญชีของฉัน"}</title>
      </Head>
      <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto px-5">
        <h2 className="text-3xl">ข้อมูลของฉัน</h2>
        <div className="flex flex-wrap justify-center">
          <div className="py-4 pr-4">
            <Avatar
              isBordered={true}
              name={me?.username[0].toUpperCase()}
              as="button"
              className="transition-transform w-32 h-32 text-6xl"
              color={me?.role === 100 ? "primary" : "default"}
              disabled
            />
          </div>
          <div className="place-self-center">
            <h2 className="text-2xl font-medium">
              ชื่อผู้ใช้ : {me?.username}
            </h2>
            <h2 className="text-xl font-light">
              ตำแหน่ง : {me?.role === 100 ? "Admin" : "User"}
            </h2>
          </div>
        </div>
        <h2 className="text-3xl py-5">ประวัติการสั่งซื้อ</h2>
        <div className="grid grid-cols-1">
          {recentOrders?.map((order) => {
            return (
              <div key={order._id} className="py-2">
                <Card className="w-full mx-auto px-1">
                  <CardHeader>
                    <div className="flex flex-row">
                      <div className="flex-grow">
                        <p>
                          วันที่ :{" "}
                          {new Date(order.created_at).toLocaleDateString(
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
                          {new Date(order.created_at).toLocaleTimeString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-grow justify-end">
                      <div>
                        <Chip radius="sm" color={chipStatusColor(order.status)}>
                          {OrderStatusTH(order.status)}
                        </Chip>
                      </div>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    {order.shopping_cart.map((item) => {
                      return (
                        <div key={item._id} className="flex flex-col py-2">
                          <div>
                            <Link href={`/product/${item.product._id}`}>
                              <Image
                                as={NextImage}
                                src={item.product.image[0]}
                                width={80}
                                height={80}
                                alt={"รูปภาพนั่นแหล่ะ"}
                                className="object-cover h-auto"
                                radius="none"
                              />
                            </Link>
                          </div>
                          <div className="flex-none">
                            <Link href={`/product/${item.product._id}`}>
                              <p className="text-clip truncate text-lg">
                                {item.product.name}
                              </p>
                            </Link>
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
                              <p>
                                ข้อมูลเพิ่มเติม : {" " + item.additional_info}
                              </p>
                            ) : null}
                            <p className="text-right text-lg">
                              {item.total_price.toLocaleString()} บาท
                            </p>
                          </div>
                          <Divider />
                        </div>
                      );
                    })}
                    {order.shipping ? (
                      <div>
                        <p className="text-right text-md">
                          บริการขนส่ง : {order.shipping.provider}
                        </p>
                        <p className="text-right text-md">
                          หมายเลขพัสดุ : {order.shipping.tracking_number}
                        </p>
                        <a href={order.shipping.tracking_url}>
                          <p className="text-right text-md hover:text-blue-700 text-blue-500">
                            ติดตามพัสดุ
                          </p>
                        </a>
                      </div>
                    ) : null}
                    <div key={order._id} className="flex-grow self-end">
                      <Button
                        onPress={() => {
                          setSelectedAddress(order._id);
                          onOpen();
                        }}
                      >
                        ดูที่อยู่จัดส่ง
                      </Button>
                      <Modal
                        isOpen={selectedAddress === order._id && isOpen}
                        onOpenChange={onOpenChange}
                        onClose={onClose}
                      >
                        <ModalContent>
                          {() => (
                            <>
                              <ModalHeader className="flex flex-col gap-1">
                                {order.address.title +
                                  " | " +
                                  order.address.telephone}
                              </ModalHeader>
                              <ModalBody>
                                <p>{order.address.address}</p>
                              </ModalBody>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </div>
                  </CardBody>
                  <CardFooter className="flex flex-col">
                    <div className="self-start flex-grow">
                      <p className="text-lg">รายละเอียดเพิ่มเติม</p>
                      <p>{order.additional_info}</p>
                    </div>
                    <div className="self-end flex-grow">
                      <p className="text-right text-2xl">
                        รวมการสั่งซื้อ: {order.total_price.toLocaleString()} บาท
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </UserLayout>
  );
}

export async function getServerSideProps({ req, res }: { req: any; res: any }) {
  if (await apiCheck()) {
    return { redirect: { destination: "/500", permanent: false } };
  }

  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", { req, res }) as string | null;

  if (shopping_jwt) {
    const profile = await getProfile(shopping_jwt);
    const orders = await getUserOrders(shopping_jwt);
    return {
      props: {
        settings,
        profile,
        orders,
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
