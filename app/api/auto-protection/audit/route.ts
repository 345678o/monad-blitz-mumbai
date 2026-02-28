import { NextRequest, NextResponse } from 'next/server';
import { 
  getAuditLogs,
  getAuditLogStats,
  clearAuditLogs,
  exportAuditLogs,
  generateSampleAuditLogs
} from '@/lib/autoProtectionService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const status = searchParams.get('status') as any;
    const actionFilter = searchParams.get('actionFilter') as any;

    switch (action) {
      case 'stats':
        const stats = getAuditLogStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'export':
        const exportData = exportAuditLogs(format);
        const filename = `auto-protection-audit.${format}`;
        
        return new NextResponse(exportData, {
          status: 200,
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });

      case 'generate_sample':
        const sampleLogs = generateSampleAuditLogs();
        return NextResponse.json({
          success: true,
          data: sampleLogs,
          message: `Generated ${sampleLogs.length} sample audit logs`
        });

      default:
        // Get audit logs with filters
        const filters: any = {};
        if (limit) filters.limit = limit;
        if (status) filters.status = status;
        if (actionFilter) filters.action = actionFilter;

        const logs = getAuditLogs(filters);
        
        return NextResponse.json({
          success: true,
          data: logs,
          count: logs.length
        });
    }

  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearAuditLogs();
    
    return NextResponse.json({
      success: true,
      message: 'Audit logs cleared successfully'
    });

  } catch (error) {
    console.error('Clear audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to clear audit logs' },
      { status: 500 }
    );
  }
}