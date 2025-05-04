import * as React from "react";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export function Form({ children, className = "", ...props }: FormProps) {
  return (
    <form className={`space-y-4 ${className}`} {...props}>
      {children}
    </form>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className = "" }: FormFieldProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormLabel({
  children,
  className = "",
  required = false,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({
  children,
  className = "",
}: FormDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

interface FormErrorProps {
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

export function FormError({
  children,
  id,
  className = "",
}: FormErrorProps) {
  if (!children) return null;

  return (
    <p
      id={id}
      className={`text-sm font-medium text-red-500 dark:text-red-400 ${className}`}
      aria-live="polite"
    >
      {children}
    </p>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

export function Checkbox({
  label,
  description,
  error,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || React.useId();
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            aria-describedby={errorId}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={checkboxId}
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}

interface RadioGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: string;
}

export function RadioGroup({
  children,
  className = "",
  label,
  error,
}: RadioGroupProps) {
  const groupId = React.useId();
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`} role="radiogroup">
      {label && (
        <FormLabel id={`${groupId}-label`} className="mb-1">
          {label}
        </FormLabel>
      )}
      <div className="space-y-2">{children}</div>
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  className?: string;
}

export function Radio({
  label,
  description,
  className = "",
  id,
  ...props
}: RadioProps) {
  const radioId = id || React.useId();

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={radioId}
          type="radio"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={radioId}
          className="font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        {description && (
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  label,
  description,
  className = "",
  id,
  checked,
  ...props
}: SwitchProps) {
  const switchId = id || React.useId();

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <label
          htmlFor={switchId}
          className={`relative inline-flex items-center cursor-pointer ${
            props.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            {...props}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={switchId}
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
} 