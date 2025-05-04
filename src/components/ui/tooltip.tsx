import * as React from "react";

type TooltipPosition = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
};

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-100 border-l-transparent border-r-transparent border-b-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-100 border-t-transparent border-b-transparent border-l-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-100 border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-100 border-t-transparent border-b-transparent border-r-transparent",
};

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 0,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShouldRender(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 200); // Transition duration
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {shouldRender && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} ${
            isVisible ? "opacity-100 visible" : "opacity-0 invisible"
          } transition-opacity duration-200 whitespace-nowrap ${className}`}
        >
          <div className="px-3 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-100 dark:text-gray-800 rounded-lg shadow-sm">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
} 