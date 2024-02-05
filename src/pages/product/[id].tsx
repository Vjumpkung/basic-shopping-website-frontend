import client from "@/api/client";
import LightBox from "@/components/LightBox";
import ShoppingCartIcon from "@/components/ShoppingCart";
import UserLayout from "@/components/UserLayout";
import { placeholder } from "@/const/placeholder";
import { ProductResponseDto, settingsSchema } from "@/types/swagger.types";
import useWindowDimensions from "@/utils/checkviewport";
import { getProfile } from "@/utils/profile";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Divider,
  Image,
  Textarea,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import { InferGetServerSidePropsType } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createRef, useEffect, useRef, useState } from "react";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Markdown from "react-markdown";
import { toast } from "react-toastify";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { isURL } from "validator";
import { calculatedChoicePrice, priceRange } from "..";
import Head from "next/head";
import apiCheck from "@/utils/apicheck";

export default function Product({
  product,
  settings,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  let { width, height } = useWindowDimensions();
  const imageRef = useRef<any[]>([]);
  imageRef.current = product.image.map(
    (element, i) => imageRef.current[i] ?? createRef()
  );
  const thumbnailRef = useRef<any[]>([]);
  thumbnailRef.current = product.image?.map(
    (element, i) => thumbnailRef.current[i] ?? createRef()
  );
  const token = getCookie("shopping-jwt") as string | null;
  const [price, SetPrice] = useState<number>(-1);
  const [quantity, SetQuantity] = useState<number>(0);
  const [selectedChoice, SetSelectedChoice] = useState<string>("");
  const [thumbIndex, setThumbIndex] = useState<number>(0);
  const [indexImgUrl, SetIndexImgUrl] = useState<string>(
    product.image?.length > 0 ? product.image[0] + "0" : ""
  );
  const [selectedImage, SetSelectedImage] = useState<string>(product.image[0]);
  const [addinfo, SetAddinfo] = useState<string>("");

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
          additional_info: addinfo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      toast.error("กรุณาเข้าสู่ระบบก่อน", { position: "bottom-right" });
      return;
    }

    toast.success("เพิ่มสินค้าลงในตะกร้าแล้ว", { position: "bottom-right" });
  };

  function thumb_scroll() {
    thumbnailRef.current[thumbIndex]?.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
  }

  useEffect(() => {
    if (width < 1280) {
      imageRef.current[thumbIndex]?.current?.scrollIntoView({
        inline: "center",
        block: "nearest",
      });
    } else {
      SetIndexImgUrl(product.image[thumbIndex] + thumbIndex.toString());
    }
  }, [thumbIndex]);

  const price_range =
    product.choices.length > 0
      ? calculatedChoicePrice(product.choices)
      : new priceRange(0, 0);

  return (
    <UserLayout settings={settings} profile={profile}>
      <Head>
        <title>{`${settings?.name} - ${product.name}`}</title>
      </Head>
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
        <LightBox
          images={product.image}
          display={openLightBox}
          selectImage={selectedImage}
          stateChanger={setOpenLightBox}
        />
        <div className="grid xl:grid-cols-2">
          <div className="px-3 py-4 mx-auto max-w-[480px]">
            {product.image.length > 0 ? (
              <>
                <div className="border border-gray-200">
                  <div className="xl:hidden snap-x snap-mandatory overflow-x-auto flex flex-nowrap no-scrollbar">
                    {product.image.map((image, index) => {
                      return (
                        <div
                          key={
                            isURL(image)
                              ? image
                              : placeholder + index.toString()
                          }
                          className="snap-center snap-always w-fit max-w-[460px] h-full max-h-[460px] flex-none"
                        >
                          <Image
                            className="object-contain my-auto h-full aspect-square"
                            as={NextImage}
                            src={isURL(image) ? image : placeholder}
                            alt={"รูปภาพนั่นแหล่ะ"}
                            width={480}
                            height={480}
                            quality={100}
                            radius="none"
                            ref={imageRef.current[index]}
                            loading="eager"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="xl:block hidden">
                    {product.image.map((image, index) => {
                      return (
                        <div
                          key={
                            isURL(image)
                              ? image
                              : placeholder + index.toString()
                          }
                          className={`flex flex-grow ${
                            indexImgUrl === image + index.toString()
                              ? ""
                              : "hidden"
                          }`}
                          ref={imageRef.current[index]}
                        >
                          <button
                            className=""
                            onClick={() => {
                              if (width >= 1280) {
                                SetSelectedImage(image);
                                setOpenLightBox(!openLightBox);
                              }
                            }}
                          >
                            <Image
                              className="object-contain my-auto h-full aspect-square"
                              as={NextImage}
                              src={isURL(image) ? image : placeholder}
                              alt={"รูปภาพนั่นแหล่ะ"}
                              width={480}
                              height={480}
                              quality={100}
                              radius="none"
                              loading="eager"
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-row justify-center ">
                  <div className="self-center xl:block hidden">
                    <button
                      onClick={() => {
                        if (thumbIndex > 0) {
                          setThumbIndex(thumbIndex - 1);
                          thumb_scroll();
                        }
                      }}
                    >
                      <CaretLeftFill />
                    </button>
                  </div>
                  <div className="flex flex-row my-5 overflow-x-auto gap-2 no-scrollbar">
                    {product.image.map((image, index) => {
                      return (
                        <div className="flex-none aspect-square" key={image}>
                          <button
                            onMouseOver={() => {
                              if (width >= 1280) {
                                setThumbIndex(index);
                                SetIndexImgUrl(
                                  product.image[thumbIndex] +
                                    thumbIndex.toString()
                                );
                              } else {
                                SetSelectedImage(image);
                                imageRef.current[
                                  index
                                ]?.current?.scrollIntoView({
                                  inline: "center",
                                  block: "nearest",
                                });
                              }
                            }}
                            onClick={() => {
                              if (width >= 1280) {
                                setOpenLightBox(!openLightBox);
                              }
                              setThumbIndex(index);
                            }}
                          >
                            <Image
                              ref={thumbnailRef.current[index]}
                              className={`border aspect-square object-contain border-gray-300 hover:border-gray-600`}
                              as={NextImage}
                              src={isURL(image) ? image : placeholder}
                              alt={"รูปภาพนั่นแหล่ะ"}
                              radius="none"
                              width={77}
                              height={77}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="self-center xl:block hidden">
                    <button
                      onClick={() => {
                        if (thumbIndex < product.image.length - 1) {
                          setThumbIndex(thumbIndex + 1);
                          thumb_scroll();
                        }
                      }}
                    >
                      <CaretRightFill />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
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
            <div className="flex flex-wrap">
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
                              ? `bg-gray-600 text-white`
                              : ``
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
              <h2 className="text-xl">ข้อมูลเพิ่มเติม</h2>
              <Textarea
                className="pt-2"
                onChange={(e) => {
                  SetAddinfo(e.target.value);
                }}
              />
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
                {product.isAvailable ? `เพิ่มไปยังตะกร้า` : `สินค้าหมด`}
              </Button>
            </div>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-1 py-8 px-2">
          <div>
            <h2 className="text-xl font-bold">รายละเอียด</h2>
            <div className="prose all-initial">
              <div className="markdown-body">
                <Markdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                  remarkPlugins={[remarkGfm, remarkToc, emoji]}
                >
                  {product.description}
                </Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export const getServerSideProps = async (context: any) => {
  if (await apiCheck()) {
    return { redirect: { destination: "/500", permanent: false } };
  }

  const { data, error, response } = await client.GET("/api/v1/products/{id}", {
    params: {
      path: {
        id: context.params.id as string,
      },
    },
  });

  const get_settings = await client.GET("/api/v1/settings");

  const shopping_jwt = getCookie("shopping-jwt", {
    req: context.req,
    res: context.res,
  }) as string | null;
  const profile = await getProfile(shopping_jwt);

  if (error) {
    return {
      notFound: true,
    };
  }

  const product: ProductResponseDto = data;
  const settings: settingsSchema = get_settings.data as settingsSchema;

  return {
    props: {
      product,
      settings,
      profile,
    },
  };
};
