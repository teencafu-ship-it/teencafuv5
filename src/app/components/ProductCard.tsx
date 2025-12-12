// components/ProductCard.tsx
"use client";
import React, { useState } from "react";
import { Product } from "./cart-context";

interface ProductCardProps {
  product: Product;
  layout: string;
  onAdd: (p: Product, qty?: number) => void;
}

function getCardClass(layout: string) {
  if (layout === "grid") return "bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg sm:hover:shadow-2xl hover:-translate-y-1";
  if (layout === "list") return "bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl";
  if (layout === "compact") return "bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden flex flex-col text-xs sm:text-sm transition-all duration-300 hover:shadow-md sm:hover:shadow-lg";
  return "bg-white rounded-lg overflow-hidden";
}

function getImageWrapperClass(layout: string) {
  if (layout === "grid") return "aspect-square sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100";
  if (layout === "list") return "w-full sm:w-32 md:w-40 h-48 sm:h-32 md:h-40 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl shadow-sm sm:shadow-md";
  if (layout === "compact") return "w-full aspect-square overflow-hidden";
  return "aspect-[4/3] overflow-hidden";
}

function getBodyClass(layout: string) {
  if (layout === "grid") return "p-4 sm:p-6 flex-1 flex flex-col";
  if (layout === "list") return "flex-1 sm:pr-4";
  if (layout === "compact") return "p-2 sm:p-3 text-xs";
  return "p-4";
}

export default function ProductCard({ product, layout, onAdd }: ProductCardProps) {
  const [qty, setQty] = useState<number>(1);

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, q + delta));
  }

  function handleQtyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value || 1);
    setQty(Math.max(1, isNaN(v) ? 1 : v));
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    try {
      onAdd(product, qty);
    } catch (err) {
      console.error("ProductCard: add failed", err);
    }
  }

  // Price display (inlined where used)
  const priceDisplay = (
    <div className={`font-bold ${layout === "compact" ? "text-sm sm:text-base text-emerald-700" : "text-lg sm:text-xl md:text-2xl text-emerald-600"}`}>
      <span>{product.price}</span>
      <span className="text-base sm:text-xl font-normal mr-1">د.إ</span>
    </div>
  );

  // Quantity controls (inlined where used)
  const quantityControls = (
    <div className={`flex items-center gap-1 bg-gray-100 rounded-full ${
      layout === "compact" ? "px-2 py-1 text-xs" : "px-2 sm:px-3 py-1.5"
    } justify-center`}>
      <button 
        onClick={() => changeQty(-1)} 
        className={`flex items-center justify-center rounded-full hover:bg-white transition-colors ${
          layout === "compact" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"
        }`}
      >
        <span className="text-gray-700 font-bold">−</span>
      </button>
      <input 
        value={qty} 
        onChange={handleQtyInput} 
        className={`text-center bg-transparent outline-none font-medium ${
          layout === "compact" ? "w-6 sm:w-8 text-xs" : "w-10 sm:w-12 text-sm sm:text-base"
        }`} 
        type="number" 
        min={1} 
      />
      <button 
        onClick={() => changeQty(1)} 
        className={`flex items-center justify-center rounded-full hover:bg-white transition-colors ${
          layout === "compact" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"
        }`}
      >
        <span className="text-gray-700 font-bold">+</span>
      </button>
    </div>
  );

  const addButton = (compact = false) => (
    <button 
      onClick={handleAdd} 
      className={`rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
        compact 
          ? "px-2 sm:px-3 py-1.5 text-xs flex-1" 
          : "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base flex-1"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={`${compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 5.6A2 2 0 007 21h10a2 2 0 001.8-1.4L20 13" />
      </svg>
      <span className="whitespace-nowrap">{compact ? "أضف" : "أضف للسلة"}</span>
    </button>
  );

  if (layout === "list") {
    return (
      <div className={getCardClass(layout)}>
        <div className={getImageWrapperClass(layout)}>
          <img
            alt={product.desc}
            src={product.image}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        
        <div className={getBodyClass(layout)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base mt-1 line-clamp-2">{product.desc}</p>
            </div>
            
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
              {priceDisplay}
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {quantityControls}
                {addButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardClass(layout)}>
      <div className={getImageWrapperClass(layout)}>
        <img
          alt={product.desc}
          src={product.image}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
            layout === "compact" ? "aspect-square" : ""
          }`}
        />
      </div>
      
      <div className={getBodyClass(layout)}>
        <h3 className={`font-bold text-gray-900 ${layout === "compact" ? "text-xs sm:text-sm mb-1" : "text-base sm:text-lg mb-2"}`}>
          {product.name}
        </h3>
        
        {layout === "grid" && (
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 flex-grow line-clamp-2">{product.desc}</p>
        )}
        
        <div className="flex flex-col gap-3">
          {priceDisplay}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {quantityControls}
            {addButton(layout === "compact")}
          </div>
        </div>
      </div>
    </div>
  );
}