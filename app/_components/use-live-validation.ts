"use client";
import { useState, type FormEvent } from "react";

/** Reveal invalid input while typing, after blur, or on an attempted submit. */
export function useLiveValidation<Field extends string>(
  errors: Record<Field, string>,
  prefix: string,
) {
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const touch = (field: Field) =>
    setTouched((previous) => ({ ...previous, [field]: true }));
  const error = (field: Field, value: string) =>
    submitted || touched[field] || value.length > 0 ? errors[field] : "";
  const feedbackId = (field: Field) => `${prefix}-${field}-feedback`;
  function fieldProps(field: Field, value: string) {
    const message = error(field, value);
    return {
      name: field,
      "aria-invalid": !!message,
      "aria-describedby": message ? feedbackId(field) : undefined,
      onBlur: () => touch(field),
    };
  }
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const invalid = (Object.keys(errors) as Field[]).find(
      (field) => !!errors[field],
    );
    if (invalid) {
      const form = event.currentTarget;
      const control = form.elements.namedItem(invalid);
      if (control instanceof HTMLElement) control.focus();
      else form.querySelector<HTMLElement>(`[data-validation-field="${invalid}"]`)?.focus();
      return false;
    }
    return true;
  }
  return { touch, error, feedbackId, fieldProps, validate };
}
