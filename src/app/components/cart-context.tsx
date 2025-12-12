"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { trackAddToCart } from "../lib/tracking";

export type Product = {
  id: number;
  name: string;
  desc?: string;
  price: string;
  image?: string;
};

export type CartItem = Product & { qty: number };

type CartContextType = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "elegant_store_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("cart: failed to read from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("cart: failed to write to localStorage", e);
    }
  }, [items]);

  const add = (p: Product, qty: number = 1) => {
    console.debug("cart.add called", p, qty);
    setItems((prev) => {
      const found = prev.find((x) => x.id === p.id);
      if (found) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x));
      return [...prev, { ...p, qty }];
    });
    try {
      // fire tracking asynchronously (best-effort)
      void trackAddToCart(p, qty);
    } catch (e) {
      // ignore tracking failures
    }
  };

  const remove = (id: number) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(() => {
    const sum = items.reduce((s, i) => {
      const num = Number(String(i.price).replace(/[^0-9.]/g, ""));
      return s + (isNaN(num) ? 0 : num) * i.qty;
    }, 0);

    const totalFn = () => sum.toFixed(2);

    return { items, add, remove, clear, total: totalFn };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

