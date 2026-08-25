"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Delete Confirmation",
  message = "Are you sure want to delete",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Warning Icon Badge */}
        <div className="h-14 w-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50 shadow-xs">
          <Trash2 size={26} />
        </div>

        {/* Modal Header & Message */}
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Buttons (Yes / No) */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-500/20 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
