"use client";

import type { MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Building2, Mail, MessageCircle, Phone, X } from "lucide-react";
import type { CommercialContact } from "@/lib/config/commercial-contact";
import { cn } from "@/lib/utils";

export type ConsultationLabels = {
  action: string;
  available: string;
  title: string;
  forItem: string;
  wechatService: string;
  enterpriseCooperation: string;
  email: string;
  phone: string;
  close: string;
};

type EntryPoint = "hero" | "inheritor" | "future-works" | "detail-footer";

type ConsultationContextValue = {
  available: boolean;
  actionLabel: string;
  openConsultation: (entryPoint: EntryPoint, trigger: HTMLButtonElement) => void;
};

type ConsultationProviderProps = {
  contact: CommercialContact;
  itemId: string;
  slug: string;
  itemName: string;
  labels: ConsultationLabels;
  children: ReactNode;
};

type ConsultationTriggerProps = {
  entryPoint: EntryPoint;
  children?: ReactNode;
  className?: string;
};

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function ConsultationTrigger({ entryPoint, children, className }: ConsultationTriggerProps) {
  const context = useContext(ConsultationContext);
  if (!context?.available) return null;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] bg-[#9b3b32] px-5 py-3 text-sm text-white transition hover:bg-[#7f2f29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3bea0]",
        className
      )}
      onClick={(event) => context.openConsultation(entryPoint, event.currentTarget)}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {children ?? context.actionLabel}
    </button>
  );
}

export function ConsultationProvider({ contact, itemId, slug, itemName, labels, children }: ConsultationProviderProps) {
  const [open, setOpen] = useState(false);
  const [activeEntryPoint, setActiveEntryPoint] = useState<EntryPoint>("hero");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open || !contact.hasChannels) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const dialogElement: HTMLDialogElement = dialog;
    const previousOverflow = document.body.style.overflow;

    function closeOnCancel(event: Event) {
      event.preventDefault();
      setOpen(false);
    }

    function containFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogElement.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.addEventListener("cancel", closeOnCancel);
    dialog.addEventListener("keydown", containFocus);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener("cancel", closeOnCancel);
      dialog.removeEventListener("keydown", containFocus);
      if (dialog.open) dialog.close();
      lastTriggerRef.current?.focus();
    };
  }, [contact.hasChannels, open]);

  function openConsultation(entryPoint: EntryPoint, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setActiveEntryPoint(entryPoint);
    setOpen(true);
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) setOpen(false);
  }

  const context: ConsultationContextValue = {
    available: contact.hasChannels,
    actionLabel: labels.action,
    openConsultation
  };

  return (
    <ConsultationContext.Provider value={context}>
      <div className={contact.hasChannels ? "pb-24 md:pb-0" : ""}>{children}</div>

      {contact.hasChannels ? (
        <>
          <div data-mobile-consultation className="fixed inset-x-0 bottom-0 z-40 border-t border-[#31594c]/15 bg-[#fffefa]/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
            <ConsultationTrigger entryPoint="hero" className="w-full">{labels.action}</ConsultationTrigger>
          </div>

          {open ? (
            <dialog
              ref={dialogRef}
              data-entry-point={activeEntryPoint}
              data-heritage-id={itemId}
              data-heritage-slug={slug}
              aria-labelledby="consultation-title"
              onClick={closeFromBackdrop}
              className="fixed inset-0 z-50 m-auto mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[6px] border-0 bg-[#fffefa] p-0 text-[#18231e] shadow-2xl backdrop:bg-black/50 sm:my-auto sm:max-w-3xl sm:rounded-[6px]"
            >
              <div className="border-b border-[#31594c]/10 px-5 py-5 sm:px-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[11px] uppercase text-[#9b3b32]">{labels.available}</p>
                    <h2 id="consultation-title" className="serif-title mt-2 text-3xl font-normal sm:text-4xl">{labels.title}</h2>
                    <p className="mt-2 text-sm text-[#65716b]">{labels.forItem}</p>
                  </div>
                  <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="grid size-10 shrink-0 place-items-center rounded-full border border-[#31594c]/15 text-[#59645e] transition hover:bg-[#31594c]/5" aria-label={labels.close} title={labels.close}>
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid gap-px bg-[#31594c]/10 sm:grid-cols-2">
                {contact.wechatQrImage ? (
                  <section className="bg-[#fffefa] p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-sm"><MessageCircle className="size-4 text-[#9b3b32]" />{labels.wechatService}</div>
                    <Image src={contact.wechatQrImage} alt={labels.wechatService} width={280} height={280} loading="lazy" className="mx-auto aspect-square w-full max-w-[240px] bg-white object-contain" />
                  </section>
                ) : null}
                {contact.businessQrImage ? (
                  <section className="bg-[#fffefa] p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-sm"><Building2 className="size-4 text-[#9b3b32]" />{labels.enterpriseCooperation}</div>
                    <Image src={contact.businessQrImage} alt={labels.enterpriseCooperation} width={280} height={280} loading="lazy" className="mx-auto aspect-square w-full max-w-[240px] bg-white object-contain" />
                  </section>
                ) : null}
              </div>

              {contact.email || contact.phone ? (
                <div className="grid gap-px border-t border-[#31594c]/10 bg-[#31594c]/10 sm:grid-cols-2">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="flex min-h-20 items-center gap-3 bg-[#f4f1ea] px-6 py-5 transition hover:bg-[#ebe6dc] sm:px-8">
                      <Mail className="size-5 text-[#9b3b32]" aria-hidden="true" />
                      <span><span className="block text-[10px] text-[#7a847e]">{labels.email}</span><span className="mt-1 block break-all text-sm">{contact.email}</span></span>
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex min-h-20 items-center gap-3 bg-[#f4f1ea] px-6 py-5 transition hover:bg-[#ebe6dc] sm:px-8">
                      <Phone className="size-5 text-[#9b3b32]" aria-hidden="true" />
                      <span><span className="block text-[10px] text-[#7a847e]">{labels.phone}</span><span className="mt-1 block text-sm">{contact.phone}</span></span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </dialog>
          ) : null}
        </>
      ) : null}
    </ConsultationContext.Provider>
  );
}
