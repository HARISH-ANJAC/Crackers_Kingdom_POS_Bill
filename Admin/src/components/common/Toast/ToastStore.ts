import { Toast, ToastOptions, ToastPosition, ToastType } from './types';

type Listener = (toasts: Toast[]) => void;

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 2000,
  error: 4000,
  loading: Infinity,
  info: 3000,
  warning: 3500,
  blank: 2000,
};

const DEFAULT_POSITION: ToastPosition = 'top-center';

let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();
const timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

function startDismissTimer(id: string, duration: number) {
  if (duration === Infinity) return;
  const existing = timers.get(id);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    dismiss(id);
  }, duration);
  timers.set(id, timer);
}

function addToast(
  message: string | React.ReactNode,
  type: ToastType,
  opts: ToastOptions = {},
): string {
  const id = opts.id || generateId();
  const duration = opts.duration ?? DEFAULT_DURATION[type];
  const position = opts.position ?? DEFAULT_POSITION;

  // Update if same ID exists
  const existing = toasts.find(t => t.id === id);
  if (existing) {
    toasts = toasts.map(t =>
      t.id === id
        ? { ...t, message, type, duration, position, visible: true, createdAt: Date.now() }
        : t,
    );
  } else {
    const toast: Toast = {
      id,
      type,
      message,
      duration,
      position,
      visible: true,
      createdAt: Date.now(),
      icon: opts.icon,
      style: opts.style,
    };
    toasts = [...toasts, toast];
  }

  notify();
  startDismissTimer(id, duration);
  return id;
}

export function dismiss(id?: string) {
  if (id) {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    // Mark as invisible first for animation, then remove
    toasts = toasts.map(t => (t.id === id ? { ...t, visible: false } : t));
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 350); // wait for exit animation
  } else {
    // Dismiss all
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    toasts = toasts.map(t => ({ ...t, visible: false }));
    notify();
    setTimeout(() => {
      toasts = [];
      notify();
    }, 350);
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

function toast(message: string | React.ReactNode, opts?: ToastOptions): string {
  return addToast(message, opts?.type ?? 'blank', opts);
}

toast.success = (message: string | React.ReactNode, opts?: ToastOptions): string =>
  addToast(message, 'success', opts);

toast.error = (message: string | React.ReactNode, opts?: ToastOptions): string =>
  addToast(message, 'error', opts);

toast.loading = (message: string | React.ReactNode, opts?: ToastOptions): string =>
  addToast(message, 'loading', opts);

toast.info = (message: string | React.ReactNode, opts?: ToastOptions): string =>
  addToast(message, 'info', opts);

toast.warning = (message: string | React.ReactNode, opts?: ToastOptions): string =>
  addToast(message, 'warning', opts);

toast.dismiss = dismiss;

toast.promise = <T,>(
  promise: Promise<T>,
  msgs: {
    loading: string | React.ReactNode;
    success: string | React.ReactNode | ((data: T) => string | React.ReactNode);
    error: string | React.ReactNode | ((err: any) => string | React.ReactNode);
  },
  opts?: ToastOptions,
): Promise<T> => {
  const id = addToast(msgs.loading, 'loading', { ...opts });
  promise
    .then(data => {
      const msg = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      addToast(msg, 'success', { ...opts, id });
    })
    .catch(err => {
      const msg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      addToast(msg, 'error', { ...opts, id });
    });
  return promise;
};

export { toast };
