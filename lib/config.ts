// Environment Configuration
export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://saswevstdrgcxgyahngf.supabase.co",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dldnN0ZHJnY3hneWFobmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTI5ODIsImV4cCI6MjA2OTQ4ODk4Mn0.Iyvr-GjCLl1jnM-LawBL13fku25miCGx_0maKW1UPSw",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // App Configuration
  app: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "NetPay",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || "netpay",
    url: process.env.EXPO_PUBLIC_APP_URL || "https://www.netpayy.ng",
  },

  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://www.netpayy.ng/api",
  },

  // Payment Gateway Configuration
  payment: {
    gatewayUrl: process.env.EXPO_PUBLIC_PAYMENT_GATEWAY_URL || "",
    gatewayKey: process.env.EXPO_PUBLIC_PAYMENT_GATEWAY_KEY || "",
  },

  // SME Plug API Configuration
  smePlug: {
    apiKey: process.env.EXPO_PUBLIC_SMEPLUG_API_KEY || "",
    baseUrl: process.env.EXPO_PUBLIC_SMEPLUG_BASE_URL || "https://smeplug.ng/api/v1",
  },

  // Deep Linking Configuration
  deepLinking: {
    baseUrl: process.env.EXPO_PUBLIC_APP_URL || "https://www.netpayy.ng",
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || "netpay",
  },

  // Feature Flags
  features: {
    biometrics: true,
    deepLinking: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: true,
  },

  // Development Configuration
  development: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  },
};

// Helper functions for environment variables
export const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return process.env[key] || defaultValue;
};

export const isProduction = (): boolean => {
  return config.development.isProduction;
};

export const isDevelopment = (): boolean => {
  return config.development.isDevelopment;
};

export const isDebugMode = (): boolean => {
  return config.development.debugMode;
};

// Validate required environment variables
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required Supabase variables
  if (!config.supabase.url || config.supabase.url === "your_supabase_project_url") {
    errors.push("EXPO_PUBLIC_SUPABASE_URL is not set or is using default value");
  }
  
  if (!config.supabase.anonKey || config.supabase.anonKey === "your_supabase_anon_key") {
    errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is not set or is using default value");
  }

  // Check app configuration
  if (!config.app.name || config.app.name === "your_app_name") {
    errors.push("EXPO_PUBLIC_APP_NAME is not set or is using default value");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Log environment configuration (only in development)
export const logEnvironmentConfig = (): void => {
  if (isDevelopment()) {
    console.log("🔧 Environment Configuration:");
    console.log("📱 App:", config.app.name, "v" + config.app.version);
    console.log("🔗 Scheme:", config.app.scheme);
    console.log("🌐 URL:", config.app.url);
    console.log("🔐 Supabase URL:", config.supabase.url ? "✅ Set" : "❌ Not Set");
    console.log("🔑 Supabase Key:", config.supabase.anonKey ? "✅ Set" : "❌ Not Set");
    console.log("🚀 Environment:", isProduction() ? "Production" : "Development");
    console.log("🐛 Debug Mode:", isDebugMode() ? "Enabled" : "Disabled");
  }
};

export default config; 