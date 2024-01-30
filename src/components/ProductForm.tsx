import client from "@/api/client";
import {
  ProductCreateDto,
  ProductResponseDto,
  ProductUpdateDto,
  choiceSchema,
} from "@/types/swagger.types";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { CldUploadButton, CldUploadWidgetInfo } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, useEffect, useState } from "react";
import { TrashFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";

export default function ProductForm({
  product_res,
  setProductUpdate,
  setProductCreate,
  setAvailable,
  setIsPublish,
}: {
  product_res?: ProductResponseDto;
  setProductUpdate?: Dispatch<ProductUpdateDto>;
  setProductCreate?: Dispatch<ProductCreateDto>;
  setAvailable?: Dispatch<boolean>;
  setIsPublish?: Dispatch<boolean>;
}) {
  const router = useRouter();
  const id = router.query.id;
  const [product, setProduct] = useState<ProductResponseDto | undefined>(
    product_res
  );

  const [resource, setResource] = useState<CldUploadWidgetInfo | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const token = getCookie("shopping-jwt") as string | null;
  const [productName, setProductName] = useState<string>(
    product ? product.name : ""
  );
  const [description, setDescription] = useState<string>(
    product ? product.description : ""
  );
  const [choices, setChoices] = useState<choiceSchema[]>(
    product ? product.choices : []
  );
  const [price, setPrice] = useState<number>(product ? product.price : 0);
  const [images, setImages] = useState<string[]>(product ? product.image : []);
  const [isAvailable, setIsAvailable] = useState<boolean>(
    product ? product.isAvailable : false
  );
  const [published_at, setPublished_at] = useState<boolean>(
    product ? product.published_at !== null : false
  );

  const [newChoiceName, setNewChoiceName] = useState<string>("");
  const [newChoicePrice, setNewChoicePrice] = useState<number>(0);

  const [allChoices, setAllChoices] = useState<choiceSchema[] | undefined>([]);

  useEffect(() => {
    client
      .GET("/api/v1/choices", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllChoices(res.data);
      });
  }, [isOpen]);

  useEffect(() => {
    if (resource !== null) {
      let newImages = [...images];
      newImages.push(resource?.secure_url as string);
      setImages(newImages);
    }
  }, [resource]);

  useEffect(() => {
    if (setProductUpdate) {
      let update_product: ProductUpdateDto = {
        name: productName,
        description: description,
        choices: choices.map((choice) => choice._id),
        price: price,
        image: images,
      };
      setProductUpdate(update_product);
    } else if (setProductCreate) {
      let create_product: ProductCreateDto = {
        name: productName,
        description: description,
        choices: choices.map((choice) => choice._id),
        price: price,
        image: images,
      };
      setProductCreate(create_product);
    }
  }, [productName, description, choices, price, images]);

  useEffect(() => {
    if (setAvailable) {
      setAvailable(isAvailable);
    }
  }, [isAvailable]);

  useEffect(() => {
    if (setIsPublish) {
      setIsPublish(published_at);
    }
  }, [published_at]);

  function onSave() {
    client.PATCH("/api/v1/products/{id}/update", {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id as string,
        },
      },
      body: {
        name: productName,
        description: description,
        choices: choices ? choices.map((choice) => choice._id) : undefined,
        price: price,
        image: images,
      },
    });
    client.PATCH("/api/v1/products/{id}", {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        query: {
          available: isAvailable,
        },
        path: {
          id: id as string,
        },
      },
    });
    if (published_at) {
      client.PATCH("/api/v1/products/{id}/publish", {
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: id as string,
          },
        },
      });
    } else {
      client.PATCH("/api/v1/products/{id}/draft", {
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: id as string,
          },
        },
      });
    }
    toast.success("แก้ไขสินค้าเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/products");
    }, 500);
  }

  function onDelete() {
    client.DELETE("/api/v1/products/{id}", {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id as string,
        },
      },
    });
    toast.warning("ลบสินค้าเรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/admin/products");
    }, 500);
  }

  function onAddChoice() {
    if (newChoiceName === "") {
      toast.error("กรุณากรอกชื่อตัวเลือก", { position: "bottom-right" });
      return;
    }

    client
      .POST("/api/v1/choices", {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: {
          name: newChoiceName,
          price: newChoicePrice,
        },
      })
      .then((res) => {
        if (res.data !== undefined) {
          setChoices([...choices, res.data]);
        }
      });
    toast.success("เพิ่มตัวเลือกเรียบร้อยแล้ว", { position: "bottom-right" });
    setNewChoiceName("");
    setNewChoicePrice(0);
  }

  return (
    <>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">ชื่อสินค้า</p>
        </div>
        <div className="flex-grow">
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">รายละเอียด</p>
        </div>
        <div>
          <code>
            <Textarea
              value={description}
              maxRows={20}
              onChange={(e) => setDescription(e.target.value)}
            />
          </code>
        </div>
        <div className="pt-2">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.borntodev.com/2021/09/06/markdown-%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B0%E0%B9%84%E0%B8%A3-%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%87/"
          >
            คู่มือการใช้งาน Markdown
          </Link>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">ราคา</p>
        </div>
        <div>
          <Input
            value={price?.toString()}
            type="number"
            onChange={(e) => setPrice(Number(e.target.value))}
            endContent="บาท"
          />
          <small className="text-red-500">
            *หมายเหตุ หากเพิ่มตัวเลือกแล้วไม่จำเป็นต้องกำหนดราคา
          </small>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div className="flex flex-row my-3">
          <div className="flex-grow">
            <p className="text-lg">ตัวเลือก</p>
          </div>
          <div className="flex-none self-end">
            <Button color="primary" size="sm" onPress={onOpen}>
              แก้ไข
            </Button>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              scrollBehavior="inside"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalBody className="no-scrollbar">
                      <CheckboxGroup
                        label="ตัวเลือกทั้งหมด"
                        defaultValue={
                          choices?.map((choice) => choice._id) || []
                        }
                      >
                        {allChoices?.map((choice) => {
                          return (
                            <Checkbox
                              key={choice._id}
                              value={choice._id}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setChoices([...choices, choice]);
                                } else {
                                  setChoices(
                                    choices.filter((c) => c._id !== choice._id)
                                  );
                                }
                              }}
                            >
                              {choice.name} ({choice.price} บาท)
                            </Checkbox>
                          );
                        }) || []}
                      </CheckboxGroup>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
        <div>
          <Table aria-label="selected choices">
            <TableHeader>
              <TableColumn>ชื่อตัวเลือก</TableColumn>
              <TableColumn>ราคา (บาท)</TableColumn>
            </TableHeader>
            <TableBody>
              {choices?.map((choice) => {
                return (
                  <TableRow key={choice._id}>
                    <TableCell className="w-full">
                      <code>{choice.name}</code>
                    </TableCell>
                    <TableCell>
                      <code>{choice.price}</code>
                    </TableCell>
                  </TableRow>
                );
              }) || []}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col mt-2 gap-2">
        <div>
          <p className="text-lg">เพิ่มตัวเลือก</p>
        </div>
        <div className="flex flex-row gap-3">
          <Input
            size="sm"
            value={newChoiceName}
            onChange={(e) => setNewChoiceName(e.target.value)}
            label={<p>ชื่อตัวเลือก</p>}
          />
          <Input
            size="sm"
            value={newChoicePrice?.toString()}
            onChange={(e) => setNewChoicePrice(+e.target.value)}
            type="number"
            label={<p>ราคา</p>}
          />
        </div>
        <div>
          <Button color="primary" size="sm" onClick={() => onAddChoice()}>
            เพิ่ม
          </Button>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">รูปภาพ</p>
        </div>
        <div className="flex flex-row gap-2">
          {images?.map((image) => {
            if (image === "") return <></>;

            return (
              <div key={image}>
                <Image
                  src={image}
                  width={90}
                  height={90}
                  alt={productName}
                  className="aspect-square object-cover"
                />
              </div>
            );
          })}
        </div>
        <div className="">
          <form className="pt-3">
            {images?.map((input, index) => {
              return (
                <div key={index} className="flex flex-row pb-3 gap-3">
                  <div className="flex-grow">
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => {
                        const newImages = [...images];
                        newImages[index] = e.target.value;
                        setImages(newImages);
                      }}
                      size="sm"
                    />
                  </div>
                  <div className="flex-none self-center">
                    <Button
                      color="danger"
                      onClick={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                      }}
                      size="sm"
                    >
                      <TrashFill className="text-lg" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </form>
          <Button
            onClick={() => {
              setImages([...images, ""]);
            }}
          >
            เพิ่มรูปภาพ
          </Button>

          <CldUploadButton
            className="ml-2 z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-unit-4 min-w-unit-20 h-unit-10 text-small gap-unit-2 rounded-medium [&>svg]:max-w-[theme(spacing.unit-8)] data-[pressed=true]:scale-[0.97] transition-transform-colors-opacity motion-reduce:transition-none bg-default text-default-foreground data-[hover=true]:opacity-hover"
            uploadPreset="n1wehvy6"
            onUpload={(result, widget) => {
              setResource(result?.info as CldUploadWidgetInfo);
              widget.close();
            }}
          >
            อัพโหลดรูปภาพ
          </CldUploadButton>
        </div>
      </div>
      <div>
        <p className="text-lg mt-2">สถานะ</p>
      </div>
      <div className="flex flex-row gap-2">
        <div className="flex flex-row">
          <span className={`${published_at ? "text-gray-400" : "text-black"}`}>
            แบบร่าง
          </span>
          <Switch
            isSelected={published_at}
            className="ml-2"
            onChange={(e) => {
              if (e.target.checked) {
                setPublished_at(true);
              } else {
                setPublished_at(false);
              }
            }}
          />
          <span className={`${published_at ? "text-black" : "text-gray-400"}`}>
            เผยแพร่
          </span>
        </div>
        <Divider orientation="vertical" />
        {product_res ? (
          <div className="flex flex-row">
            <span className={`${isAvailable ? "text-gray-400" : "text-black"}`}>
              สินค้าหมด
            </span>
            <Switch
              isSelected={isAvailable}
              className="ml-2"
              onChange={(e) => {
                if (e.target.checked) {
                  setIsAvailable(true);
                } else {
                  setIsAvailable(false);
                }
              }}
            />
            <span className={`${isAvailable ? "text-black" : "text-gray-400"}`}>
              มีสินค้า
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}
