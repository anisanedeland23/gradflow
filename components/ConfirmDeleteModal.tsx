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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-2xl"
            style={{
              background: "var(--gf-card)",
              borderColor: "var(--gf-border)",
              color: "var(--gf-ink)",
            }}
          >
            {/* TOP ICON */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
              style={{
                background: "var(--gf-danger-soft)",
                color: "var(--gf-danger)",
              }}
            >
              🗑
            </div>

            {/* HEADER */}
            <div className="mt-5">
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Confirm delete
              </p>

              <h2
                className="mt-2 text-2xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                {title}
              </h2>

              <p
                className="mt-2 text-sm leading-relaxed"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                {description}
              </p>
            </div>

            {/* ITEM PREVIEW */}
            {(itemName || itemDetail) && (
              <div
                className="mt-5 rounded-2xl border p-4"
                style={{
                  background: "var(--gf-danger-soft)",
                  borderColor: "var(--gf-danger)",
                }}
              >
                {itemName && (
                  <p
                    className="break-words text-sm font-semibold"
                    style={{
                      color: "var(--gf-danger)",
                    }}
                  >
                    {itemName}
                  </p>
                )}

                {itemDetail && (
                  <p
                    className="mt-1 break-words text-xs"
                    style={{
                      color: "var(--gf-danger)",
                    }}
                  >
                    {itemDetail}
                  </p>
                )}
              </div>
            )}

            {/* WARNING MESSAGE */}
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{
                background: "var(--gf-card-soft)",
                borderColor: "var(--gf-border)",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                This action cannot be undone. Please make sure this item is no
                longer needed before deleting it.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AppButton
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={onCancel}
              >
                Cancel
              </AppButton>

              <AppButton
                variant="danger"
                size="lg"
                className="w-full"
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
