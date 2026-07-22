export type CommercialContactInput = {
  wechatQrImage?: string | null;
  businessQrImage?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type CommercialContact = {
  wechatQrImage: string | null;
  businessQrImage: string | null;
  email: string | null;
  phone: string | null;
  hasChannels: boolean;
};

function normalizeValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

export function normalizeCommercialContact(input: CommercialContactInput): CommercialContact {
  const wechatQrImage = normalizeValue(input.wechatQrImage);
  const businessQrImage = normalizeValue(input.businessQrImage);
  const email = normalizeValue(input.email);
  const phone = normalizeValue(input.phone);

  return {
    wechatQrImage,
    businessQrImage,
    email,
    phone,
    hasChannels: Boolean(wechatQrImage || businessQrImage || email || phone)
  };
}

export const commercialContact = normalizeCommercialContact({
  wechatQrImage: process.env.NEXT_PUBLIC_WECHAT_SERVICE_QR,
  businessQrImage: process.env.NEXT_PUBLIC_ENTERPRISE_COOPERATION_QR,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE
});
