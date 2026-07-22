import { describe, expect, it } from "vitest";
import { normalizeCommercialContact } from "@/lib/config/commercial-contact";

describe("commercial contact config", () => {
  it("normalizes optional global channels", () => {
    expect(normalizeCommercialContact({
      wechatQrImage: " /assets/contact/wechat.webp ",
      businessQrImage: "",
      email: " hello@example.com ",
      phone: " +86 400 000 0000 "
    })).toEqual({
      wechatQrImage: "/assets/contact/wechat.webp",
      businessQrImage: null,
      email: "hello@example.com",
      phone: "+86 400 000 0000",
      hasChannels: true
    });
  });

  it("reports no consultation channels when every value is empty", () => {
    expect(normalizeCommercialContact({})).toEqual({
      wechatQrImage: null,
      businessQrImage: null,
      email: null,
      phone: null,
      hasChannels: false
    });
  });
});
