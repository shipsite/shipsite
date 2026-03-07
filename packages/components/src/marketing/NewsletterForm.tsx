"use client";

import React, { FormEvent, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Section } from "../ui/section";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useFormSubmit } from "../lib/use-form-submit";

interface NewsletterFormProps {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  successMessage?: string;
  variant?: "section" | "inline";
}

export function NewsletterForm({
  id,
  action,
  title,
  description,
  placeholder = "Enter your email",
  submitLabel = "Subscribe",
  successMessage = "You're subscribed!",
  variant = "section",
}: NewsletterFormProps) {
  const { status, errorMsg, submit } = useFormSubmit(action);
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({ email });
  }

  const successContent = (
    <div className="flex items-center justify-center gap-2 text-sm text-primary">
      <CheckCircle className="size-4" />
      <span>{successMessage}</span>
    </div>
  );

  const formContent =
    status === "success" ? (
      successContent
    ) : (
      <>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            disabled={status === "loading"}
          />
          <Button type="submit" variant="default" disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              submitLabel
            )}
          </Button>
        </form>
        {status === "error" && (
          <p className="text-sm text-destructive text-center mt-2" aria-live="polite">
            {errorMsg}
          </p>
        )}
      </>
    );

  if (variant === "inline") {
    return formContent;
  }

  return (
    <Section id={id}>
      <div className="container-main max-w-2xl">
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
        {formContent}
      </div>
    </Section>
  );
}
