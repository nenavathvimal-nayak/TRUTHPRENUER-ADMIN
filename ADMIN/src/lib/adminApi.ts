/**
 * Truthprenuer Privileged Admin API Client
 * Interfaces directly with the local-only administrative backend at 127.0.0.1:60136
 */

const ADMIN_API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:60136';

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_id: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface ModerationReport {
  id: string;
  target_id: string;
  target_type: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reporter_id: string;
  created_at: string;
  resolution_notes?: string;
}

export class AdminApiClient {
  private static getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Healthcheck for the local privileged Admin API.
   */
  static async checkHealth(): Promise<{ status: string; service: string; port: number } | null> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Suspend user via authoritative backend service.
   */
  static async suspendUser(userId: string, reason: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Failed to suspend user' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection to local Admin API failed' };
    }
  }

  /**
   * Restore user via authoritative backend service.
   */
  static async restoreUser(userId: string, reason: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/api/v1/admin/users/${userId}/restore`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Failed to restore user' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection to local Admin API failed' };
    }
  }

  /**
   * Fetch append-only audit logs.
   */
  static async getAuditLogs(limit: number = 50, offset: number = 0, token?: string): Promise<{ logs: AuditLogEntry[]; total: number } | null> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/api/v1/admin/audit-logs?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch pending or resolved moderation reports.
   */
  static async getModerationReports(status?: string, token?: string): Promise<{ reports: ModerationReport[]; total: number } | null> {
    try {
      const url = status 
        ? `${ADMIN_API_BASE}/api/v1/admin/reports?status=${encodeURIComponent(status)}`
        : `${ADMIN_API_BASE}/api/v1/admin/reports`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Resolve moderation report.
   */
  static async resolveReport(reportId: string, resolution: string, actionTaken: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/api/v1/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ resolution_notes: resolution, action_taken: actionTaken }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Failed to resolve report' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection to local Admin API failed' };
    }
  }
}
