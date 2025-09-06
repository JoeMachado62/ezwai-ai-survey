import { clsx } from "clsx";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function TextField({ 
  label, 
  className, 
  ...props 
}: { 
  label: string 
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <input className={clsx("input-ez", className)} {...props} />
    </label>
  );
}

export function TextArea({ 
  label, 
  className, 
  ...props 
}: { 
  label: string 
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <textarea className={clsx("textarea-ez", className)} {...props} />
    </label>
  );
}

export function SelectField({ 
  label, 
  className, 
  children, 
  ...props 
}: { 
  label: string 
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <select className={clsx("select-ez", className)} {...props}>
        {children}
      </select>
    </label>
  );
}