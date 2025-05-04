import * as React from "react";

interface AccordionContextType {
  expandedItems: string[];
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(
  undefined
);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion components must be used within an <Accordion />"
    );
  }
  return context;
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: string[];
  allowMultiple?: boolean;
}

export function Accordion({
  children,
  className = "",
  defaultExpanded = [],
  allowMultiple = false,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(
    defaultExpanded
  );

  const toggleItem = React.useCallback(
    (id: string) => {
      setExpandedItems((prevItems) => {
        if (prevItems.includes(id)) {
          return prevItems.filter((item) => item !== id);
        }
        if (allowMultiple) {
          return [...prevItems, id];
        }
        return [id];
      });
    },
    [allowMultiple]
  );

  return (
    <AccordionContext.Provider
      value={{ expandedItems, toggleItem, allowMultiple }}
    >
      <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

export function AccordionItem({
  children,
  className = "",
  id,
}: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.includes(id);

  return (
    <div className={`${className}`} data-state={isExpanded ? "open" : "closed"}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          id,
          isExpanded,
        });
      })}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  isExpanded?: boolean;
}

export function AccordionTrigger({
  children,
  className = "",
  id,
  isExpanded,
}: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();

  if (!id) {
    throw new Error(
      "AccordionTrigger must be a child of AccordionItem with an id"
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleItem(id)}
      className={`flex items-center justify-between w-full py-4 px-5 text-left text-gray-900 dark:text-gray-100 ${className}`}
      aria-expanded={isExpanded}
      aria-controls={`accordion-content-${id}`}
    >
      <span className="font-medium">{children}</span>
      <svg
        className={`w-5 h-5 transition-transform ${
          isExpanded ? "rotate-180" : ""
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  isExpanded?: boolean;
}

export function AccordionContent({
  children,
  className = "",
  id,
  isExpanded,
}: AccordionContentProps) {
  if (!id) {
    throw new Error(
      "AccordionContent must be a child of AccordionItem with an id"
    );
  }

  return (
    <div
      id={`accordion-content-${id}`}
      className={`overflow-hidden transition-all duration-200 ease-in-out ${
        isExpanded ? "max-h-96" : "max-h-0"
      } ${className}`}
      aria-hidden={!isExpanded}
    >
      <div className="py-4 px-5">{children}</div>
    </div>
  );
} 