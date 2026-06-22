"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "info" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    info: <Info className="h-5 w-5 text-violet-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
  };

  const borders = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    info: "border-violet-100 bg-violet-50 text-violet-800",
    error: "border-rose-100 bg-rose-50 text-rose-800",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex max-w-sm items-center gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-bottom-5 duration-300 ${borders[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
