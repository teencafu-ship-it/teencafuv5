// components/ToastNotification.tsx
"use client";
import React from "react";

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
}

export default function ToastNotification({ message, isVisible }: ToastNotificationProps) {
  if (!isVisible || !message) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl animate-fade-in-up max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-medium text-sm sm:text-base truncate">{message}</span>
      </div>
    </div>
  );
}