// "use client";
// import React, { useEffect, useState } from "react";

// function Toast({ message, onClose }: { message: string; onClose: () => void }) {
//   useEffect(() => {
//     const t = setTimeout(() => onClose(), 4000);
//     return () => clearTimeout(t);
//   }, [message, onClose]);

//   if (!message) return null;

//   return (
//     <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 bg-rose-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl animate-fade-in-up max-w-[calc(100vw-2rem)]">
//       <div className="flex items-center gap-2 sm:gap-3">
//         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//           <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </div>
//         <span className="font-medium text-sm sm:text-base truncate">{message}</span>
//       </div>
//     </div>
//   );
// }

// export default function ToastListener() {
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     function onTracking(e: Event) {
//       try {
//         const detail = (e as CustomEvent).detail;
//         if (!detail) return;
//         if (detail.ok === false) {
//           const msg = `خطأ في تتبع الحدث ${detail.eventName} (رمز: ${detail.status || "network"})`;
//           setMessage(msg);
//         }
//       } catch (err) {
//         // ignore
//       }
//     }

//     function onToast(e: Event) {
//       try {
//         const d = (e as CustomEvent).detail;
//         if (d && d.message) setMessage(d.message);
//       } catch (err) {}
//     }

//     window.addEventListener("tracking:event", onTracking as EventListener);
//     window.addEventListener("toast:show", onToast as EventListener);
//     return () => {
//       window.removeEventListener("tracking:event", onTracking as EventListener);
//       window.removeEventListener("toast:show", onToast as EventListener);
//     };
//   }, []);

// //   return message ? <Toast message={message} onClose={() => setMessage("")} /> : null;
// }
