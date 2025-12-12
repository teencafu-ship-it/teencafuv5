// components/ProductGrid.tsx
"use client";
import React from "react";
import { Product } from "./cart-context";
import ProductCard from "./ProductCard";
interface ProductGridProps {
  products: Product[];
  layout: string;
  onAddToCart: (product: Product, quantity?: number) => void;
}


export function getContainerClass(layout: string) {
  if (layout === "grid") return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8";
  if (layout === "list") return "grid grid-cols-1 gap-4 sm:gap-6";
  if (layout === "compact") return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4";
  return "grid grid-cols-2 gap-6";
}

export default function ProductGrid({ products, layout, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className={getContainerClass(layout)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          layout={layout}
          onAdd={onAddToCart}
        />
      ))}
    </div>
  );
}