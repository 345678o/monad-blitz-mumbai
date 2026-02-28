import { NextRequest, NextResponse } from 'next/server';
import { 
  generateAlerts,
  getAllAlerts,
  getAlertsBySeverity,
  getUnresolvedAlerts,
  resolveAlert,
  clearResolvedAlerts,
  clearAllAlerts,
  getAlertStats,
  generateSampleAlerts,
  testAlertsService
} from '@/lib/alertsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const severity = searchParams.get('severity') as any;

    switch (action) {
      case 'stats':
        const stats = getAlertStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'unresolved':
        const unresolved = getUnresolvedAlerts();
        return NextResponse.json({
          success: true,
          data: unresolved,
          count: unresolved.length
        });

      case 'by_severity':
        if (!severity) {
          return NextResponse.json(
            { error: 'Severity parameter is required' },
            { status: 400 }
          );
        }
        
        const bySeverity = getAlertsBySeverity(severity);
        return NextResponse.json({
          success: true,
          data: bySeverity,
          count: bySeverity.length
        });

      case 'generate_sample':
        const sampleAlerts = generateSampleAlerts();
        return NextResponse.json({
          success: true,
          data: sampleAlerts,
          message: `Generated ${sampleAlerts.length} sample alerts`
        });

      case 'test':
        testAlertsService();
        return NextResponse.json({
          success: true,
          message: 'Alerts service test completed successfully'
        });

      default:
        // Get all alerts
        const alerts = getAllAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
          count: alerts.length
        });
    }

  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      previousHealthFactor,
      currentHealthFactor,
      shockResult,
      autoProtectionResult
    } = body;

    // Validate required inputs
    if (typeof previousHealthFactor !== 'number' || typeof currentHealthFactor !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: previousHealthFactor and currentHealthFactor must be numbers' },
        { status: 400 }
      );
    }

    // Generate alerts based on inputs
    const newAlerts = generateAlerts({
      previousHealthFactor,
      currentHealthFactor,
      shockResult,
      autoProtectionResult
    });

    return NextResponse.json({
      success: true,
      data: newAlerts,
      count: newAlerts.length,
      message: `Generated ${newAlerts.length} new alerts`
    });

  } catch (error) {
    console.error('Alert generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'resolve':
        const resolved = resolveAlert(alertId);
        if (!resolved) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Alert update error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'resolved':
        const clearedCount = clearResolvedAlerts();
        return NextResponse.json({
          success: true,
          message: `Cleared ${clearedCount} resolved alerts`
        });

      case 'all':
        clearAllAlerts();
        return NextResponse.json({
          success: true,
          message: 'All alerts cleared successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=resolved or ?action=all' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Alert deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete alerts' },
      { status: 500 }
    );
  }
}