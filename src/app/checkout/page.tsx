"use client";
import React, { useState } from "react";
import { CartProvider, useCart } from "../components/cart-context";
import Footer from "../components/Footer";
import { trackEventClientAndServer } from "../lib/tracking";

function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // قائمة الإمارات
  const emirates = [
    "أبوظبي",
    "دبي",
    "الشارقة",
    "عجمان",
    "أم القيوين",
    "رأس الخيمة",
    "الفجيرة"
  ];
  
  // رسوم التوصيل الثابتة
  const deliveryFee = 50;
  
  // حساب المجموع الكلي - تأكد أن total() يعيد رقمًا
  const subTotal = parseFloat(total());
  const finalTotal = subTotal + deliveryFee;
  
  // دالة لاستخراج القيمة العددية من السعر النصي
  const extractPriceValue = (priceString: string | number): number => {
    if (typeof priceString === 'number') {
      return priceString;
    }
    const numericString = String(priceString).replace(/[^\d.]/g, '');
    return parseFloat(numericString) || 0;
  };

  // دالة لحساب السعر الإجمالي للعنصر
  const calculateItemTotal = (price: string | number, qty: number): number => {
    const priceValue = extractPriceValue(price);
    return priceValue * qty;
  };

  // دالة لعرض السعر بتنسيق جميل
  const formatPrice = (price: number | string): string => {
    let priceNumber: number;
    
    if (typeof price === 'string') {
      // إزالة أي رموز غير رقمية
      const numericString = price.replace(/[^\d.]/g, '');
      priceNumber = parseFloat(numericString) || 0;
    } else {
      priceNumber = price;
    }
    
    return priceNumber.toFixed(2);
  };
  
  function validate() {
    if (!name.trim()) return "الاسم مطلوب";
    if (!phone.match(/^05\d{8}$/)) return "رقم الهاتف غير صالح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)";
    if (!emirate) return "يجب اختيار الإمارة";
    if (items.length === 0) return "سلة التسوق فارغة";
    
    return "";
  }

  function generateWhatsAppMessage() {
    const itemsList = items.map(item => {
      const itemTotal = calculateItemTotal(item.price, item.qty);
      return `- ${item.name} (${item.qty} × ${formatPrice(item.price)} د.إ) = ${formatPrice(itemTotal)} د.إ`;
    }).join('\n');
    
    return `مرحباً، أريد عمل طلب جديد:

الاسم: ${name}
رقم الهاتف: ${phone}
الإمارة: ${emirate}

تفاصيل الطلب:
${itemsList}

المجموع الفرعي: ${formatPrice(subTotal)} د.إ
رسوم التوصيل: ${formatPrice(deliveryFee)} د.إ
المجموع الكلي: ${formatPrice(finalTotal)} د.إ

شكراً!`;
  }

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  const v = validate();
  if (v) return setError(v);

  try {
    setProcessing(true);

    // جهّز بيانات الطلب (order) للإرسال للسيرفر / CAPI
    const order = {
      user_data: {
        phone,              // سيُهاجم داخل السيرفر (hash)
        first_name: name,
      },
      custom_data: {
        value: Number(formatPrice(finalTotal)), // رقم
        currency: "AED",
        contents: items.map(i => ({
          id: String(i.id),
          quantity: i.qty,
          item_price: Number(String(i.price).replace(/[^\d.]/g, "")) || 0
        })),
      },
    };

    // أرسل حدث Purchase (client pixel + server CAPI). 
    // هذا دوالتك الخلفية trackEventClientAndServer تعيد {ok,status,body}
    let capiResult = { ok: false, status: 0, body: null as any };
    try {
     const result = await trackEventClientAndServer("Purchase", order);
capiResult = result ?? { ok: false, status: 0, body: null };

      console.log("CAPI result:", capiResult);
    } catch (err) {
      console.warn("trackEvent failed:", err);
    }

    // الآن افتح واتساب في تبويب جديد (لا تغلق التبويب الحالي بسرعة لأننا نريد أن يكمل التتبع)
    const message = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/971504020220?text=${message}`, "_blank");

    setSuccess("تم إنشاء طلبك! سيتم تحويلك إلى واتساب لإكمال الطلب.");

    // إتفّق على متى تمسح السلة:
    // ننتظر تأكيد بسيط من CAPI أو نفصل بعد 2s كحل احترازي
    if (capiResult.ok) {
      // مسح فوري لو نجح CAPI
      clear();
      window.location.href = "/";
    } else {
      // إن لم نتحصل على استجابة ناجحة، انتظر قليلاً ثم تابع
      setTimeout(() => {
        clear();
        window.location.href = "/";
      }, 2000);
    }

  } catch (err) {
    console.error(err);
    setError("فشل إرسال الطلب. حاول مرة أخرى.");
  } finally {
    setProcessing(false);
  }
}


  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">إتمام عملية الشراء</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">أكمل معلومات التوصيل لتلقي طلبك في أسرع وقت</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ملخص الطلب أولاً */}
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-8">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6">
                <h2 className="text-xl font-bold text-white">ملخص طلبك</h2>
                <p className="text-emerald-100 text-sm mt-1">{items.length} منتج في سلة التسوق</p>
              </div>
              
              <div className="p-6">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">🛒</span>
                    </div>
                    <p className="text-gray-500 font-medium">السلة فارغة</p>
                  </div>
                ) : (
                  <>
                    {/* قائمة المنتجات */}
                    <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
                      {items.map((i) => {
                        const itemTotal = calculateItemTotal(i.price, i.qty);
                        return (
                          <div key={i.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600 font-bold">{i.qty}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{i.name}</div>
                                <div className="text-sm text-gray-500">وحدة: {i.price} د.إ</div>
                              </div>
                            </div>
                            <div className="font-bold text-gray-900">{formatPrice(itemTotal)} د.إ</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* تفاصيل الحساب */}
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-600">المجموع الفرعي</div>
                        <div className="font-semibold">{formatPrice(subTotal)} د.إ</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-gray-600">
                          رسوم التوصيل
                          <span className="text-xs text-gray-500 block">(ثابتة لجميع الإمارات)</span>
                        </div>
                        <div className="font-semibold">{formatPrice(deliveryFee)} د.إ</div>
                      </div>
                      
                      <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-gray-300">
                        <div className="text-gray-900">المجموع الكلي</div>
                        <div className="text-emerald-600 text-xl">
                          {formatPrice(finalTotal)} د.إ
                        </div>
                      </div>
                    </div>
                    
                   
                  </>
                )}
              </div>
            </div>
          </div>

          {/* معلومات التوصيل */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 pb-2 border-b border-gray-100">معلومات التوصيل</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">الاسم  *</label>
                        <input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="أدخل اسمك "
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">رقم الهاتف *</label>
                        <input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="05XXXXXXXX"
                          required
                          pattern="05\d{8}"
                          title="يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"
                        />
                        <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ بـ 05 ويتكون من 10 أرقام</p>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">الإمارة *</label>
                        <select 
                          value={emirate} 
                          onChange={(e) => setEmirate(e.target.value)} 
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          required
                        >
                          <option value="">اختر الإمارة</option>
                          {emirates.map((emirate) => (
                            <option key={emirate} value={emirate}>{emirate}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* معلومات التواصل */}
                 
                  
                  {/* رسائل التغذية الراجعة */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-red-600 font-bold">!</span>
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold">✓</span>
                        </div>
                        <p className="text-green-700 font-medium">{success}</p>
                      </div>
                    </div>
                  )}

                  {/* أزرار الإجراء */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-100">
                    <button 
                      disabled={processing} 
                      type="submit" 
                      className="w-full sm:flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:from-emerald-700 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري التجهيز...</span>
                        </>
                      ) : (
                        <>
                    
                          <span>إرسال الطلب  </span>
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => (window.location.href = "/")} 
                      className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      متابعة التسوق
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
    
  );
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutForm />
      <Footer />
    </CartProvider>
  );
}