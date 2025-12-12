// components/LayoutSwitcher.tsx
"use client";
import React from "react";
import { IconGrid, IconList, IconCompact } from "./icons";

interface LayoutSwitcherProps {
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
}

export default function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-2xl p-1 shadow-sm">
      <button 
        title="شبكة" 
        onClick={() => onLayoutChange('grid')} 
        className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${currentLayout === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
      >
        <IconGrid className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button 
        title="قائمة" 
        onClick={() => onLayoutChange('list')} 
        className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${currentLayout === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
      >
        <IconList className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button 
        title="مدمج" 
        onClick={() => onLayoutChange('compact')} 
        className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${currentLayout === 'compact' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
      >
        <IconCompact className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}