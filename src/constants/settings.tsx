import client from "@/api/client";
import { settingsSchema } from "@/types/swagger.types";
import { useEffect, useState } from "react";

export default function useSettings() {
  const [settings, setSettings] = useState<settingsSchema | undefined>();

  useEffect(() => {
    client.GET("/api/v1/settings").then((res) => {
      setSettings(res.data);
    });
  }, []);

  return settings;
}
