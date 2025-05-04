import * as React from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  fallback?: React.ReactNode;
}

export function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  className = "",
  fallback,
}: AvatarProps) {
  const [error, setError] = React.useState(false);
  
  const sizeClass = sizeClasses[size];
  
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const bgColors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  
  const getBgColor = (name: string) => {
    if (!name) return bgColors[0];
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return bgColors[charCodeSum % bgColors.length];
  };
  
  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }
    
    if (name) {
      return (
        <div
          className={`flex items-center justify-center ${sizeClass} rounded-full ${getBgColor(
            name
          )} text-white font-medium`}
          aria-label={name}
        >
          {getInitials(name)}
        </div>
      );
    }
    
    return (
      <div
        className={`flex items-center justify-center ${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}
        aria-label="Avatar"
      >
        <svg
          className="w-3/5 h-3/5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };
  
  if (!src || error) {
    return renderFallback();
  }
  
  return (
    <img
      src={src}
      alt={alt || name || "Avatar"}
      onError={() => setError(true)}
      className={`${sizeClass} rounded-full object-cover ${className}`}
    />
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  className = "",
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const excess = childrenArray.length - max;
  
  const visibleAvatars = max > 0 ? childrenArray.slice(0, max) : childrenArray;
  
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((child, index) => (
        <div
          key={index}
          className="relative inline-block border-2 border-white dark:border-gray-800 rounded-full"
        >
          {child}
        </div>
      ))}
      
      {excess > 0 && (
        <div className="relative flex items-center justify-center w-10 h-10 text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-white dark:border-gray-800">
          +{excess}
        </div>
      )}
    </div>
  );
} 