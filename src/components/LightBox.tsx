import { placeholder } from "@/const/placeholder";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import isURL from "validator/lib/isURL";

export default function LightBox({
  images,
  display,
  selectImage,
  stateChanger,
}: {
  images: string[];
  display: boolean;
  selectImage: string;
  stateChanger: (state: boolean) => void;
}) {
  useEffect(() => {
    if (display) {
      showImage(selectImage);
    }
  }, [display, selectImage]);

  const [lightboxDisplay, setLightBoxDisplay] = useState<boolean>(false);
  const [imageToShow, setImageToShow] = useState<string>("");

  const showImage = (image: string) => {
    setImageToShow(image);
    setLightBoxDisplay(true);
  };

  const hideLightBox = () => {
    setLightBoxDisplay(false);
  };

  const showNext = (e: any) => {
    e.stopPropagation();
    let currentIndex = images.indexOf(imageToShow);
    if (currentIndex >= images.length - 1) {
      setLightBoxDisplay(false);
      stateChanger(false);
    } else {
      let nextImage = images[currentIndex + 1];
      setImageToShow(nextImage);
    }
  };

  const showPrev = (e: any) => {
    e.stopPropagation();
    let currentIndex = images.indexOf(imageToShow);
    if (currentIndex <= 0) {
      setLightBoxDisplay(false);
      stateChanger(false);
    } else {
      let nextImage = images[currentIndex - 1];
      setImageToShow(nextImage);
    }
  };

  return (
    <>
      {lightboxDisplay ? (
        <div
          hidden={!lightboxDisplay}
          id="lightbox"
          className="fixed top-0 bottom-0 right-0 left-0 flex min-h-screen w-full flex-row items-center justify-between z-50"
          onClick={() => {
            hideLightBox();
            stateChanger(false);
          }}
        >
          <button onClick={showPrev} className="sm:px-6 px-1">
            <p className="font-medium md:text-6xl text-xl text-white">
              <CaretLeftFill />
            </p>
          </button>
          <>
            {images.map((image, index) => {
              return (
                <div
                  key={image + index.toString()}
                  className={`${imageToShow === image ? "block" : "hidden"}`}
                >
                  <Image
                    width={1080}
                    height={1080}
                    alt="lightbox"
                    className="object-scale-down h-screen mx-auto px-2 py-2"
                    src={isURL(image) ? image : placeholder}
                    loading="eager"
                  />
                </div>
              );
            })}
          </>
          <button onClick={showNext} className="sm:px-6 px-1">
            <p className="font-medium md:text-6xl text-xl text-white">
              <CaretRightFill />
            </p>
          </button>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
