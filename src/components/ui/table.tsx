import * as React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  striped?: boolean;
  compact?: boolean;
  bordered?: boolean;
}

export function Table({
  children,
  className = "",
  hover = false,
  striped = false,
  compact = false,
  bordered = false,
  ...props
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full text-sm text-left text-gray-700 dark:text-gray-300 ${
          bordered ? "border border-gray-200 dark:border-gray-700" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({
  children,
  className = "",
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={`text-xs uppercase bg-gray-50 dark:bg-gray-800 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  selected?: boolean;
  compact?: boolean;
  dataRowIndex?: number;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
}

export function TableBody({
  children,
  className = "",
  striped = false,
  hover = false,
  ...props
}: TableBodyProps) {
  return (
    <tbody 
      className={`${className}`}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        // Type assertion to access props safely
        const childElement = child as React.ReactElement<TableRowProps>;
        return React.cloneElement(childElement, {
          striped: childElement.props.striped ?? striped,
          hover: childElement.props.hover ?? hover,
          dataRowIndex: index,
        });
      })}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  striped = false,
  hover = false,
  selected = false,
  compact = false,
  dataRowIndex,
  ...props
}: TableRowProps) {
  const isEven = typeof dataRowIndex === "number" && dataRowIndex % 2 === 0;
  
  return (
    <tr
      className={`
        ${striped && isEven ? "bg-gray-50 dark:bg-gray-800" : ""}
        ${hover ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
        ${selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
        ${compact ? "h-8" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  bordered?: boolean;
}

export function TableCell({
  children,
  className = "",
  compact = false,
  bordered = false,
  ...props
}: TableCellProps) {
  return (
    <td
      className={`
        py-4 px-6
        ${compact ? "py-2" : ""}
        ${bordered ? "border border-gray-200 dark:border-gray-700" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  bordered?: boolean;
  sortable?: boolean;
  sorted?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  children,
  className = "",
  compact = false,
  bordered = false,
  sortable = false,
  sorted = null,
  onSort,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={`
        py-3 px-6 
        ${compact ? "py-2" : ""}
        ${bordered ? "border border-gray-200 dark:border-gray-700" : ""}
        ${sortable ? "cursor-pointer select-none" : ""}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {sortable && (
          <span className="ml-1">
            {sorted === "asc" ? (
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : sorted === "desc" ? (
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 opacity-0 group-hover:opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableFooter({
  children,
  className = "",
  ...props
}: TableFooterProps) {
  return (
    <tfoot
      className={`bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </tfoot>
  );
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableCaption({
  children,
  className = "",
  ...props
}: TableCaptionProps) {
  return (
    <caption
      className={`p-5 text-sm font-medium text-left text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </caption>
  );
} 