import client from "@/api/client";
import UserLayout from "@/components/UserLayout";
import {
  CartResponseDto,
  ProfileResponseDto,
  settingsSchema,
} from "@/types/swagger.types";
import { Button, Card, CardHeader, Checkbox, Chip } from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Cart({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [willOrder, setWillOrder] = useState<string[]>([]);
  const [cart, setCart] = useState<CartResponseDto[] | undefined>([]);
  const [trigger, setTrigger] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      client
        .GET("/api/v1/shopping-cart/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setCart(res.data);
        });
    } else {
      router.push("/signin");
    }
  }, [trigger, router]);

  async function removeItemFromCart(id: string) {
    const token = localStorage.getItem("shopping-jwt");
    await client.DELETE("/api/v1/shopping-cart/remove", {
      params: {
        query: {
          cart_id: id,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.warning("ลบสินค้าออกจากตะกร้าแล้ว", { position: "bottom-right" });
    setTrigger(!trigger);
  }

  return (
    <UserLayout settings={settings}>
      <title>{settings?.name + " - ตะกร้าของฉัน"}</title>
      <div className="container lg:w-1/2 w-full mx-auto px-5">
        <h2 className="text-3xl">ตะกร้าของฉัน</h2>
        <div className="grid grid-cols-1">
          {cart?.map((item) => {
            return (
              <div key={item._id} className="py-2">
                <Card className="w-full mx-auto px-1">
                  <CardHeader className="flex flex-row">
                    <div className="flex">
                      <Checkbox
                        size="lg"
                        className="py-1 pt-2"
                        onChange={() => {
                          willOrder.includes(item._id)
                            ? willOrder.splice(willOrder.indexOf(item._id), 1)
                            : willOrder.push(item._id);
                          setWillOrder([...willOrder]);
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div>
                        <Link href={`/product/${item.product._id}`}>
                          <Image
                            src={item.product.image[0]}
                            width={80}
                            height={80}
                            alt={"just a image"}
                            className="object-cover h-auto"
                          />
                        </Link>
                      </div>
                      <div className="pt-2">
                        <Link href={`/product/${item.product._id}`}>
                          <p className="text-xl">{item.product.name}</p>
                        </Link>
                        {item.choice ? (
                          <p className="text-gray-500">
                            <span className="font-medium">ตัวเลือก</span> :{" "}
                            {item.choice.name}
                          </p>
                        ) : null}
                        <p className="text-gray-500">
                          <span className="font-medium">ราคา</span> :{" "}
                          {item.choice
                            ? item.choice.price.toLocaleString()
                            : item.product.price.toLocaleString()}{" "}
                          บาท{" "}
                        </p>
                        <p>x{item.amount}</p>
                        {item.additional_info ? (
                          <p>ข้อมูลเพิ่มเติม : {item.additional_info}</p>
                        ) : null}
                        <p className="text-2xl">
                          {item.total_price.toLocaleString()} บาท
                        </p>
                      </div>
                    </div>
                    <div className="flex-none">
                      <button
                        onClick={() => {
                          willOrder.splice(willOrder.indexOf(item._id), 1);
                          setWillOrder([...willOrder]);
                          removeItemFromCart(item._id);
                        }}
                      >
                        <Image
                          src={`/trash.svg`}
                          width={40}
                          height={40}
                          alt="trash icon"
                        />
                      </button>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
          <div
            className={`mx-auto ${
              willOrder.length > 0 ? "block" : "hidden"
            } py-3`}
          >
            <Button
              size="lg"
              color="primary"
              onClick={() =>
                router.push(`/checkout?cart=${willOrder.join(",")}`)
              }
            >
              ชำระเงิน
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
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
