// components/EmptyState.tsx
"use client";
import React from "react";
import { IconSearch } from "./icons";

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300">
        <IconSearch className="w-full h-full" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm sm:text-base">{message}</p>
    </div>
  );
}