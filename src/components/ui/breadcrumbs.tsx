import * as React from "react";

type BreadcrumbAriaCurrentType = "page" | "step" | "location" | "date" | "time" | true | false | undefined;

interface BreadcrumbItemProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  "aria-current"?: BreadcrumbAriaCurrentType;
  isLast?: boolean;
}

export function BreadcrumbItem({
  children,
  href,
  className = "",
  "aria-current": ariaCurrent,
  isLast = false,
}: BreadcrumbItemProps) {
  const baseClassName = `text-sm font-medium ${href ? "hover:underline" : ""} ${className}`;
  const colorClassName = isLast 
    ? "text-gray-700 dark:text-gray-300" 
    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
  
  if (href) {
    return (
      <a
        href={href}
        className={`${baseClassName} ${colorClassName}`}
        aria-current={ariaCurrent}
      >
        {children}
      </a>
    );
  }
  
  return (
    <span
      className={`${baseClassName} ${colorClassName}`}
      aria-current={ariaCurrent}
    >
      {children}
    </span>
  );
}

interface BreadcrumbsProps {
  children: React.ReactNode;
  className?: string;
  separator?: React.ReactNode;
  "aria-label"?: string;
}

export function Breadcrumbs({
  children,
  className = "",
  separator = "/",
  "aria-label": ariaLabel = "Breadcrumbs",
}: BreadcrumbsProps) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <nav
      className={`flex ${className}`}
      aria-label={ariaLabel}
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {childrenArray.map((child, index) => {
          const isLast = index === childrenArray.length - 1;

          if (!React.isValidElement(child)) {
            return null;
          }

          // Explicitly cast the child to the correct type
          const childWithProps = React.cloneElement(
            child as React.ReactElement<BreadcrumbItemProps>, 
            { 
              isLast,
              "aria-current": isLast ? "page" : undefined,
            }
          );

          return (
            <li key={index} className="inline-flex items-center">
              {childWithProps}
              {!isLast && (
                <span className="mx-1 md:mx-2 text-gray-400 dark:text-gray-600">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface BreadcrumbHomeItemProps {
  href?: string;
  className?: string;
  "aria-current"?: BreadcrumbAriaCurrentType;
  isLast?: boolean;
}

export function BreadcrumbHomeItem({
  href = "/",
  className = "",
  "aria-current": ariaCurrent,
  isLast = false,
}: BreadcrumbHomeItemProps) {
  return (
    <BreadcrumbItem 
      href={href} 
      className={className} 
      aria-current={ariaCurrent}
      isLast={isLast}
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
        />
      </svg>
    </BreadcrumbItem>
  );
}

interface BreadcrumbEllipsisProps {
  className?: string;
  isLast?: boolean;
  "aria-current"?: BreadcrumbAriaCurrentType;
}

export function BreadcrumbEllipsis({ 
  className = "",
  isLast = false,
  "aria-current": ariaCurrent,
}: BreadcrumbEllipsisProps) {
  return (
    <BreadcrumbItem
      className={className}
      isLast={isLast}
      aria-current={ariaCurrent}
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </BreadcrumbItem>
  );
} 