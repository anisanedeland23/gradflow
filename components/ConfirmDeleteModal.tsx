"use client";

import { motion, AnimatePresence } from "framer-motion";
import AppButton from "@/components/AppButton";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  itemDetail?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  itemName,
  itemDetail,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* MODAL BOX */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 15,
            }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            {/* HEADER */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{title}</h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>

            {/* ITEM PREVIEW */}
            {(itemName || itemDetail) && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                {itemName && (
                  <p className="text-sm font-semibold text-red-700">
                    {itemName}
                  </p>
                )}

                {itemDetail && (
                  <p className="mt-1 text-xs text-red-500">{itemDetail}</p>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex gap-3">
              <AppButton
                variant="secondary"
                size="lg"
                fullWidth
                onClick={onCancel}
              >
                Cancel
              </AppButton>

              <AppButton
                variant="danger"
                size="lg"
                fullWidth
                onClick={onConfirm}
              >
                Delete
              </AppButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
