"use client"

import { useEffect } from "react"
import { useToast } from "./use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {toasts.map(({ id, title, description, variant }) => (
        <ToastItem
          key={id}
          id={id}
          title={title}
          description={description}
          variant={variant}
          onDismiss={dismiss}
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
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={`rounded-lg border p-4 shadow-lg animate-in slide-in-from-right ${
        variant === "destructive"
          ? "bg-red-50 border-red-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {title && (
            <div className={`font-semibold ${variant === "destructive" ? "text-red-900" : "text-gray-900"}`}>
              {title}
            </div>
          )}
          {description && (
            <div className={`text-sm mt-1 ${variant === "destructive" ? "text-red-700" : "text-gray-600"}`}>
              {description}
            </div>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className={`flex-shrink-0 rounded-md p-1 hover:bg-gray-100 ${
            variant === "destructive" ? "text-red-900 hover:bg-red-100" : "text-gray-500"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
