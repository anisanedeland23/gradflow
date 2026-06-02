"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFocusFlight } from "@/components/FocusFlightProvider";

export default function FlyingPlaneMotivation() {
  const { showPlaneMotivation, hidePlaneMotivation } = useFocusFlight();

  // ===============================
  // STABLE HIDE FUNCTION REF
  // ===============================
  // hidePlaneMotivation dari provider bisa berubah saat timer update.
  // Kalau langsung dimasukkan ke dependency timeout,
  // timeout bisa reset terus dan toast tidak pernah hilang.
  const hidePlaneMotivationRef = useRef(hidePlaneMotivation);

  useEffect(() => {
    hidePlaneMotivationRef.current = hidePlaneMotivation;
  }, [hidePlaneMotivation]);

  // ===============================
  // AUTO HIDE TOAST
  // ===============================
  // Toast akan hilang sekitar 7 detik setelah muncul.
  useEffect(() => {
    if (!showPlaneMotivation) return;

    const timeout = setTimeout(() => {
      hidePlaneMotivationRef.current();
    }, 7000);

    return () => clearTimeout(timeout);
  }, [showPlaneMotivation]);

  return (
    <AnimatePresence>
      {showPlaneMotivation && (
        <motion.div
          className="pointer-events-none fixed right-5 top-5 z-[60] max-w-[calc(100vw-2.5rem)]"
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
        >
          <motion.div
            className="rounded-3xl border border-blue-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md"
            initial={{ boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)" }}
            animate={{ boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)" }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            <div className="flex items-start gap-3">
              {/* PLANE ICON AREA */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50">
                <motion.span
                  className="absolute text-2xl"
                  initial={{ x: -8, y: 4, rotate: -10 }}
                  animate={{
                    x: [-8, 6, -2, 8, -8],
                    y: [4, -4, 1, -3, 4],
                    rotate: [-10, 5, -2, 4, -10],
                  }}
                  transition={{
                    duration: 2.4,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  ✈️
                </motion.span>
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  Flight completed!
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Great focus. Transit time starts now.
                </p>

                {/* PROGRESS BAR */}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: 7,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
