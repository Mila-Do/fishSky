import * as React from "react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const variantClasses = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  secondary: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1"
};

export function Badge({
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          className={`ml-1 -mr-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 inline-flex items-center justify-center ${
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
        >
          <svg
            className="w-full h-full"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function BadgeGroup({ children, className = "" }: BadgeGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
}

interface BadgeIconProps {
  icon: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function BadgeIcon({
  icon,
  variant = "default",
  size = "md",
  className = "",
}: BadgeIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${variantClasses[variant]} ${
        size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-7 h-7"
      } ${className}`}
    >
      {icon}
    </span>
  );
}

interface BadgeCounterProps {
  count: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  max?: number;
  className?: string;
}

export function BadgeCounter({
  count,
  variant = "primary",
  size = "sm",
  max = 99,
  className = "",
}: BadgeCounterProps) {
  const displayCount = count > max ? `${max}+` : `${count}`;
  
  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} min-w-${
        size === "sm" ? "4" : size === "md" ? "5" : "6"
      } ${className}`}
    >
      {displayCount}
    </span>
  );
} 