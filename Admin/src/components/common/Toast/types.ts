export type ToastType = 'success' | 'error' | 'loading' | 'info' | 'warning' | 'blank';

export type ToastPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  icon?: React.ReactNode;
  style?: object;
  className?: string;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string | React.ReactNode;
  duration: number;
  position: ToastPosition;
  visible: boolean;
  createdAt: number;
  icon?: React.ReactNode;
  style?: object;
  pauseDuration?: number;
  height?: number;
}
