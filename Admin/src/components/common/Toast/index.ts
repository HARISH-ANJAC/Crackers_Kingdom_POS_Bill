/**
 * React Hot Toast Clone for React Native
 * Works on Android & Web via react-native-web
 *
 * Usage:
 *   1. Wrap your root component with <Toaster /> once
 *   2. Call toast.*() anywhere in your app
 *
 * Example:
 *   toast.success('Order saved!')
 *   toast.error('Something went wrong')
 *   toast.loading('Saving...')
 *   toast.info('Did you know?')
 *   toast.warning('Low stock!')
 *   toast.dismiss()          // dismiss all
 *   toast.dismiss(id)        // dismiss specific
 *   toast.promise(myPromise, { loading: '...', success: '✓', error: 'Oops' })
 */

export { toast } from './ToastStore';
export { default as Toaster } from './Toaster';
export type { Toast, ToastOptions, ToastType, ToastPosition } from './types';
