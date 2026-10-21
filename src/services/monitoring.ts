import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
/** No tokens, customer addresses or request bodies are sent to telemetry. */
export function reportFailure(category: 'products' | 'checkout' | 'orders' | 'ai') {
  if (__DEV__) return;
  try { recordError(getCrashlytics(), new Error(`ShopAI ${category} request failed`)); }
  catch { /* Reporting must not break a customer action. */ }
}
