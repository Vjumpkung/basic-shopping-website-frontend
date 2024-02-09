import client from "@/api/client";
import { placeholder } from "@/const/placeholder";
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
import { Dispatch, useEffect, useState } from "react";
import {
  CaretDownFill,
  CaretUpFill,
  PencilSquare,
  TrashFill,
} from "react-bootstrap-icons";
import Markdown from "react-markdown";
import { toast } from "react-toastify";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import isURL from "validator/lib/isURL";
import emoji from "remark-emoji";

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
  const [resource, setResource] = useState<CldUploadWidgetInfo | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const token = getCookie("shopping-jwt") as string | null;
  const [productName, setProductName] = useState<string>(
    product_res ? product_res.name : ""
  );
  const [description, setDescription] = useState<string>(
    product_res ? product_res.description : ""
  );
  const [choices, setChoices] = useState<choiceSchema[]>(
    product_res ? product_res.choices : []
  );
  const [price, setPrice] = useState<number>(
    product_res ? product_res.price : 0
  );
  const [images, setImages] = useState<string[]>(
    product_res ? product_res.image : []
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    product_res ? product_res.isAvailable : false
  );
  const [published_at, setPublished_at] = useState<boolean>(
    product_res ? product_res.published_at !== null : false
  );
  const [newChoiceName, setNewChoiceName] = useState<string>("");
  const [newChoicePrice, setNewChoicePrice] = useState<number>(0);
  const [allChoices, setAllChoices] = useState<choiceSchema[] | undefined>([]);
  const [editChoice, setEditChoice] = useState<string | undefined>("");
  const [editChoiceName, setEditChoiceName] = useState<string | undefined>("");
  const [editChoicePrice, setEditChoicePrice] = useState<number | undefined>(0);

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
        choices: choices?.map((choice) => choice._id),
        price: price,
        image: images,
      };
      setProductUpdate(update_product);
    } else if (setProductCreate) {
      let create_product: ProductCreateDto = {
        name: productName,
        description: description,
        choices: choices?.map((choice) => choice._id),
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
          if (choices) {
            setChoices([...choices, res.data]);
          } else {
            setChoices([res.data]);
          }
        }
      });
    toast.success("เพิ่มตัวเลือกเรียบร้อยแล้ว", { position: "bottom-right" });
    setNewChoiceName("");
    setNewChoicePrice(0);
  }

  function onSaveChoice() {
    client
      .PATCH("/api/v1/choices/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: editChoice as string,
          },
        },
        body: {
          name: editChoiceName,
          price: editChoicePrice,
        },
      })
      .then(() => {
        toast.success("แก้ไขตัวเลือกเรียบร้อยแล้ว", {
          position: "bottom-right",
        });
        let newChoices = [...choices];
        let index = newChoices.findIndex((c) => c._id === editChoice);
        newChoices[index].name = editChoiceName as string;
        newChoices[index].price = editChoicePrice as number;
        setChoices(newChoices);
        setEditChoice("");
      });
  }

  function choice_swap(index1: number, index2: number) {
    let newChoices = [...choices];
    [newChoices[index1], newChoices[index2]] = [
      newChoices[index2],
      newChoices[index1],
    ];
    setChoices(newChoices);
  }

  function image_swap(index1: number, index2: number) {
    let newImages = [...images];
    [newImages[index1], newImages[index2]] = [
      newImages[index2],
      newImages[index1],
    ];
    setImages(newImages);
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
              maxRows={20}
              onChange={(e) => setDescription(e.target.value)}
              value={description}
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
              เพิ่มตัวเลือก
            </Button>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              scrollBehavior="inside"
            >
              <ModalContent>
                {() => (
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
                                  if (choices) {
                                    setChoices([...choices, choice]);
                                  } else {
                                    setChoices([choice]);
                                  }
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
              <TableColumn>ลำดับ</TableColumn>
              <TableColumn>ชื่อตัวเลือก</TableColumn>
              <TableColumn>ราคา (บาท)</TableColumn>
              <TableColumn>แก้ไข</TableColumn>
              <TableColumn>ลบ</TableColumn>
            </TableHeader>
            <TableBody>
              {choices?.map((choice, index) => {
                return (
                  <TableRow key={choice._id}>
                    <TableCell width={50}>
                      <div className="flex flex-col justify-center text-lg">
                        <div className="self-center">
                          <button
                            onClick={() => {
                              choice_swap(index, index - 1);
                            }}
                            disabled={index === 0}
                          >
                            <CaretUpFill className="text-gray-300 hover:text-gray-500 transition" />
                          </button>
                        </div>
                        <div className="self-center">
                          <button
                            onClick={() => {
                              choice_swap(index, index + 1);
                            }}
                            disabled={index === choices.length - 1}
                          >
                            <CaretDownFill className="text-gray-300 hover:text-gray-500 transition" />{" "}
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <input
                        className={`w-full ${
                          editChoice === choice._id ? "bg-gray-100" : "bg-white"
                        } px-2 py-2 rounded-md`}
                        type="text"
                        value={
                          editChoice === choice._id
                            ? editChoiceName
                            : choice.name
                        }
                        onChange={(e) => {
                          setEditChoiceName(e.target.value);
                        }}
                        disabled={editChoice !== choice._id}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className={`w-full ${
                          editChoice === choice._id ? "bg-gray-100" : "bg-white"
                        } px-2 py-2 rounded-md`}
                        type="number"
                        value={
                          editChoice === choice._id
                            ? editChoicePrice?.toString()
                            : choice.price.toString()
                        }
                        onChange={(e) => {
                          setEditChoicePrice(+e.target.value);
                        }}
                        disabled={editChoice !== choice._id}
                      />
                    </TableCell>
                    <TableCell width={170}>
                      <div className="flex flex-row">
                        {editChoice === choice._id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onClick={() => setEditChoice("")}
                            >
                              ยกเลิก
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClick={() => {
                                onSaveChoice();
                              }}
                            >
                              บันทึก
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => {
                                setEditChoice(choice._id);
                                setEditChoiceName(choice.name);
                                setEditChoicePrice(choice.price);
                              }}
                            >
                              <PencilSquare />
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell width={50}>
                      <div className="flex justify-center">
                        <div className="self-center">
                          <button
                            onClick={() => {
                              setChoices(
                                choices.filter((c) => c._id !== choice._id)
                              );
                            }}
                          >
                            <TrashFill className="text-lg transition text-danger-300 hover:text-danger-500" />
                          </button>
                        </div>
                      </div>
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
          <p className="text-lg">เพิ่มตัวเลือกใหม่</p>
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
        <div className="self-end">
          <Button color="primary" size="sm" onClick={() => onAddChoice()}>
            เพิ่ม
          </Button>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <p className="text-lg">รูปภาพ</p>
        </div>
        <div className="">
          <div className="pt-3">
            {images?.map((image, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-row my-2 gap-3 rounded-md p-1 items-center"
                >
                  <div className="flex-none">
                    <div>
                      <button
                        onClick={() => {
                          image_swap(index, index - 1);
                        }}
                        disabled={index === 0}
                      >
                        <CaretUpFill className="text-gray-300 hover:text-gray-500 transition" />
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          image_swap(index, index + 1);
                        }}
                        disabled={index === images.length - 1}
                      >
                        <CaretDownFill className="text-gray-300 hover:text-gray-500 transition" />{" "}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Image
                      src={isURL(image) ? image : placeholder}
                      width={90}
                      height={90}
                      alt={productName}
                      className="aspect-square object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <Input
                      placeholder="URL รูปภาพ"
                      type="text"
                      value={image}
                      onChange={(e) => {
                        const newImages = [...images];
                        newImages[index] = e.target.value;
                        setImages(newImages);
                      }}
                      size="sm"
                    />
                  </div>
                  <div className="flex-none self-center">
                    <button
                      onClick={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                      }}
                    >
                      <TrashFill className="text-lg transition text-danger-300 hover:text-danger-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-row justify-end pt-3">
            <Button
              onClick={() => {
                setImages([...images, ""]);
              }}
              variant="light"
            >
              เพิ่ม URL รูปภาพ
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
      </div>
      <div>
        <p className="text-lg mt-2">สถานะ</p>
      </div>
      <div className="flex flex-row gap-2 justify-center max-w-[480px] mx-auto">
        <div className="flex flex-row">
          <span className={`${published_at ? "text-gray-400" : "text-black"}`}>
            แบบร่าง
          </span>
          <Switch
            color="default"
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
              color="success"
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
