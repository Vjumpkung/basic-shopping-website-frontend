import { AdminMenuContext } from "@/components/AdminLayout";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { PagesProgressBar } from "next-nprogress-bar";
import { AppProps } from "next/app";
import { Kanit } from "next/font/google";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const kanit = Kanit({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export default function App({ Component, pageProps }: AppProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <PagesProgressBar
            color="#0070f0"
            options={{ showSpinner: false }}
            shallowRouting
          />
          <NextUIProvider navigate={router.push}>
            <AdminMenuContext.Provider value={{ isOpen, setIsOpen }}>
              <main className={kanit.className}>
                <ToastContainer />
                <Component {...pageProps} />
              </main>
            </AdminMenuContext.Provider>
          </NextUIProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </>
  );
}
