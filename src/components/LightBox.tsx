import { Image } from "@nextui-org/react";
import { useEffect, useState } from "react";

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
  }, [display]);

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
          id="lightbox"
          onClick={() => {
            hideLightBox();
            stateChanger(false);
          }}
        >
          <button onClick={showPrev} className="pl-5">
            <p className="font-medium text-6xl">{"<"}</p>
          </button>
          <Image
            radius="none"
            alt="lightbox"
            id="lightbox-img"
            src={imageToShow}
          />
          <button onClick={showNext} className="pr-5">
            <p className="font-medium text-6xl">{">"}</p>
          </button>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
