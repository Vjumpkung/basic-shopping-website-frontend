import client from "@/api/client";
import UserLayout from "@/components/UserLayout";
import { addressSchema, settingsSchema } from "@/types/swagger.types";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { InferGetStaticPropsType } from "next";
import { Kanit } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditAddress({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [address, setAddress] = useState<addressSchema | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [address1, setAddress1] = useState<string>("");
  const [isdefault, setIsdefault] = useState<boolean>(false);
  const router = useRouter();
  const id = router.query.id as string;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (id === undefined) {
      router.push("/address");
    } else {
      const token = localStorage.getItem("shopping-jwt");
      if (token === null) {
        router.push("/signin");
      }
      client
        .GET("/api/v1/addresses/{id}", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              id: id,
            },
          },
        })
        .then((res) => {
          setAddress(res.data);
          setTitle(address?.title as string);
          setTelephone(address?.telephone as string);
          setAddress1(address?.address as string);
          setIsdefault(address?.default as boolean);
        });
    }
  }, [
    address?.address,
    address?.default,
    address?.title,
    address?.telephone,
    id,
    router,
  ]);

  async function saveAddress() {
    const token = localStorage.getItem("shopping-jwt");
    await client.PATCH("/api/v1/addresses/{id}", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id,
        },
      },
      body: {
        title: title,
        telephone: telephone,
        address: address1,
        default: isdefault,
      },
    });
    toast.success("บันทึกที่อยู่เรียบร้อยแล้ว", { position: "bottom-right" });
    setTimeout(() => {
      router.push("/address");
    }, 500);
  }

  async function deleteAddress() {
    if (address?.default as boolean) {
      toast.error("ไม่สามารถลบที่อยู่เริ่มต้นได้", {
        position: "bottom-right",
      });
      return;
    }

    const token = localStorage.getItem("shopping-jwt");
    await client.DELETE("/api/v1/addresses/{id}", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          id: id,
        },
      },
    });
    toast.info("ลบที่อยู่เรียบร้อยแล้ว", { position: "bottom-right" });
    router.push("/address");
  }

  useEffect(() => {
    setTitle(address?.title as string);
    setTelephone(address?.telephone as string);
    setAddress1(address?.address as string);
    setIsdefault(address?.default as boolean);
  }, [address]);

  return (
    <UserLayout settings={settings}>
      <title>{`${settings?.name} - แก้ไขที่อยู่`}</title>
      <div className="container lg:w-1/2 w-full mx-auto px-5">
        <h2 className="text-3xl">แก้ไขที่อยู่</h2>
        <div className="flex flex-col justify-start">
          <div className="flex-grow max-w-sm my-2">
            <p className="text-2xl pb-1">ชื่อผู้รับ</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="lg"
            />
          </div>
          <div className="flex-grow my-2">
            <p className="text-2xl pb-1">ที่อยู่</p>
            <Textarea
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              size="lg"
            />
          </div>
          <div className="flex-grow max-w-sm my-2">
            <p className="text-2xl pb-1">เบอร์โทร</p>
            <Input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              size="lg"
            />
          </div>
          <div className="flex-grow max-w-sm my-2 self-end">
            <Switch
              isDisabled={address?.default as boolean}
              isSelected={isdefault}
              onChange={(e) => {
                e.target.checked ? setIsdefault(true) : setIsdefault(false);
              }}
            >
              ที่อยู่เริ่มต้น
            </Switch>
          </div>
          <div className="self-end flex-grow max-w-sm my-2">
            <Button color="danger" onClick={onOpen}>
              ลบที่อยู๋
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <div>
                    <ModalHeader className="flex flex-col gap-1">
                      คุณต้องการที่จะลบที่อยู่นี้หรือไม่
                    </ModalHeader>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          onClose();
                        }}
                      >
                        ไม่ยืนยัน
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => {
                          deleteAddress();
                          onClose();
                        }}
                      >
                        ยืนยัน
                      </Button>
                    </ModalFooter>
                  </div>
                )}
              </ModalContent>
            </Modal>
          </div>
          <div className="flex-grow max-w-sm my-2 self-center">
            <Button
              size="lg"
              color="primary"
              onClick={() => {
                saveAddress();
              }}
            >
              <p className="font-semibold">บันทึกการเปลี่ยนแปลง</p>
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
