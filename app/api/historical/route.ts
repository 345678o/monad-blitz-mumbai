import { NextRequest, NextResponse } from 'next/server';
import { 
  recordSnapshot,
  getHistoricalData,
  getChartData,
  getLatestSnapshot,
  getHistoricalStats,
  exportHistoricalData,
  generateSampleHistoricalData,
  clearHistoricalData
} from '@/lib/historicalTrackingService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const range = searchParams.get('range') as '1D' | '7D' | '30D' | '90D' || '7D';
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';

    switch (action) {
      case 'chart':
        const chartData = getChartData(range);
        return NextResponse.json({
          success: true,
          data: chartData,
          range,
          count: chartData.length
        });

      case 'latest':
        const latest = getLatestSnapshot();
        return NextResponse.json({
          success: true,
          data: latest
        });

      case 'statistics':
        const historicalData = getHistoricalData(range);
        const stats = getHistoricalStats(range);
        return NextResponse.json({
          success: true,
          data: stats,
          range
        });

      case 'export':
        const exportData = exportHistoricalData(range, format);
        const filename = `historical-data-${range.toLowerCase()}.${format}`;
        
        return new NextResponse(exportData, {
          status: 200,
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });

      case 'generate_sample':
        const sampleData = generateSampleHistoricalData();
        return NextResponse.json({
          success: true,
          data: sampleData,
          message: `Generated ${sampleData.length} sample data points`
        });

      default:
        // Get historical data
        const data = getHistoricalData(range);
        return NextResponse.json({
          success: true,
          data,
          range,
          count: data.length
        });
    }

  } catch (error) {
    console.error('Historical data GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve historical data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { healthFactor, collateralValue, debtValue } = body;

    // Validate required inputs
    if (typeof healthFactor !== 'number' || typeof collateralValue !== 'number' || typeof debtValue !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input: healthFactor, collateralValue, and debtValue must be numbers' },
        { status: 400 }
      );
    }

    // Record snapshot
    const snapshot = recordSnapshot({
      healthFactor,
      collateralValue,
      debtValue
    });

    return NextResponse.json({
      success: true,
      data: snapshot,
      message: 'Snapshot recorded successfully'
    });

  } catch (error) {
    console.error('Historical data recording error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearHistoricalData();
    
    return NextResponse.json({
      success: true,
      message: 'Historical data cleared successfully'
    });

  } catch (error) {
    console.error('Clear historical data error:', error);
    return NextResponse.json(
      { error: 'Failed to clear historical data' },
      { status: 500 }
    );
  }
}