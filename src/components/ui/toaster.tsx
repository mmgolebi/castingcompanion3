"use client"

import { useEffect } from "react"
import { useToast } from "./use-toast"
import { X, CheckCircle, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {toasts
        .filter((toast) => toast.open !== false)
        .map(({ id, title, description, variant }) => (
          <ToastItem
            key={id}
            id={id}
            title={title}
            description={description}
            variant={variant}
            onDismiss={() => dismiss(id)}
          />
        ))}
    </div>
  )
}

function ToastItem({
  id,
  title,
  description,
  variant,
  onDismiss,
}: {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onDismiss])

  const isError = variant === "destructive"

  return (
    <div
      className={`rounded-lg border p-4 shadow-lg animate-in slide-in-from-right ${
        isError
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isError ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-semibold ${isError ? "text-red-900" : "text-green-900"}`}>
              {title}
            </div>
          )}
          {description && (
            <div className={`text-sm mt-1 ${isError ? "text-red-700" : "text-green-700"}`}>
              {description}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 rounded-md p-1 transition-colors ${
            isError 
              ? "text-red-400 hover:text-red-600 hover:bg-red-100" 
              : "text-green-400 hover:text-green-600 hover:bg-green-100"
          }`}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
