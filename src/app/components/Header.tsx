// components/Header.tsx
import { IconSearch, IconCart, IconUser } from "./icons";

interface HeaderProps {
  itemsCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCartOpen: () => void;
}

export default function Header({ 
  itemsCount, 
  searchQuery, 
  onSearchChange, 
  onCartOpen 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="teencafu" 
              className="h-10 sm:h-12 w-auto object-contain" 
            />
          </div>
          
         
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-2.5 shadow-sm w-48 md:w-64 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
            <IconSearch className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              placeholder="ابحث عن منتجات..." 
              className="pr-2 outline-none w-full text-sm placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

       

          <button 
            onClick={onCartOpen} 
            className="relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-600 transition-all duration-300"
          >
            <IconCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">السلة</span>
            <span className="absolute -top-2 -left-2 bg-white text-emerald-600 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
              {itemsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}