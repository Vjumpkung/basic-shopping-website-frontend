import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useSettings from "@/constants/settings";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { AppProps } from "next/app";
import { Kanit } from "next/font/google";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const kanit = Kanit({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

function MyApp({ Component, pageProps }: AppProps) {
  const settings = useSettings();
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push}>
      <ToastContainer />
      <main className={kanit.className}>
        <Header settings={settings} />
        <Component {...pageProps} />
        <Footer />
      </main>
    </NextUIProvider>
  );
}

export default MyApp;
