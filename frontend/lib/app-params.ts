// 1. Safe check for browser environment (Next.js SSR safety)
const isBrowser = typeof window !== 'undefined';

// 2. Safe storage wrapper that won't crash on the server
const storage = isBrowser ? window.localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// 3. Define the options interface for TypeScript
interface ParamOptions {
  defaultValue?: string;
  removeFromUrl?: boolean;
  storageKey?: string;
}

// 4. Clean parameter extraction
const getAppParamValue = (
  paramName: string,
  options: ParamOptions = {}
): string | null => {
  const { 
    defaultValue, 
    removeFromUrl = false, 
    // Default to a clean prefix, e.g., "app_app_id"
    storageKey = `app_${paramName}` 
  } = options;

  // If on the server, just return the default value immediately
  if (!isBrowser) {
    return defaultValue || null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);

  // If we found it in the URL and want to hide it (e.g., access tokens)
  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const newSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";
    const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  // Save and return URL param if it exists
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }

  // Fallback to local storage
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }

  // Fallback to default (Environment variable)
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }

  return null;
};

// 5. Build the params object safely
const getAppParams = () => {
  // Mechanism to easily clear the token via URL: ?clear_access_token=true
  if (isBrowser && getAppParamValue("clear_access_token") === 'true') {
    storage.removeItem('token');
  }

  return {
    // Replaced import.meta.env with Next.js process.env
    appId: getAppParamValue("app_id", { 
      defaultValue: process.env.NEXT_PUBLIC_APP_ID 
    }),
    
    token: getAppParamValue("access_token", { 
      removeFromUrl: true, 
      storageKey: 'token' // Simplify the storage key to just 'token'
    }),
    
    fromUrl: isBrowser ? window.location.href : '',
    
    appBaseUrl: getAppParamValue("app_base_url", { 
      defaultValue: process.env.NEXT_PUBLIC_APP_BASE_URL 
    }),
  };
};

export const appParams = getAppParams();