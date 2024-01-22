import client from "@/api/client";
import UserLayout from "@/components/UserLayout";
import {
  ProductAllResponseDto,
  choiceSchema,
  settingsSchema,
} from "@/types/swagger.types";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Image } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { InferGetServerSidePropsType } from "next";
import NextImage from "next/image";
import Link from "next/link";

export type rangePrice = {
  min_price: number;
  max_price: number;
};

export class priceRange {
  constructor(public min_price: number, public max_price: number) {
    this.min_price = min_price;
    this.max_price = max_price;
  }
}

export function calculatedChoicePrice(choices: choiceSchema[]): rangePrice {
  const min_price = Math.min(...choices.map((choice) => choice.price));
  const max_price = Math.max(...choices.map((choice) => choice.price));
  return new priceRange(min_price, max_price);
}

async function fetchProduct() {
  const res = await client.GET("/api/v1/products", {
    params: {
      query: {
        status: "publish",
      },
    },
  });

  return res;
}

export default function Home({
  products,
  settings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <UserLayout settings={settings}>
      <main>
        <title>{`${settings?.name} - หน้าแรก`}</title>
        <div className="w-5/6 mx-auto">
          <div className="flex flex-wrap justify-center">
            {products?.map((product) => {
              const price_range =
                product.choices.length > 0
                  ? calculatedChoicePrice(product.choices)
                  : new priceRange(0, 0);
              return (
                <div key={product._id} className="">
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <div key={product._id} className="my-2 mx-2 w-72">
                      <Card className="py-2">
                        <CardHeader className="pb-0 pt-2 px-4">
                          {product.image.length > 0 ? (
                            <div className="mx-auto">
                              <Image
                                className="object-cover h-52"
                                as={NextImage}
                                radius="none"
                                src={product.image[0]}
                                alt={"just a image"}
                                width={200}
                                height={200}
                              />
                            </div>
                          ) : (
                            <Image
                              src={`https://picsum.photos/seed/${Math.random()}/200/200`}
                              width={200}
                              height={200}
                              alt={"just a image"}
                            />
                          )}
                        </CardHeader>
                        <CardBody className="overflow-hidden py-2">
                          <h4 className=" font-medium text-large truncate">
                            {product.name}
                          </h4>
                          <p className="text-medium">
                            {product.choices.length > 0
                              ? `${price_range.min_price.toLocaleString()} - ${price_range.max_price.toLocaleString()}`
                              : product.price.toLocaleString()}{" "}
                            บาท
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </UserLayout>
  );
}

export async function getServerSideProps() {
  const { data } = await client.GET("/api/v1/settings");

  const fetchProducts = await fetchProduct();

  const products = fetchProducts.data as ProductAllResponseDto[] | undefined;

  const settings = data as settingsSchema;

  return {
    props: {
      products,
      settings,
    },
  };
}
