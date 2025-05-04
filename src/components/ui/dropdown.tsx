import * as React from "react";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  width?: "auto" | "sm" | "md" | "lg";
}

const widthClasses = {
  auto: "w-auto",
  sm: "w-48",
  md: "w-56",
  lg: "w-64",
};

export function Dropdown({
  trigger,
  children,
  className = "",
  align = "left",
  width = "md",
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  }, []);
  
  React.useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleClickOutside]);
  
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      
      {open && (
        <div
          className={`absolute z-50 mt-2 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ${
            widthClasses[width]
          } ${align === "left" ? "origin-top-left left-0" : "origin-top-right right-0"}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function DropdownItem({
  children,
  onClick,
  className = "",
  disabled = false,
  icon,
}: DropdownItemProps) {
  return (
    <button
      className={`flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownSection({
  children,
  className = "",
}: DropdownSectionProps) {
  return <div className={`py-1 ${className}`} role="none">{children}</div>;
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className = "" }: DropdownDividerProps) {
  return (
    <div
      className={`my-1 h-px bg-gray-200 dark:bg-gray-700 ${className}`}
      role="none"
    />
  );
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({
  children,
  className = "",
}: DropdownLabelProps) {
  return (
    <div
      className={`px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 ${className}`}
      role="none"
    >
      {children}
    </div>
  );
} 