import client from "@/api/client";
import {
  CartResponseDto,
  addressSchema,
  settingsSchema,
} from "@/types/swagger.types";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Checkout({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [address, setAddress] = useState<addressSchema | undefined>(undefined);
  const willOrder = router.query.cart?.toString().split(",");
  const [cart, setCart] = useState<CartResponseDto[] | undefined>([]);
  const [addInfo, setAddInfo] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(
    ""
  ); // address id
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [addresses, setAddresses] = useState<addressSchema[] | undefined>([]);

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      loadAllAddress();
      client
        .GET("/api/v1/shopping-cart/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setCart(
            res.data?.filter((item) => {
              return willOrder?.includes(item._id);
            })
          );
        });
      client
        .GET("/api/v1/addresses/default", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setAddress(res.data);
          setSelectedAddress(res.data?._id);
        });
    } else {
      router.push("/signin");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("shopping-jwt");
    if (token !== null) {
      client
        .GET("/api/v1/addresses/{id}", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: selectedAddress as string,
            },
          },
        })
        .then((res) => {
          setAddress(res.data);
        });
    } else {
      router.push("/signin");
    }
  }, [selectedAddress]);

  function loadAllAddress() {
    const token = localStorage.getItem("shopping-jwt");
    if (token === null) {
      router.push("/signin");
    }
    client
      .GET("/api/v1/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAddresses(res.data);
      });
  }

  function order() {
    const token = localStorage.getItem("shopping-jwt");
    if (token === null) {
      router.push("/signin");
    }
    if (selectedAddress === undefined) {
      toast.error("กรุณาเลือกที่อยู่จัดส่ง", { position: "bottom-right" });
      return;
    }
    client
      .POST("/api/v1/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          shopping_cart: willOrder as string[],
          additional_info: addInfo !== "" ? addInfo : undefined,
          address: selectedAddress as string,
        },
      })
      .then((res) => {
        toast.success("สั่งซื้อสินค้าสำเร็จ", { position: "bottom-right" });
        router.push(`/`);
      });
  }

  return (
    <main>
      <title>{settings?.name + " - ชำระเงิน"}</title>
      <div className="container lg:w-1/2 w-full mx-auto px-5">
        <h2 className="text-3xl">ชำระเงิน</h2>
        <div className="grid grid-cols-1">
          {cart?.map((item) => {
            return (
              <div key={item._id} className="py-2">
                <Card className="w-full mx-auto px-1">
                  <CardHeader className="flex flex-row">
                    <div className="flex-grow">
                      <div>
                        <Image
                          src={item.product.image[0]}
                          width={80}
                          height={80}
                          alt={"just a image"}
                          className="object-cover h-auto"
                        />
                      </div>
                      <div className="pt-2">
                        <p className="text-xl">{item.product.name}</p>
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
                  </CardHeader>
                </Card>
              </div>
            );
          })}
          <div className="">
            <p className="text-lg sm:text-xl md:text-2xl text-right">
              ยอดชำระเงินทั้งหมด :{" "}
              <span>
                {cart
                  ?.reduce((prev, current) => prev + current.total_price, 0)
                  .toLocaleString() + " "}
              </span>
              บาท
            </p>
          </div>
          <h2 className="text-2xl">ที่อยู่จัดส่ง</h2>
          <div className="py-2">
            <Card className="w-full mx-auto px-1">
              <CardHeader className="flex flex-row">
                <div className="flex-grow">
                  <p className="text-xl">
                    {address?.title}{" "}
                    <span className="text-gray-500 font-extralight mx-2">
                      |
                    </span>{" "}
                    {address?.telephone}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="flex flex-col">
                <div className="">
                  <p>{address?.address}</p>
                </div>
                <div className="pt-1">
                  {address?.default ? (
                    <Chip color="primary">ที่อยู่เริ่มต้น</Chip>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="self-end">
            <Button
              onPress={() => {
                onOpen();
              }}
            >
              เปลี่ยนที่อยู่จัดส่ง
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {() => {
                  return (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        เลือกที่อยู่จัดส่ง
                      </ModalHeader>
                      <ModalBody className="pb-6">
                        <RadioGroup
                          defaultValue={selectedAddress}
                          value={selectedAddress}
                          onValueChange={setSelectedAddress}
                        >
                          {addresses?.map((address) => {
                            return (
                              <Radio key={address._id} value={address._id}>
                                {address.title}
                              </Radio>
                            );
                          })}
                        </RadioGroup>
                      </ModalBody>
                    </>
                  );
                }}
              </ModalContent>
            </Modal>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="self-center w-full py-5">
            <Textarea
              label="รายละเอียดเพิ่มเติม"
              onValueChange={(e) => setAddInfo(e)}
            />
          </div>
          <div className="self-center">
            <Button size="lg" color="primary" onClick={() => order()}>
              สั่งซื้อสินค้า
            </Button>
          </div>
        </div>
      </div>
    </main>
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
