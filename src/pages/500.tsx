import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="left-0 right-0 top-0 bottom-0 flex min-h-screen flex-col items-center justify-between -z-10">
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl m-auto px-2">
        <Image
          src="https://media.tenor.com/0KRaDeI5qZ0AAAAM/stickergiant-servers-are-down.gif"
          width={220}
          height={124}
          alt="gif down"
        />
        <h1 className="text-3xl">เว็บไซต์ล่มอยู่ กรุณาลองเข้าใหม่อีกครั้ง</h1>
        <Link href="/">
          <Button>ลองอีกครั้ง</Button>
        </Link>
      </div>
    </div>
  );
}
