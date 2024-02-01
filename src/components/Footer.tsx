import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();

  if (
    router.pathname === "/signin" ||
    router.pathname === "/signup" ||
    router.pathname === "/cart"
  )
    return null;
  return (
    <footer className="mt-5 mb-2">
      <div>
        <p className="text-center font-semibold text-black">
          Made with ❤️ by vjumpkung
        </p>
      </div>
    </footer>
  );
}
