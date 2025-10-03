"use client"

import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`rounded-lg border p-4 shadow-lg max-w-md ${
            variant === "destructive"
              ? "bg-red-50 border-red-200"
              : "bg-white border-gray-200"
          }`}
        >
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
      ))}
    </div>
  )
}
