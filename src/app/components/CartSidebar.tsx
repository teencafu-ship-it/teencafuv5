// components/CartSidebar.tsx
"use client";
import React from "react";
import { IconCart } from "./icons";
import { Product } from "./cart-context";

interface CartSidebarProps {
  isOpen: boolean;
  items: Array<Product & { qty: number }>;
  total: () => string;
  onClose: () => void;
  onRemoveItem: (id: number) => void;
}

function extractPriceValue(priceString: string): number {
  const numericString = priceString.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
}

export default function CartSidebar({ 
  isOpen, 
  items, 
  total, 
  onClose, 
  onRemoveItem 
}: CartSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed top-0 left-0 h-full w-full z-50">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-100"
      ></div>
      
      <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 translate-x-0">
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-200">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">سلة التسوق</h3>
            <p className="text-xs sm:text-sm text-gray-500">{items.length} منتج</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)]">
          {items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300">
                <IconCart className="w-full h-full" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">السلة فارغة</h4>
              <p className="text-gray-500 text-sm sm:text-base">أضف بعض المنتجات لتبدأ التسوق</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map(item => {
                const priceValue = extractPriceValue(item.price);
                const itemTotal = priceValue * item.qty;
                
                return (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-200">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.qty} × {item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="font-bold text-emerald-600 text-sm sm:text-base">
                        {itemTotal.toFixed(2)}
                        <span className="text-base sm:text-xl font-normal mr-1">د.إ</span>
                      </span>
                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 text-sm sm:text-base">المجموع</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                {total()}
                <span className="text-base sm:text-xl font-normal mr-1">د.إ</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button 
                onClick={onClose} 
                className="flex-1 w-full py-2.5 sm:py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                مواصلة التسوق
              </button>
              
              <button 
                onClick={() => (window.location.href = '/checkout')} 
                className="flex-1 w-full py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-600 transition-all text-sm sm:text-base"
              >
                إتمام الشراء
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}