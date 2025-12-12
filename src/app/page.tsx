// app/page.tsx (المكون الرئيسي المعدل)
"use client";
import React, { useState } from "react";
import Carousel from "./components/Carousel";
import { CartProvider, useCart, Product } from "./components/cart-context";
import Header from "./components/Header";
import LayoutSwitcher from "./components/LayoutSwitcher";
import ProductGrid from "./components/ProductGrid";
import CartSidebar from "./components/CartSidebar";
import ToastNotification from "./components/ToastNotification";
import Footer from "./components/Footer";
import EmptyState from "./components/EmptyState";

function StoreInner() {
  const { items, add, remove, total } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [toast, setToast] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const products: Product[] = [
     { 
       id: 1,
       name: "تين أحمر طازج",
 
       price: "100",  
       image: "images/product/redfig.jpg",
       desc: "كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!"
     },
     { 
       id: 2,
       name: "تين أصفر طازج",
      
       price: "60",  
       image: "images/product/yellowfig.jpg",
       desc: "كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!"
     },
     { 
       id: 3,
       name: "فقع علبة 400 جرام",
     
       price: "150", 
       image: "images/product/fq3.jpg",
       desc: "فقع درجة أولى — وزن 400 جرام."
     },
     { 
       id: 4,
       name: "تمر صفوي (3 كيلو)",
       
       price: "150",  
       image: "images/product/tmr_safaye.webp",
       desc: "تمر صفوي فاخر — عبوة 3 كيلو."
     },
     { 
       id: 5,
       name: "تمر جلاكسي  (3 كيلو)",
      
       price: "150", 
       image: "images/product/tmr_galaksy.webp",
       desc: "تمر جلكسي فاخر — عبوة 3 كيلو."
     },
     { 
       id: 6,
       name: "تمر شيشي (3 كيلو)",
     
       price: "150", 
       image: "images/product/tmr_shishi.webp",
       desc: "تمر شيشي فاخر — عبوة 3 كيلو."
     },
     { 
       id: 7,
       name: "تمر اخلاص (3 كيلو)",
       
       price: "150", 
       image: "images/product/tmr_ikhlas.webp",
       desc: "تمر اخلاص فاخر — عبوة 3 كيلو."
     },
     { 
       id: 8,
       name: "لوز الحبان البحريني (قريباً)",
       
       price: "300", 
       image: "images/product/lowz.jpg",
       desc: "متوفر قريباً — الطلب حسب المتوفر.",
    
     },
   ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  function handleAdd(p: Product, qty: number = 1) {
    try {
      add(p, qty);
      setCartOpen(true);
      setToast(`${p.name} أضيفت إلى السلة`);
      window.setTimeout(() => setToast(""), 2000);
    } catch (err) {
      console.error("StoreInner.handleAdd error", err);
    }
  }

  // Listen for tracking events (CAPI) and show simple feedback to the user
  React.useEffect(() => {
    function onTrackingEvent(e: Event) {
      try {
        const detail = (e as CustomEvent).detail;
        if (!detail) return;
        // show error toast when server-side tracking fails
        if (detail && detail.ok === false) {
          const msg = `حدث خطأ في تتبع الحدث ${detail.eventName} (code: ${detail.status || 'network'})`;
          setToast(msg);
          window.setTimeout(() => setToast(""), 4000);
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener("tracking:event", onTrackingEvent as EventListener);
    return () => window.removeEventListener("tracking:event", onTrackingEvent as EventListener);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 font-sans">
      <Header
        itemsCount={items.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartOpen={() => setCartOpen(true)}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
          <Carousel images={[
            { id: 'c1', title: 'القص و التوصيل في نفس اليوم', src: '/images/carousel/cru-0.jpg' },
            { id: 'c2', title: 'منتجات مختارة بعناية', src: '/images/carousel/cru-1.jpg' }
          ]} />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">أحدث المنتجات</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">القص و التوصيل في نفس اليوم</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm bg-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-gray-300 shadow-sm">
              عرض: <span className="font-bold text-emerald-600">
                {layout === 'grid' ? 'شبكة' : layout === 'list' ? 'قائمة' : 'مدمج'}
              </span>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-500">
              <span className="font-bold text-emerald-600">{filteredProducts.length}</span> منتج
            </div>
            
            <LayoutSwitcher
              currentLayout={layout}
              onLayoutChange={setLayout}
            />
          </div>
        </div>

        <ProductGrid
          products={filteredProducts}
          layout={layout}
          onAddToCart={handleAdd}
        />

        {filteredProducts.length === 0 && (
          <EmptyState
            title="لم يتم العثور على منتجات"
            message="جرب استخدام كلمات بحث مختلفة"
          />
        )}
      </main>

      <ToastNotification
        message={toast}
        isVisible={!!toast}
      />

      <CartSidebar
        isOpen={cartOpen}
        items={items}
        total={total}
        onClose={() => setCartOpen(false)}
        onRemoveItem={remove}
      />

      <Footer />
    </div>
  );
}

export default function ElegantStore() {
  return (
    <CartProvider>
      <StoreInner />
    </CartProvider>
  );
}