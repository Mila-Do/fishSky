import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-800 animate-in fade-in zoom-in duration-300"
      >
        {title && (
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h2 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          </div>
        )}
        
        <div className="px-4 py-3">{children}</div>
        
        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 