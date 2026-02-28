import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiEndpoints = {
      risk: {
        calculate: {
          endpoint: '/api/risk/calculate',
          methods: ['POST', 'GET'],
          description: 'Calculate risk metrics or run risk engine tests',
          postParams: {
            collateralValue: 'number (required)',
            debtValue: 'number (required)', 
            assetPrice: 'number (optional, default: 1)',
            liquidationThreshold: 'number (optional, default: 0.8)'
          }
        }
      },
      shock: {
        simulate: {
          endpoint: '/api/shock/simulate',
          methods: ['POST', 'GET'],
          description: 'Run shock simulations or tests',
          postParams: {
            collateralValue: 'number (required)',
            debtValue: 'number (required)',
            liquidationThreshold: 'number (optional, default: 0.8)',
            priceDropPercent: 'number (0-50, required for single scenario)',
            scenarios: 'number[] (optional, for multiple scenarios)'
          }
        }
      },
      autoProtection: {
        execute: {
          endpoint: '/api/auto-protection/execute',
          methods: ['POST', 'GET'],
          description: 'Execute auto-protection logic or run tests',
          postParams: {
            currentHealthFactor: 'number (required)',
            threshold: 'number (required)',
            debtValue: 'number (required)',
            repayPercentage: 'number (required)',
            collateralValue: 'number (optional)',
            liquidationThreshold: 'number (optional, default: 0.8)',
            action: 'string (optional: "simulate_scenarios", "calculate_optimal", "advanced")',
            config: 'AutoProtectionConfig (required for advanced action)',
            scenarios: 'number[] (required for simulate_scenarios action)'
          }
        },
        audit: {
          endpoint: '/api/auto-protection/audit',
          methods: ['GET', 'DELETE'],
          description: 'Manage audit logs',
          queryParams: {
            action: 'string (optional: "stats", "export", "generate_sample")',
            format: 'string (optional: "json", "csv")',
            limit: 'number (optional)',
            status: 'string (optional)',
            actionFilter: 'string (optional)'
          }
        }
      },
      alerts: {
        main: {
          endpoint: '/api/alerts',
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
          description: 'Manage alerts',
          getParams: {
            action: 'string (optional: "stats", "unresolved", "by_severity", "generate_sample", "test")',
            severity: 'string (required for by_severity action)'
          },
          postParams: {
            previousHealthFactor: 'number (required)',
            currentHealthFactor: 'number (required)',
            shockResult: 'ShockSimulationResult (optional)',
            autoProtectionResult: 'AutoProtectionResult (optional)'
          },
          patchParams: {
            alertId: 'string (required)',
            action: 'string (required: "resolve")'
          },
          deleteParams: {
            action: 'string (required: "resolved", "all")'
          }
        }
      },
      historical: {
        main: {
          endpoint: '/api/historical',
          methods: ['GET', 'POST', 'DELETE'],
          description: 'Manage historical data',
          getParams: {
            action: 'string (optional: "chart", "latest", "statistics", "export", "generate_sample")',
            range: 'string (optional: "1D", "7D", "30D", "90D", default: "7D")',
            format: 'string (optional: "json", "csv")'
          },
          postParams: {
            healthFactor: 'number (required)',
            collateralValue: 'number (required)',
            debtValue: 'number (required)'
          }
        }
      },
      stressTest: {
        main: {
          endpoint: '/api/stress-test',
          methods: ['GET', 'POST'],
          description: 'Run stress tests',
          getParams: {
            action: 'string (optional: "scenarios", "test")'
          },
          postParams: {
            healthFactor: 'number (required)',
            collateralValue: 'number (required)',
            debtValue: 'number (required)',
            liquidationThreshold: 'number (optional, default: 0.8)',
            action: 'string (optional: "custom", "export")',
            customScenarios: 'number[] (required for custom action)',
            format: 'string (optional: "json", "csv")'
          }
        }
      },
      currency: {
        convert: {
          endpoint: '/api/currency/convert',
          methods: ['GET', 'POST'],
          description: 'Currency conversion and exchange rates',
          postParams: {
            amount: 'number (required)',
            fromCurrency: 'string (required: "USD", "INR")',
            toCurrency: 'string (required: "USD", "INR")',
            options: 'object (optional formatting options)'
          }
        }
      }
    };

    const systemStatus = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      totalEndpoints: Object.values(apiEndpoints).reduce((acc, service) => 
        acc + Object.keys(service).length, 0
      )
    };

    return NextResponse.json({
      success: true,
      system: systemStatus,
      endpoints: apiEndpoints,
      documentation: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        authentication: 'None required for current version',
        rateLimit: 'None implemented',
        responseFormat: 'All endpoints return JSON with { success: boolean, data?: any, error?: string }'
      }
    });

  } catch (error) {
    console.error('API status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API status' },
      { status: 500 }
    );
  }
}