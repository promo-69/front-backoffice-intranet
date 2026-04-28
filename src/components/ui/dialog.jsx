"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={{ display: open ? "flex" : "none" }}
      onClick={() => onOpenChange(false)}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-lg border border-border p-6 w-full max-w-lg animate-in fade-in-0 zoom-in-95",
      className,
    )}
    {...props}
  />
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left", className)}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-3 pt-4", className)} {...props} />
);

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
