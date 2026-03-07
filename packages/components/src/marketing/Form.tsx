import React, { Children, isValidElement } from "react";
import { FormClient, type FormFieldDef } from "./FormClient";

interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  colSpan?: number;
}

export function FormField(_props: FormFieldProps) {
  return null;
}

interface FormProps {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  columns?: number;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  children: React.ReactNode;
}

export function Form({ children, ...rest }: FormProps) {
  const fields: FormFieldDef[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === FormField) {
      fields.push(child.props as FormFieldDef);
    }
  });

  return <FormClient {...rest} fields={fields} />;
}
