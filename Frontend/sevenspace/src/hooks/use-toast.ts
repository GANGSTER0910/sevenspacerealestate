
import { useState, useEffect, useCallback } from "react";

// Toast types
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface ToasterToast extends Toast {
  open: boolean;
}

const TOAST_TIMEOUT = 5000;

// Function to generate unique IDs for our toasts
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Our main hook
export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  // Function to dismiss a specific toast
  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    );
  }, []);

  // Function to add a new toast
  const toast = useCallback(
    ({ title, description, action, variant = "default" }: Omit<Toast, "id">) => {
      const id = generateUniqueId();

      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, action, variant, open: true },
      ]);

      return {
        id,
        dismiss: () => dismiss(id),
        update: (props: Omit<Toast, "id">) =>
          setToasts((prevToasts) =>
            prevToasts.map((t) =>
              t.id === id
                ? { ...t, ...props, open: true }
                : t
            )
          ),
      };
    },
    [dismiss]
  );

  // Auto dismiss toasts after a timeout
  useEffect(() => {
    const timeouts = toasts
      .filter((toast) => toast.open)
      .map((toast) => {
        const timeout = setTimeout(() => dismiss(toast.id), TOAST_TIMEOUT);
        return { id: toast.id, timeout };
      });

    return () => {
      timeouts.forEach(({ timeout }) => clearTimeout(timeout));
    };
  }, [toasts, dismiss]);

  // Remove toasts that are no longer open from state after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.open));
    }, 1000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return {
    toasts,
    toast,
    dismiss,
  };
}

// Export the toast function directly for simpler imports in some cases
export const toast = ({ title, description, action, variant = "default" }: Omit<Toast, "id">) => {
  const { toast } = useToast();
  return toast({ title, description, action, variant });
};
