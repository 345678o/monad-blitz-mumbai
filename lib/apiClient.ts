/**
 * API Client for Financial Analytics Platform
 * Provides typed interfaces for all backend API endpoints
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic API response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// API client class
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Risk Engine APIs
  risk = {
    calculate: async (params: {
      collateralValue: number;
      debtValue: number;
      assetPrice?: number;
      liquidationThreshold?: number;
    }) => {
      return this.request('/risk/calculate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    test: async () => {
      return this.request('/risk/calculate', { method: 'GET' });
    }
  };

  // Shock Simulator APIs
  shock = {
    simulate: async (params: {
      collateralValue: number;
      debtValue: number;
      liquidationThreshold?: number;
      priceDropPercent?: number;
      scenarios?: number[];
    }) => {
      return this.request('/shock/simulate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    test: async () => {
      return this.request('/shock/simulate', { method: 'GET' });
    }
  };

  // Auto-Protection APIs
  autoProtection = {
    execute: async (params: {
      currentHealthFactor: number;
      threshold: number;
      debtValue: number;
      repayPercentage: number;
      collateralValue?: number;
      liquidationThreshold?: number;
      action?: 'simulate_scenarios' | 'calculate_optimal' | 'advanced';
      config?: any;
      scenarios?: number[];
      targetHealthFactor?: number;
    }) => {
      return this.request('/auto-protection/execute', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    getAuditLogs: async (params?: {
      action?: 'stats' | 'export' | 'generate_sample';
      format?: 'json' | 'csv';
      limit?: number;
      status?: string;
      actionFilter?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }
      
      const query = searchParams.toString();
      return this.request(`/auto-protection/audit${query ? `?${query}` : ''}`);
    },

    clearAuditLogs: async () => {
      return this.request('/auto-protection/audit', { method: 'DELETE' });
    },

    test: async () => {
      return this.request('/auto-protection/execute', { method: 'GET' });
    }
  };

  // Alerts APIs
  alerts = {
    getAll: async (params?: {
      action?: 'stats' | 'unresolved' | 'by_severity' | 'generate_sample' | 'test';
      severity?: 'Low' | 'Moderate' | 'High' | 'Critical';
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value);
          }
        });
      }
      
      const query = searchParams.toString();
      return this.request(`/alerts${query ? `?${query}` : ''}`);
    },

    generate: async (params: {
      previousHealthFactor: number;
      currentHealthFactor: number;
      shockResult?: any;
      autoProtectionResult?: any;
    }) => {
      return this.request('/alerts', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    resolve: async (alertId: string) => {
      return this.request('/alerts', {
        method: 'PATCH',
        body: JSON.stringify({ alertId, action: 'resolve' })
      });
    },

    clear: async (action: 'resolved' | 'all') => {
      return this.request(`/alerts?action=${action}`, { method: 'DELETE' });
    }
  };

  // Historical Data APIs
  historical = {
    getData: async (params?: {
      action?: 'chart' | 'latest' | 'statistics' | 'export' | 'generate_sample';
      range?: '1D' | '7D' | '30D' | '90D';
      format?: 'json' | 'csv';
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value);
          }
        });
      }
      
      const query = searchParams.toString();
      return this.request(`/historical${query ? `?${query}` : ''}`);
    },

    recordSnapshot: async (params: {
      healthFactor: number;
      collateralValue: number;
      debtValue: number;
    }) => {
      return this.request('/historical', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    clear: async () => {
      return this.request('/historical', { method: 'DELETE' });
    }
  };

  // Stress Test APIs
  stressTest = {
    run: async (params: {
      healthFactor: number;
      collateralValue: number;
      debtValue: number;
      liquidationThreshold?: number;
      action?: 'custom' | 'export';
      customScenarios?: number[];
      format?: 'json' | 'csv';
    }) => {
      return this.request('/stress-test', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    getScenarios: async () => {
      return this.request('/stress-test?action=scenarios');
    },

    test: async () => {
      return this.request('/stress-test?action=test');
    }
  };

  // Currency APIs
  currency = {
    convert: async (params: {
      amount: number;
      fromCurrency: 'USD' | 'INR';
      toCurrency: 'USD' | 'INR';
      options?: any;
    }) => {
      return this.request('/currency/convert', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    getRates: async () => {
      return this.request('/currency/convert');
    }
  };

  // System APIs
  system = {
    getStatus: async () => {
      return this.request('/status');
    }
  };
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiResponse };

// Utility functions for common operations
export const apiUtils = {
  // Handle API response with error logging
  handleResponse: async <T>(
    apiCall: Promise<ApiResponse<T>>,
    errorContext?: string
  ): Promise<T | null> => {
    const response = await apiCall;
    
    if (!response.success) {
      console.error(`API Error${errorContext ? ` (${errorContext})` : ''}:`, response.error);
      return null;
    }
    
    return response.data || null;
  },

  // Batch API calls with error handling
  batchRequests: async <T>(
    requests: Promise<ApiResponse<T>>[]
  ): Promise<(T | null)[]> => {
    const responses = await Promise.allSettled(requests);
    
    return responses.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        return result.value.data || null;
      } else {
        console.error(`Batch request ${index} failed:`, 
          result.status === 'fulfilled' ? result.value.error : result.reason
        );
        return null;
      }
    });
  },

  // Retry failed requests
  retryRequest: async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> => {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await apiCall();
        if (response.success) {
          return response;
        }
        lastError = response.error;
      } catch (error) {
        lastError = error;
      }
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    
    return {
      success: false,
      error: `Request failed after ${maxRetries + 1} attempts: ${lastError}`
    };
  }
};

// Example usage in components:
/*
import { apiClient, apiUtils } from '@/lib/apiClient';

// Simple API call
const riskData = await apiUtils.handleResponse(
  apiClient.risk.calculate({
    collateralValue: 150000,
    debtValue: 85000
  }),
  'Risk calculation'
);

// Batch requests
const [alerts, historical] = await apiUtils.batchRequests([
  apiClient.alerts.getAll(),
  apiClient.historical.getData({ range: '7D' })
]);

// Retry on failure
const protectionResult = await apiUtils.retryRequest(
  () => apiClient.autoProtection.execute({
    currentHealthFactor: 1.1,
    threshold: 1.2,
    debtValue: 85000,
    repayPercentage: 20
  }),
  3
);
*/