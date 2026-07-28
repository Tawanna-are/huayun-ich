import type { AppLocale } from "@/i18n/routing";

export const legalDocumentKeys = ["disclaimer", "privacy", "copyright", "terms"] as const;

export type LegalDocumentKey = (typeof legalDocumentKeys)[number];

export type LegalTextSegment = {
  text: string;
  href?: "/#contact";
};

export type LegalSection = {
  title: string;
  paragraphs: LegalTextSegment[][];
};

export type LegalDocument = {
  title: string;
  description: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

const text = (value: string): LegalTextSegment => ({ text: value });
const contact = (value: string): LegalTextSegment => ({ text: value, href: "/#contact" });

const legalDocuments: Record<AppLocale, Record<LegalDocumentKey, LegalDocument>> = {
  zh: {
    disclaimer: {
      title: "免责声明",
      description: "华韵非遗网站关于文化资料、外部链接、用户内容与网站服务范围的免责声明。",
      updatedAt: "2026年7月28日",
      intro: "本声明说明华韵非遗提供文化展示与交流服务时的资料来源、使用边界和责任范围。访问或使用本站即表示您已阅读并理解本声明。",
      sections: [
        {
          title: "文化信息与一般说明",
          paragraphs: [[text("本站内容主要用于中国非物质文化遗产的介绍、文化展示、教育与交流，不构成法律、投资、商业、鉴定或其他专业意见。华韵非遗网站运营方会尽合理努力维护内容质量，但不保证所有资料在任何时间均完全、准确或持续可用。")]]
        },
        {
          title: "资料来源与更新",
          paragraphs: [[text("部分历史、地域、工艺及文化资料根据公开信息整理。相关知识会持续发展，不同来源也可能存在表述差异。本站可根据新的可靠资料修订、补充或下线内容，恕不另行通知。")]]
        },
        {
          title: "外部链接与第三方内容",
          paragraphs: [[text("本站可能提供第三方网站、平台或资料的链接，以方便进一步了解相关主题。第三方服务由其各自运营者负责，本站不控制其内容、可用性、隐私实践或安全措施，链接也不表示本站对其作出认可或保证。")]]
        },
        {
          title: "用户提交内容",
          paragraphs: [[text("评论、合作申请及其他用户提交内容仅代表提交者本人。本站可以为维护文化尊重、信息准确和社区安全而审核、隐藏或移除相关内容，但不因此承担对所有用户内容进行持续监控的义务。")]]
        },
        {
          title: "联系我们",
          paragraphs: [[text("如发现事实错误、不当内容或权利问题，请通过"), contact("联系我们页面"), text("提交具体页面、问题说明及必要证明材料，华韵非遗网站运营方将在合理范围内核实并处理。")]]
        }
      ]
    },
    privacy: {
      title: "隐私政策",
      description: "华韵非遗网站关于个人信息、Cookie、访问统计、Google Analytics及联系表单数据的隐私政策。",
      updatedAt: "2026年7月28日",
      intro: "本政策说明华韵非遗网站运营方在您浏览网站、使用账户功能或提交在线表单时可能处理哪些信息、处理目的以及您可以采取的控制方式。",
      sections: [
        {
          title: "我们可能处理的信息",
          paragraphs: [[text("根据您使用的功能，本站可能处理浏览器和设备类型、访问时间、所访问页面、来源页面、概略地区、IP地址等技术信息；注册或登录所需的账户标识；以及您主动提交的姓名、联系方式、机构、评论、合作申请或其他表单内容。请不要通过公开评论提交敏感个人信息。")]]
        },
        {
          title: "Cookie 与浏览器存储",
          paragraphs: [[text("本站及受托服务商可能使用 Cookie、像素或类似浏览器存储，以维持登录状态、记住必要设置、保护服务安全并进行网站访问统计。您可以通过浏览器设置限制或删除 Cookie，但部分登录、偏好或互动功能可能因此无法正常使用。")]]
        },
        {
          title: "网站访问统计与 Google Analytics",
          paragraphs: [[text("本站使用 Google Analytics 4 进行网站访问统计，以了解页面浏览量、访问来源、设备类别、概略国家或地区以及用户在网站中的整体使用情况。Google Analytics 可能通过 Cookie 或类似标识符收集相关使用数据，并由 Google 按其服务条款和隐私政策处理。本站利用汇总统计改善内容、英文与中文体验及网站性能，不出售这些访问统计数据。您可以通过浏览器 Cookie 设置、广告或跟踪防护工具，以及 Google 提供的相关退出控制限制此类收集。")]]
        },
        {
          title: "信息用途与共享",
          paragraphs: [[text("信息仅用于提供和保护网站服务、响应咨询、处理评论及合作申请、维护账户、分析网站使用情况和履行适用义务。为实现这些目的，数据可能由托管、数据库、身份验证、访问分析或错误监控服务商代表本站处理；除依法要求、保护合法权益或获得您的授权外，本站不会向无关第三方出售或披露个人信息。")]]
        },
        {
          title: "跨境处理、保存与安全",
          paragraphs: [[text("由于本站面向国际访问者并使用全球化网络服务，相关信息可能在您所在国家或地区以外被处理。本站采取与网站规模和信息性质相适应的合理技术与管理措施，并仅在实现上述目的、解决争议或满足必要记录要求的合理期限内保存信息，但任何互联网传输或存储方式都无法保证绝对安全。")]]
        },
        {
          title: "您的选择与联系我们",
          paragraphs: [[text("您可以限制 Cookie、不提交非必要信息，或就您提交的信息提出查询、更正或删除请求。请通过"), contact("联系我们页面"), text("说明您的请求及相关账户或提交记录。为保护信息安全，华韵非遗网站运营方可能在处理请求前核实必要身份信息。")]]
        }
      ]
    },
    copyright: {
      title: "图片版权声明",
      description: "华韵非遗网站关于图片、文字、文化资料来源、合理展示及权利人通知处理方式的版权声明。",
      updatedAt: "2026年7月28日",
      intro: "本站尊重所有图片、文字及相关资料的知识产权。本站内容用于非遗文化展示与交流，不代表相关素材可以被任意复制或用于其他目的。",
      sections: [
        {
          title: "知识产权尊重",
          paragraphs: [[text("本站尊重所有图片、文字及相关资料的知识产权。页面中标明作者、来源、机构或权利人的，相关权利仍归其合法权利人所有。除非另有明确许可，本站展示不构成对任何素材的授权转让。")]]
        },
        {
          title: "公开文化资料",
          paragraphs: [[text("部分文化资料来自公开信息整理，用于文化展示与交流。本站会尽合理努力核对来源和使用条件，但公开可见、署名或经过编辑并不当然意味着素材不受版权、肖像权、商标权或其他权利保护。")]]
        },
        {
          title: "使用本站素材",
          paragraphs: [[text("如需转载、下载、公开传播或商业使用本站图片、视频或文字，请先确认具体素材的权利归属并取得必要许可。非商业宣传、二次编辑或未展示人物面部，也不必然排除侵权风险。")]]
        },
        {
          title: "权利人通知与处理",
          paragraphs: [[text("如权利人认为本站内容涉及版权问题，请通过联系我们页面提交证明材料，我们将在核实后进行处理。为便于核实，请提供涉及作品、本站页面链接、权利归属证明、具体诉求以及可供回复的联系方式。")], [text("您可以通过"), contact("联系我们页面"), text("提交上述材料。核实期间，本站可视情况限制展示、补充署名、更正来源或移除相关内容。")]]
        },
        {
          title: "用户提交保证",
          paragraphs: [[text("向本站上传、发送或提交内容的用户，应确保拥有必要权利或已取得有效授权，并且相关内容不侵犯第三方知识产权、人格权或其他合法权益。")]]
        }
      ]
    },
    terms: {
      title: "用户协议",
      description: "华韵非遗网站关于访问、账户、评论、内容提交、知识产权和服务使用规则的用户协议。",
      updatedAt: "2026年7月28日",
      intro: "本协议适用于您对华韵非遗网站及其中文、英文页面和互动功能的访问与使用。继续使用本站即表示您同意遵守以下规则。",
      sections: [
        {
          title: "运营方与服务范围",
          paragraphs: [[text("本站由华韵非遗网站运营方维护，提供非遗文化介绍、图片和视频展示、收藏点赞、评论及在线联系等功能。具体功能可能根据内容、技术、安全或运营需要调整。")]]
        },
        {
          title: "账户责任",
          paragraphs: [[text("使用需要登录的功能时，您应提供真实、合法的信息，妥善保护登录凭证，并对账户下的操作负责。如发现未经授权使用或安全风险，请及时停止相关操作并通过本站联系渠道说明情况。")]]
        },
        {
          title: "可接受使用",
          paragraphs: [[text("您不得利用本站发布违法、侮辱、歧视、虚假、骚扰或侵犯他人权利的内容，不得冒充他人，不得绕过安全措施、批量抓取、干扰服务、传播恶意代码，或将本站及其内容用于未经许可的侵权或违法活动。")]]
        },
        {
          title: "评论、申请与其他提交",
          paragraphs: [[text("您保留对原创提交内容依法享有的权利，同时允许本站为展示、审核、回复和管理相应功能而在必要范围内存储、复制和处理该内容。本站可对违反本协议、偏离文化交流目的或可能造成风险的提交进行审核、拒绝、隐藏或删除。")]]
        },
        {
          title: "知识产权",
          paragraphs: [[text("本站界面、品牌标识、原创文字及本站依法享有权利的内容受相关规则保护。页面中的第三方文化资料和媒体仍属于各自权利人。除非获得明确许可，您不得将相关内容复制、销售、再授权或用于误导性宣传。")]]
        },
        {
          title: "服务可用性与责任边界",
          paragraphs: [[text("本站会合理维护服务，但不保证服务永不中断、完全无误或适用于所有设备和地区。在适用规则允许的范围内，因第三方服务、网络故障、不可控制事件或用户不当使用导致的损失，应根据具体事实和适用规则确定责任。")]]
        },
        {
          title: "协议更新与联系我们",
          paragraphs: [[text("本站可因功能、服务商或规则变化更新本协议，并在本页标注更新日期。重大变化会在合理可行范围内予以提示。如对协议或账户使用有疑问，请通过"), contact("联系我们页面"), text("联系华韵非遗网站运营方。")]]
        }
      ]
    }
  },
  en: {
    disclaimer: {
      title: "Disclaimer",
      description: "Huayun Heritage's disclaimer covering cultural information, external links, user submissions, and the scope of the website service.",
      updatedAt: "July 28, 2026",
      intro: "This disclaimer explains the sources, intended use, and limits of the cultural information and services provided by Huayun Heritage. By using the website, you acknowledge this notice.",
      sections: [
        { title: "Cultural information", paragraphs: [[text("The website presents Chinese intangible cultural heritage for cultural, educational, and exchange purposes. Its content is not legal, investment, commercial, authentication, or other professional advice. The Huayun Heritage Website Operator takes reasonable care with the material but does not guarantee that every item is complete, accurate, or continuously available.")]] },
        { title: "Sources and updates", paragraphs: [[text("Some historical, regional, craft, and cultural information is compiled from publicly available sources. Knowledge and interpretations may evolve or differ between sources. We may revise, supplement, or remove material when more reliable information becomes available.")]] },
        { title: "External links", paragraphs: [[text("Links to third-party websites, platforms, or resources may be provided for convenience. Those services are controlled by their respective operators. Huayun Heritage does not control or guarantee their content, availability, privacy practices, or security, and a link does not imply endorsement.")]] },
        { title: "User submissions", paragraphs: [[text("Comments, cooperation requests, and other user submissions represent their respective authors. We may review, hide, or remove material to protect cultural respect, accuracy, and community safety, but this does not create an obligation to continuously monitor every submission.")]] },
        { title: "Contact", paragraphs: [[text("To report a factual error, inappropriate material, or a rights concern, please use the "), contact("Contact Us page"), text(" and include the relevant page, an explanation, and supporting information. The Huayun Heritage Website Operator will review the request within a reasonable scope.")]] }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      description: "Huayun Heritage's privacy policy for personal information, cookies, website analytics, Google Analytics, and online form submissions.",
      updatedAt: "July 28, 2026",
      intro: "This policy explains the information the Huayun Heritage Website Operator may process when you browse the website, use account features, or submit an online form, and the choices available to you.",
      sections: [
        { title: "Information we may process", paragraphs: [[text("Depending on the features you use, we may process technical information such as browser and device type, access time, pages viewed, referring page, approximate region, and IP address; identifiers needed for registration or sign-in; and information you submit, such as your name, contact details, organization, comments, or cooperation request. Please do not post sensitive personal information in public comments.")]] },
        { title: "Cookies and browser storage", paragraphs: [[text("The website and service providers acting for it may use cookies, pixels, or similar browser storage to maintain sign-in, remember necessary settings, protect the service, and support website analytics. You can restrict or delete cookies through your browser settings, although some account, preference, or interaction features may then work differently.")]] },
        { title: "Website analytics and Google Analytics", paragraphs: [[text("We use Google Analytics 4 for website analytics, including aggregate page views, referral sources, device categories, approximate country or region, and general use of the website. Google Analytics may collect this usage data through cookies or similar identifiers and process it under Google's own terms and privacy policy. We use aggregate statistics to improve content, Chinese and English experiences, and website performance, and we do not sell this analytics data. You may limit collection through browser cookie settings, tracking-protection tools, or relevant controls provided by Google.")]] },
        { title: "Purposes and sharing", paragraphs: [[text("Information is used to provide and secure the website, respond to inquiries, process comments and cooperation requests, maintain accounts, analyze website use, and meet applicable obligations. Hosting, database, authentication, analytics, or error-monitoring providers may process data for these purposes. We do not sell personal information or disclose it to unrelated parties except where required by applicable rules, necessary to protect legitimate rights, or authorized by you.")]] },
        { title: "International processing, retention, and security", paragraphs: [[text("Because the website serves an international audience and uses global network services, information may be processed outside your country or region. We use reasonable technical and organizational measures appropriate to the website and retain information only for a reasonable period needed for the purposes above, dispute handling, or necessary records. No internet transmission or storage method can be guaranteed as absolutely secure.")]] },
        { title: "Your choices and contact", paragraphs: [[text("You may restrict cookies, avoid providing optional information, or request access, correction, or deletion regarding information you submitted. Use the "), contact("Contact Us page"), text(" and identify the relevant account or submission. The Huayun Heritage Website Operator may verify limited information before acting on a request in order to protect data security.")]] }
      ]
    },
    copyright: {
      title: "Image Copyright Policy",
      description: "Huayun Heritage's policy on images, text, public cultural sources, permitted display, and the process for rights-holder notices.",
      updatedAt: "July 28, 2026",
      intro: "Huayun Heritage respects the intellectual property rights in images, text, and related materials. Cultural display on this website does not mean that the material may be freely copied or reused.",
      sections: [
        { title: "Respect for intellectual property", paragraphs: [[text("This website respects the intellectual property rights in all images, text, and related materials. Where an author, source, institution, or rights holder is identified, the relevant rights remain with that lawful rights holder. Display on the website does not transfer or grant a license unless expressly stated.")]] },
        { title: "Public cultural information", paragraphs: [[text("Some cultural material is compiled from publicly available information for cultural display and exchange. We take reasonable steps to review sources and usage conditions, but public availability, attribution, or editing does not by itself remove copyright, personality, trademark, or other legal protections.")]] },
        { title: "Reusing website material", paragraphs: [[text("Before reproducing, downloading, publicly distributing, or commercially using an image, video, or text from the website, confirm the rights in that specific material and obtain any necessary permission. Non-commercial promotion, alteration, or hiding a person's face does not automatically eliminate infringement risk.")]] },
        { title: "Rights-holder notice and review", paragraphs: [[text("If a rights holder believes that material on the website raises a copyright concern, please provide supporting evidence through the Contact Us page. Include the work concerned, the Huayun Heritage page URL, evidence of ownership or authority, the requested action, and a way for us to respond.")], [text("Submit these materials through the "), contact("Contact Us page"), text(". After verification, we may restrict display, add attribution, correct the source, or remove the material as appropriate.")]] },
        { title: "User-submitted material", paragraphs: [[text("Anyone who uploads, sends, or submits material must have the necessary rights or valid permission and must ensure that the material does not infringe third-party intellectual property, personality, or other lawful rights.")]] }
      ]
    },
    terms: {
      title: "Terms of Service",
      description: "Huayun Heritage's terms for website access, accounts, comments, submissions, intellectual property, and acceptable use.",
      updatedAt: "July 28, 2026",
      intro: "These terms apply when you access or use Huayun Heritage, including its Chinese and English pages and interactive features. By continuing to use the website, you agree to follow these rules.",
      sections: [
        { title: "Operator and service scope", paragraphs: [[text("The Huayun Heritage Website Operator maintains the website to provide cultural information, image and video displays, favorites, likes, comments, and online contact features. Features may change in response to content, technical, security, or operational needs.")]] },
        { title: "Account responsibility", paragraphs: [[text("When using features that require sign-in, provide lawful and accurate information, protect your credentials, and take responsibility for activity under your account. If you identify unauthorized use or a security concern, stop the affected activity and notify us through the website.")]] },
        { title: "Acceptable use", paragraphs: [[text("You must not use the website to publish unlawful, abusive, discriminatory, deceptive, harassing, or infringing material; impersonate another person; bypass security; perform disruptive automated extraction; interfere with the service; distribute malicious code; or use the website or its content for unauthorized infringement or unlawful activity.")]] },
        { title: "Comments and submissions", paragraphs: [[text("You retain rights that you lawfully hold in original submissions, while allowing the website to store, reproduce, and process them as reasonably needed to display, review, respond to, and manage the relevant feature. We may review, reject, hide, or remove submissions that violate these terms, undermine cultural exchange, or create legal or safety risk.")]] },
        { title: "Intellectual property", paragraphs: [[text("The website interface, brand elements, original text, and material lawfully controlled by the operator remain protected. Third-party cultural material and media remain the property of their respective rights holders. Without express permission, you may not reproduce, sell, sublicense, or use protected material in misleading promotion.")]] },
        { title: "Availability and limits", paragraphs: [[text("We take reasonable steps to maintain the website but do not promise uninterrupted or error-free availability on every device or in every region. To the extent permitted by applicable rules, responsibility for loss associated with third-party services, network failure, events outside reasonable control, or misuse must be assessed according to the facts and applicable rules.")]] },
        { title: "Updates and contact", paragraphs: [[text("We may update these terms when features, providers, or relevant requirements change and will show the updated date on this page. Material changes will be highlighted where reasonably practical. For questions about these terms or account use, contact the Huayun Heritage Website Operator through the "), contact("Contact Us page"), text(".")]] }
      ]
    }
  }
};

export function getLegalDocument(key: LegalDocumentKey, locale: AppLocale): LegalDocument {
  return legalDocuments[locale][key];
}
