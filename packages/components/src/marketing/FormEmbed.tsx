"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Section } from "../ui/section";
import { Button } from "../ui/button";

function resolveUrl(src: string, provider: "tally" | "typeform" | "custom"): string {
  switch (provider) {
    case "tally":
      return `https://tally.so/embed/${src}?transparentBackground=1`;
    case "typeform":
      return `https://form.typeform.com/to/${src}`;
    case "custom":
      return src;
  }
}

interface FormEmbedProps {
  id?: string;
  src: string;
  provider?: "tally" | "typeform" | "custom";
  title?: string;
  description?: string;
  height?: number;
  mode?: "iframe" | "popup";
  buttonLabel?: string;
}

export function FormEmbed({
  id,
  src,
  provider = "custom",
  title,
  description,
  height = 500,
  mode = "iframe",
  buttonLabel = "Open Form",
}: FormEmbedProps) {
  const resolvedUrl = resolveUrl(src, provider);

  if (mode === "popup") {
    return <FormEmbedPopup url={resolvedUrl} buttonLabel={buttonLabel} height={height} />;
  }

  return (
    <Section id={id}>
      <div className="container-main max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="glass-1 rounded-2xl overflow-hidden">
          <iframe
            src={resolvedUrl}
            height={height}
            className="w-full border-0"
            loading="lazy"
            title={title || "Embedded form"}
          />
        </div>
      </div>
    </Section>
  );
}

function FormEmbedPopup({
  url,
  buttonLabel,
  height,
}: {
  url: string;
  buttonLabel: string;
  height: number;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button variant="default" size="lg">
          {buttonLabel}
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content className="bg-background border-border dark:border-border/15 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 shadow-lg overflow-hidden">
          <DialogPrimitive.Title className="sr-only">
            {buttonLabel}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Embedded form
          </DialogPrimitive.Description>
          <iframe
            src={url}
            height={height}
            className="w-full border-0"
            loading="lazy"
            title={buttonLabel}
          />
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-[100] rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden">
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
