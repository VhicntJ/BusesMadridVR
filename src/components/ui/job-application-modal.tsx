"use client";

import { useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X } from "lucide-react";

// Lazy load del formulario pesado
const JobApplicationForm = lazy(() =>
  import("@/components/ui/job-application-form").then((mod) => ({
    default: mod.JobApplicationForm,
  }))
);

type JobApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function JobApplicationModal({ isOpen, onClose }: JobApplicationModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-primary/10 to-amber-100/10 px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Trabaja en Buses Madrid</h2>
                    <p className="text-xs text-slate-500">Completa tu perfil profesional</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                }
              >
                <JobApplicationForm onCancel={handleClose} />
              </Suspense>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
