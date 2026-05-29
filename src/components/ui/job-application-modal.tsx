"use client";

import { useEffect, lazy, Suspense } from "react";
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
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Solo CSS transitions */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      />

      {/* Modal - Solo CSS transitions */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 py-8">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 shadow-sm">
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
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
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
            <JobApplicationForm onCancel={onClose} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
