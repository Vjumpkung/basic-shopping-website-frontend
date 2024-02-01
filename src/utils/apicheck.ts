import client from "@/api/client";

export default function apiCheck(): Promise<boolean> {
  let x = client
    .GET("/api/v1/ping")
    .then((res) => {
      return false;
    })
    .catch((err) => {
      console.log(err);
      return true;
    });

  return x;
}
