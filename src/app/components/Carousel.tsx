"use client";
import React, { useEffect, useRef, useState } from "react";

type Slide = { id: string; title: string; src: string };

export default function Carousel({ images = [] }: { images?: Slide[] }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const delay = 4000;

  useEffect(() => {
    if (!images || images.length === 0) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, delay);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [index, images]);

  if (!images || images.length === 0) return null;

  function prev() { setIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function next() { setIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }

  return (
    <div className="relative w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-64 sm:h-80 md:h-96">
        {images.map((img, i) => (
          <img key={img.id} src={img.src} alt={img.title} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`} />
        ))}

        <div className="absolute inset-0 flex items-end md:items-center md:justify-end p-6 md:p-12">
          <div className="bg-gradient-to-l from-black/60 to-transparent rounded p-4 md:p-6 max-w-lg text-right">
            <h3 className="text-white text-xl md:text-3xl font-bold">{images[index].title}</h3>
            <p className="text-white/90 mt-2 text-sm md:text-base">تين فاخر الطعم عسل.</p>
            
          </div>
        </div>

        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow">
          ‹
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow">
          ›
        </button>

        <div className="absolute left-6 right-6 bottom-4 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/60"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
