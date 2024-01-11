import client from "@/api/client";
import { ProductResponseDto, settingsSchema } from "@/types/swagger.types";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Divider,
} from "@nextui-org/react";
import { InferGetServerSidePropsType } from "next";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { calculatedChoicePrice, priceRange } from "..";
import { useState } from "react";
import LightBox from "@/components/LightBox";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@/components/ShoppingCart";

export default function Product({
  product,
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [price, SetPrice] = useState<number>(-1);
  const [quantity, SetQuantity] = useState<number>(0);
  const [selectedChoice, SetSelectedChoice] = useState<string>("");
  const [selectedImage, SetSelectedImage] = useState<string>(product.image[0]);

  const [openLightBox, setOpenLightBox] = useState<boolean>(false);

  const path = usePathname();

  const addToCart = async () => {
    if (quantity === 0) {
      toast.error("กรุณาเลือกจำนวนสินค้า", { position: "bottom-right" });
      return;
    }

    if (selectedChoice === "" && product.choices.length > 0) {
      toast.error("กรุณาเลือกตัวเลือกสินค้า", { position: "bottom-right" });
      return;
    }

    const { data, error, response } = await client.POST(
      "/api/v1/shopping-cart/add",
      {
        body: {
          product: product._id,
          choice: selectedChoice !== "" ? selectedChoice : undefined,
          amount: quantity,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopping-jwt")}`,
        },
      }
    );

    if (response.status === 401) {
      toast.error("กรุณาเข้าสู่ระบบก่อน", { position: "bottom-right" });
      return;
    }

    toast.success("เพิ่มสินค้าลงในรถเข็นแล้ว", { position: "bottom-right" });
  };

  const price_range =
    product.choices.length > 0
      ? calculatedChoicePrice(product.choices)
      : new priceRange(0, 0);

  return (
    <main>
      <title>{`${settings?.name} - ${product.name}`}</title>
      <div className="w-full sm:w-4/6 mx-auto">
        <Breadcrumbs className="sm:block hidden">
          <BreadcrumbItem key={12345} isDisabled>
            {settings?.name}
          </BreadcrumbItem>
          {path
            .split("/")
            .filter((item) => item !== "")
            .map((item, index) => {
              const url = item === "product" ? "/" : item;
              item = item === product._id ? product.name : item;
              return (
                <BreadcrumbItem
                  key={index.toString() + Math.random().toString()}
                >
                  <Link
                    href={url}
                    className=" overflow-hidden max-w-48 truncate"
                  >
                    {item}
                  </Link>
                </BreadcrumbItem>
              );
            })}
        </Breadcrumbs>
        <div className="grid lg:grid-cols-2">
          <div className="px-3 py-4 mx-auto grid">
            <div className="mx-auto overflow-hidden relative aspect-square border border-gray-200">
              <LightBox
                images={product.image}
                display={openLightBox}
                selectImage={selectedImage}
                stateChanger={setOpenLightBox}
              />
              {product.image.map((image) => {
                return (
                  <div
                    key={image}
                    className={` ${
                      selectedImage === image ? "block" : "hidden"
                    }`}
                  >
                    <button
                      key={image}
                      onClick={() => setOpenLightBox(!openLightBox)}
                    >
                      <Image
                        className="object-cover my-auto h-full aspect-square"
                        as={NextImage}
                        src={image}
                        alt={"just a image"}
                        radius="none"
                        width={480}
                        height={480}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap py-5 justify-center">
              {product.image.map((image) => {
                return (
                  <div className="flex pr-2 pb-2" key={image}>
                    <button onMouseOver={() => SetSelectedImage(image)}>
                      <Image
                        className={`border border-gray-300 object-cover w-20 h-20 ${
                          selectedImage === image
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                        as={NextImage}
                        src={image}
                        alt={"just a image"}
                        radius="none"
                        width={80}
                        height={80}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-3 py-4">
            <h1 className="font-medium text-left text-2xl">{product.name}</h1>
            <Divider />
            <div className="py-6">
              {price !== -1 ? (
                <p className="text-3xl font-medium text-left">
                  {price.toLocaleString()} บาท
                </p>
              ) : (
                <p className="text-3xl font-medium text-left">
                  {product.choices.length > 0
                    ? `${price_range.min_price.toLocaleString()} - ${price_range.max_price.toLocaleString()}`
                    : product.price.toLocaleString()}{" "}
                  บาท
                </p>
              )}
            </div>
            {product.choices.length > 0 ? (
              <h2 className="text-xl">ตัวเลือก</h2>
            ) : null}
            <div className="flex flex-wrap  ">
              {product.choices.length > 0
                ? product.choices.map((choice) => {
                    return (
                      <div className="my-2 pr-2" key={choice._id}>
                        <Button
                          radius="sm"
                          onClick={() => {
                            SetPrice(choice.price);
                            SetSelectedChoice(choice._id);
                          }}
                          className={
                            selectedChoice === choice._id
                              ? `border border-black`
                              : `border border-gray-300`
                          }
                        >
                          <p>{choice.name}</p>
                        </Button>
                      </div>
                    );
                  })
                : null}
            </div>
            <div>
              <h2 className="text-xl">จำนวน</h2>
              <div className="relative flex items-center max-w-[8rem] pt-1">
                <button
                  type="button"
                  onClick={() => SetQuantity(quantity > 0 ? quantity - 1 : 0)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
                >
                  <svg
                    className="w-3 h-3 text-gray-900"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 2"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1h16"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  className="w-14 bg-gray-100 border border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block py-2.5"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => {
                    SetQuantity(+e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => SetQuantity(quantity + 1)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
                >
                  <svg
                    className="w-3 h-3 text-gray-900"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 1v16M1 9h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="py-4">
              <Button
                size="lg"
                onClick={() => addToCart()}
                isDisabled={product.isAvailable === false}
                color={product.isAvailable === false ? `default` : `primary`}
                variant={product.isAvailable === false ? `faded` : `solid`}
              >
                {product.isAvailable ? (
                  <ShoppingCartIcon width={20} height={20} fill="#FFFFFF" />
                ) : null}
                {product.isAvailable ? `เพิ่มไปยังรถเข็น` : `สินค้าหมด`}
              </Button>
            </div>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-1 py-8 px-2">
          <div>
            <h2 className="text-xl font-bold">รายละเอียด</h2>
            <p className="text-left linebreak">{product.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps = async (context: any) => {
  const { data, error, response } = await client.GET("/api/v1/products/{id}", {
    params: {
      path: {
        id: context.params.id as string,
      },
    },
  });

  const get_settings = await client.GET("/api/v1/settings");

  if (error) {
    return {
      notFound: true,
    };
  }

  const product: ProductResponseDto = data;
  const settings: settingsSchema | undefined = get_settings.data;

  return {
    props: {
      product,
      settings,
    },
  };
};
