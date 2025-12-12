// components/CookieConsent.tsx
"use client";
import React, { useState, useEffect } from "react";
import { X, Cookie, Settings, Check, Shield } from "lucide-react";
import { initTracking } from "../lib/tracking";
import {
  loadFacebookPixel,
  fbqConsentGrant,
  fbqConsentRevoke,
} from "../lib/fb-pixel";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // read preferences once on init (client-only)
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    try {
      const raw = localStorage.getItem("cookieConsent");
      if (!raw) return DEFAULT_PREFS;
      return JSON.parse(raw) as CookiePreferences;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Helper: enable/disable tracking based on prefs
  const applyCookies = React.useCallback((prefs: CookiePreferences) => {
    // If analytics or marketing allowed -> enable tracking + facebook pixel
    if (prefs.analytics || prefs.marketing) {
      try {
        // any other tracking initialization (GA, Hotjar...) kept here
        initTracking();
      } catch {
        /* ignore errors from other trackers */
      }

      // load FB pixel script (only if you set NEXT_PUBLIC_FB_PIXEL_ID)
      const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
      if (pixelId) {
        try {
          loadFacebookPixel(pixelId);
        } catch {
          /* ignore */
        }
      }

      // tell fbq we have consent (if fbq exists or after it loads the stub will queue it)
      try {
        fbqConsentGrant();
      } catch {
        /* ignore */
      }

      console.log("Tracking enabled (analytics/marketing)");
    } else {
      // revoke pixel consent and (optionally) stop other trackers
      try {
        fbqConsentRevoke();
      } catch {
        /* ignore */
      }

      console.log("Tracking disabled (only necessary cookies)");
    }
  }, []);

  useEffect(() => {
    // if no saved consent -> show banner after delay
    const raw = localStorage.getItem("cookieConsent");
    if (!raw) {
      const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // if saved -> apply it (do not call setPreferences here, we used lazy init)
    try {
      const saved = JSON.parse(raw) as CookiePreferences;
      applyCookies(saved);
    } catch {
      // corrupted JSON -> remove and show banner (avoid setState sync inside effect)
      setTimeout(() => {
        localStorage.removeItem("cookieConsent");
        setIsVisible(true);
      }, 0);
    }
  }, [applyCookies]);

  const persistAndApply = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    applyCookies(prefs);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    persistAndApply(allAccepted);
    setIsVisible(false);
    showNotification("تم قبول جميع ملفات تعريف الارتباط");
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    persistAndApply(necessaryOnly);
    setIsVisible(false);
    showNotification("تم قبول ملفات تعريف الارتباط الضرورية فقط");
  };

  const handleSaveSettings = () => {
    persistAndApply(preferences);
    setIsVisible(false);
    setShowSettings(false);
    showNotification("تم حفظ إعدادات ملفات تعريف الارتباط");
  };

  const handleTogglePreference = (type: keyof CookiePreferences) => {
    if (type === "necessary") return;
    setPreferences((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleReset = () => {
    localStorage.removeItem("cookieConsent");
    setPreferences(DEFAULT_PREFS);
    // show banner again
    setIsVisible(true);
    setShowSettings(false);
  };

  const showNotification = (message: string) => {
    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-24 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50";
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("animate-fade-out");
      setTimeout(() => {
        if (notification.parentElement) document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const cookieTypes = [
    { id: "necessary", title: "ضرورية", description: "ملفات تعريف الارتباط الضرورية لتشغيل الموقع بشكل صحيح. لا يمكن تعطيلها.", alwaysEnabled: true },
    { id: "analytics", title: "تحليلية", description: "تساعدنا على فهم كيفية تفاعل الزوار مع الموقع لتحسين تجربة المستخدم.", enabled: preferences.analytics },
    { id: "marketing", title: "تسويقية", description: "تستخدم لتقديم إعلانات مخصصة بناءً على اهتماماتك وتفضيلاتك.", enabled: preferences.marketing },
    { id: "preferences", title: "تفضيلات", description: "تذكر إعداداتك الشخصية وتفضيلاتك على الموقع.", enabled: preferences.preferences },
  ];


  if (!isVisible && !showSettings) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isVisible || showSettings ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          if (showSettings) setShowSettings(false);
        }}
      />

      {/* Cookie Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="w-8 h-8 text-white" />
                  <div>
                    <h3 className="text-xl font-bold text-white">ملفات تعريف الارتباط</h3>
                    <p className="text-emerald-100 text-sm">نحن نحترم خصوصيتك</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                  <p className="text-gray-700 mb-4">
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. بعض ملفات تعريف
                    الارتباط ضرورية لعمل الموقع، والبعض الآخر يساعدنا على فهم كيفية تفاعلك مع الموقع.
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Shield className="w-4 h-4" />
                    <span>بياناتك محمية وآمنة. يمكنك تعديل تفضيلاتك في أي وقت.</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      قبول الكل
                    </button>

                    <button
                      onClick={handleAcceptNecessary}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      الضرورية فقط
                    </button>

                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 rounded-xl bg-white border-2 border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50 transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      تخصيص الإعدادات
                    </button>
                  </div>
                </div>

                <div className="md:w-1/3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3">ملخص التفضيلات</h4>
                    <div className="space-y-3">
                      {cookieTypes.map((type) => (
                        <div key={type.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{type.title}</span>
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center ${
                              type.id === "necessary" ||
                              preferences[type.id as keyof CookiePreferences]
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {(type.id === "necessary" ||
                              preferences[type.id as keyof CookiePreferences]) && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  بالاستمرار في استخدام هذا الموقع، فإنك توافق على سياسة ملفات تعريف الارتباط.
                  يمكنك الاطلاع على{" "}
                  <a href="/privacy" className="text-emerald-600 hover:underline">
                    سياسة الخصوصية
                  </a>{" "}
                  و{" "}
                  <a href="/cookies" className="text-emerald-600 hover:underline">
                    سياسة ملفات تعريف الارتباط
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          showSettings ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${
            showSettings ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">إعدادات ملفات تعريف الارتباط</h3>
                  <p className="text-emerald-100 text-sm">اختر التفضيلات التي تناسبك</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {cookieTypes.map((type) => (
                <div key={type.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-800">{type.title}</h4>
                      {type.alwaysEnabled && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          إجباري
                        </span>
                      )}
                    </div>

                    {!type.alwaysEnabled ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[type.id as keyof CookiePreferences]}
                          onChange={() => handleTogglePreference(type.id as keyof CookiePreferences)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    ) : (
                      <div className="w-11 h-6 bg-emerald-600 rounded-full flex items-center justify-end pr-1">
                        <div className="w-5 h-5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">{type.description}</p>

                  {type.id === "analytics" && (
                    <div className="mt-3 text-xs text-gray-500">
                      <strong>تشمل:</strong> Google Analytics, Hotjar, وغيرها من أدوات التحليل
                    </div>
                  )}

                  {type.id === "marketing" && (
                    <div className="mt-3 text-xs text-gray-500">
                      <strong>تشمل:</strong> Facebook Pixel, Google Ads, إعلانات مخصصة
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
              >
                حفظ الإعدادات
              </button>

              <button
                onClick={() => {
                  setShowSettings(false);
                  setIsVisible(true);
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                إلغاء
              </button>

              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 hover:border-red-400 transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Button (floating) */}
      <button
        onClick={() => {
          setIsVisible(false);
          setShowSettings(true);
        }}
        className="fixed bottom-4 left-4 z-30 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all group"
        title="إعدادات ملفات تعريف الارتباط"
      >
        <Cookie className="w-5 h-5 text-emerald-600 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
