"use client";

import React, { FormEvent, useId, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Section } from "../ui/section";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useFormSubmit } from "../lib/use-form-submit";

interface ContactFormProps {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  nameLabel?: string;
  emailLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  variant?: "section" | "card";
}

export function ContactForm({
  id,
  action,
  title = "Get in Touch",
  description,
  nameLabel = "Name",
  emailLabel = "Email",
  messageLabel = "Message",
  submitLabel = "Send Message",
  successTitle = "Message Sent!",
  successMessage = "We'll get back to you as soon as possible.",
  variant = "section",
}: ContactFormProps) {
  const uid = useId();
  const { status, errorMsg, submit } = useFormSubmit(action);
  const [fields, setFields] = useState({ name: "", email: "", message: "" });

  function update(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(fields);
  }

  const successContent = (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{successTitle}</h3>
      <p className="text-muted-foreground">{successMessage}</p>
    </div>
  );

  const formContent =
    status === "success" ? (
      successContent
    ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-name`}>{nameLabel}</Label>
            <Input
              id={`${uid}-name`}
              name="name"
              placeholder="Your name"
              value={fields.name}
              onChange={(e) => update("name", e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-email`}>{emailLabel}</Label>
            <Input
              id={`${uid}-email`}
              name="email"
              type="email"
              placeholder="you@example.com"
              value={fields.email}
              onChange={(e) => update("email", e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${uid}-message`}>{messageLabel}</Label>
          <Textarea
            id={`${uid}-message`}
            name="message"
            placeholder="Your message..."
            value={fields.message}
            onChange={(e) => update("message", e.target.value)}
            required
            disabled={status === "loading"}
          />
        </div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {status === "error" && (
          <p className="text-sm text-destructive" aria-live="polite">
            {errorMsg}
          </p>
        )}
      </form>
    );

  if (variant === "card") {
    return (
      <div className="glass-2 rounded-2xl p-8">{formContent}</div>
    );
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
        <div className="glass-1 rounded-2xl p-8">{formContent}</div>
      </div>
    </Section>
  );
}
