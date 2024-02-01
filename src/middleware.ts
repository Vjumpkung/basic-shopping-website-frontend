import { getCookie, hasCookie, setCookie } from "cookies-next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (hasCookie("shopping-jwt", { req, res })) {
    setCookie("shopping-jwt", getCookie("shopping-jwt", { req, res }), {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
