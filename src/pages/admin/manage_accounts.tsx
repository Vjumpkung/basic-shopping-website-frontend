import client from "@/api/client";
import AdminLayout from "@/components/AdminLayout";
import { EyeFilledIcon } from "@/components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/EyeSlashFilledIcon";
import {
  UserCreateDto,
  settingsSchema,
  userSchama,
} from "@/types/swagger.types";
import { getProfile } from "@/utils/profile";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { PencilSquare, TrashFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";

export default function ManageAccounts({
  settings,
  profile,
  allUsers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const token = getCookie("shopping-jwt");
  const [users, setUsers] = useState<userSchama[]>(allUsers);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectRole, setSelectRole] = useState<string>("");
  const [isEditRoleOpen, setIsEditRoleOpen] = useState<boolean>(false);
  const [createUser, setCreateUser] = useState<UserCreateDto>({
    username: "",
    password: "",
    role: 1,
  });
  const [isUsernameError, setIsUsernameError] = useState<string>("");
  const [isPasswordError, setIsPasswordError] = useState<string>("");
  const [toggleVisibility, setToggleVisibility] = useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function onDelete(id: string) {
    client
      .DELETE("/api/v1/users/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: id,
          },
        },
      })
      .then(() => {
        client
          .GET("/api/v1/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setUsers(res.data as userSchama[]);
          });
        toast.success("ลบบัญชีผู้ใช้เรียบร้อยแล้ว", {
          position: "bottom-right",
        });
      })
      .catch((err) => {
        toast.error("เกิดข้อผิดพลาดบางอย่าง", {
          position: "bottom-right",
        });
      });
  }

  function onSave(id: string, role: number) {
    client
      .PATCH(`/api/v1/users/{id}/${role === 100 ? "admin" : "user"}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          path: {
            id: id,
          },
        },
      })
      .then(() => {
        client
          .GET("/api/v1/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setUsers(res.data as userSchama[]);
          });
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว", {
          position: "bottom-right",
        });
      })
      .catch(() => {
        toast.error("เกิดข้อผิดพลาดบางอย่าง", {
          position: "bottom-right",
        });
      });
  }

  function onCreate(createUserDto: UserCreateDto) {
    if (createUserDto.username === "") {
      setIsUsernameError("กรุณากรอกชื่อผู้ใช้");
      return;
    } else {
      setIsUsernameError("");
    }
    if (createUserDto.password === "") {
      setIsPasswordError("กรุณากรอกรหัสผ่าน");
      return;
    } else {
      setIsPasswordError("");
    }
    client
      .POST("/api/v1/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: createUserDto,
      })
      .then((res) => {
        if (res.response.status === 400) {
          setIsUsernameError("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
          return;
        }
        if (res.response.status === 204) {
          client
            .GET("/api/v1/users", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((res) => {
              setUsers(res.data as userSchama[]);
            });
          toast.success("เพิ่มผู้ใช้เรียบร้อยแล้ว", {
            position: "bottom-right",
          });
          onOpenChange();
          return;
        }
      })
      .catch(() => {
        toast.error("เกิดข้อผิดพลาดบางอย่าง", {
          position: "bottom-right",
        });
      });
  }

  return (
    <AdminLayout settings={settings}>
      <title>{`${settings.name} - จัดการบัญชีทั้งหมด`}</title>
      <main>
        <div className="flex flex-row">
          <div>
            <p className="text-2xl font-semibold">จัดการบัญชีทั้งหมด</p>
          </div>
          <div className="ml-auto">
            <Button onPress={onOpenChange}>เพิ่มผู้ใช้ใหม่</Button>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              onClose={() => {
                setIsUsernameError("");
                setIsPasswordError("");
                setCreateUser({
                  username: "",
                  password: "",
                  role: 1,
                });
              }}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      เพิ่มผู้ใช้ใหม่
                    </ModalHeader>
                    <ModalBody>
                      <Input
                        autoFocus
                        isInvalid={isUsernameError !== ""}
                        errorMessage={isUsernameError}
                        value={createUser.username}
                        onChange={(e) => {
                          setCreateUser({
                            ...createUser,
                            username: e.target.value,
                          });
                        }}
                        label="ชื่อผู้ใช้"
                        placeholder="กรอกชื่อผู้ใช้"
                        variant="bordered"
                      />
                      <Input
                        label="รหัสผ่าน"
                        isInvalid={isPasswordError !== ""}
                        errorMessage={isPasswordError}
                        value={createUser.password}
                        onChange={(e) => {
                          setCreateUser({
                            ...createUser,
                            password: e.target.value,
                          });
                        }}
                        placeholder="กรอกรหัสผ่าน"
                        type={toggleVisibility ? "text" : "password"}
                        variant="bordered"
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={() =>
                              setToggleVisibility(!toggleVisibility)
                            }
                          >
                            {toggleVisibility ? (
                              <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                      />
                      <p>ตำแหน่ง</p>
                      <RadioGroup value={createUser.role.toString()}>
                        <Radio
                          value="1"
                          onClick={() => {
                            setCreateUser({
                              ...createUser,
                              role: 1,
                            });
                          }}
                        >
                          User
                        </Radio>
                        <Radio
                          value="100"
                          onClick={() => {
                            setCreateUser({
                              ...createUser,
                              role: 100,
                            });
                          }}
                        >
                          Admin
                        </Radio>
                      </RadioGroup>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          onClose();
                          setCreateUser({
                            username: "",
                            password: "",
                            role: 1,
                          });
                        }}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => {
                          onCreate(createUser);
                        }}
                      >
                        เพิ่ม
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
        <div className="mt-4">
          <Table aria-label="all products">
            <TableHeader>
              <TableColumn>ชื่อผู้ใช้</TableColumn>
              <TableColumn>ประเภท</TableColumn>
              <TableColumn>แก้ไข</TableColumn>
              <TableColumn>ลบ</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                if (user._id === profile.id) {
                  return (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        {user.role === 100 ? "Admin" : "User"}
                      </TableCell>
                      <TableCell width={20}>
                        <button disabled={user._id === profile.id}>
                          <PencilSquare
                            className={`mt-1 ${
                              user._id === profile.id
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell width={20}>
                        <button disabled={user._id === profile.id}>
                          <TrashFill
                            className={`mt-1 ${
                              user._id === profile.id
                                ? "text-red-300"
                                : "text-red-500"
                            }`}
                          />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        {user.role === 100 ? "Admin" : "User"}
                      </TableCell>
                      <TableCell width={20}>
                        <Popover
                          placement="bottom-end"
                          color="default"
                          isOpen={user._id === selectedUser && isEditRoleOpen}
                          onOpenChange={(open) => {
                            setIsEditRoleOpen(open);
                          }}
                        >
                          <PopoverTrigger>
                            <button
                              disabled={user._id === profile.id}
                              onClick={() => {
                                setSelectedUser(user._id);
                                setSelectRole(user.role.toString());
                              }}
                            >
                              <PencilSquare
                                className={`mt-1 ${
                                  user._id === profile.id
                                    ? "text-gray-300"
                                    : "text-gray-500"
                                }`}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48">
                            <div className="mx-2 my-2 flex flex-col justify-center">
                              <div>
                                <h3 className="font-bold pb-1 text-lg">
                                  ตำแหน่ง
                                </h3>
                              </div>
                              <div>
                                <RadioGroup
                                  value={selectRole}
                                  onValueChange={setSelectRole}
                                >
                                  <Radio value="1">User</Radio>
                                  <Radio value="100">Admin</Radio>
                                </RadioGroup>
                              </div>
                              <div>
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="mt-2 mx-1"
                                  onClick={() => {
                                    setSelectedUser("");
                                    setIsEditRoleOpen(false);
                                  }}
                                >
                                  ยกเลิก
                                </Button>
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="mt-2 mx-1"
                                  onClick={() => {
                                    setSelectedUser("");
                                    onSave(user._id, +selectRole);
                                  }}
                                >
                                  บันทึก
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell width={20}>
                        <Popover placement="bottom-end" color="default">
                          <PopoverTrigger>
                            <button disabled={user._id === profile.id}>
                              <TrashFill
                                className={`mt-1 ${
                                  user._id === profile.id
                                    ? "text-red-300"
                                    : "text-red-500"
                                }`}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="flex flex-col gap-2 mt-2 px-3">
                              <div>
                                <p>คุณต้องการลบผู้ใช้นี้ใช่หรือไม่</p>
                              </div>
                              <div className="self-center pb-2">
                                <Button
                                  size="sm"
                                  color="danger"
                                  onClick={() => {
                                    onDelete(user._id);
                                  }}
                                >
                                  ลบผู้ใช้
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </AdminLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const { data } = await client.GET("/api/v1/settings");

  const settings = data as settingsSchema;

  const shopping_jwt = getCookie("shopping-jwt", {
    req: ctx.req,
    res: ctx.res,
  }) as string | null;

  const profile = await getProfile(shopping_jwt);

  const allUsers = (
    await client.GET("/api/v1/users", {
      headers: {
        Authorization: `Bearer ${shopping_jwt}`,
      },
    })
  ).data as userSchama[];

  if (shopping_jwt) {
    if (profile?.role !== 100) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        settings,
        allUsers,
        profile,
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
