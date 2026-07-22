import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "华韵 · 中国非遗",
    short_name: "华韵",
    description: "中国非物质文化遗产数字博物馆，可安装、可离线浏览精选内容。",
    start_url: "/zh",
    scope: "/",
    display: "standalone",
    background_color: "#0F0F0F",
    theme_color: "#0F0F0F",
    orientation: "portrait-primary",
    lang: "zh-CN",
    categories: ["education", "culture", "travel"],
    icons: [
      {
        src: absoluteUrl("/assets/hero-museum.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: absoluteUrl("/assets/hero-museum.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
