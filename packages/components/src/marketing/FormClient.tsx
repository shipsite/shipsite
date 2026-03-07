"use client";

import React, { FormEvent, useId, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Section } from "../ui/section";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../lib/utils";
import { useFormSubmit } from "../lib/use-form-submit";

const gridColsMap: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

const colSpanMap: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

export interface FormFieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  colSpan?: number;
}

interface FormClientProps {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  columns?: number;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  fields: FormFieldDef[];
}

export function FormClient({
  id,
  action,
  title,
  description,
  columns = 1,
  submitLabel = "Submit",
  successTitle = "Submitted!",
  successMessage = "Thank you. We'll be in touch soon.",
  fields,
}: FormClientProps) {
  const uid = useId();
  const { status, errorMsg, submit } = useFormSubmit(action);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.name] = "";
    return init;
  });

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(values);
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

        {status === "success" ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {successTitle}
            </h3>
            <p className="text-muted-foreground">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-1 rounded-2xl p-8">
            <div
              className={cn("grid grid-cols-1 gap-6", gridColsMap[columns])}
            >
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={cn("space-y-2", field.colSpan && colSpanMap[field.colSpan])}
                >
                  <Label htmlFor={`${uid}-${field.name}`}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`${uid}-${field.name}`}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={values[field.name] ?? ""}
                      onChange={(e) => update(field.name, e.target.value)}
                      disabled={status === "loading"}
                    />
                  ) : field.type === "select" && field.options ? (
                    <Select
                      value={values[field.name] ?? ""}
                      onValueChange={(v) => update(field.name, v)}
                      required={field.required}
                      disabled={status === "loading"}
                    >
                      <SelectTrigger id={`${uid}-${field.name}`}>
                        <SelectValue
                          placeholder={field.placeholder || "Select..."}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`${uid}-${field.name}`}
                      name={field.name}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={values[field.name] ?? ""}
                      onChange={(e) => update(field.name, e.target.value)}
                      disabled={status === "loading"}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8">
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
                    Submitting...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
              {status === "error" && (
                <p className="text-sm text-destructive mt-2" aria-live="polite">
                  {errorMsg}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}
