import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl m-auto px-2">
        <h1 className="text-5xl">404 Not Found</h1>
        <Link href="/">
          <Button>กลับสู่หน้าแรก</Button>
        </Link>
      </div>
    </div>
  );
}
