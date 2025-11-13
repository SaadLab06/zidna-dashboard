/**
 * Centralized webhook configuration
 * All webhook URLs are defined here for easy management
 */

export const WEBHOOK_URLS = {
  DM_REPLY: 'https://n8n.srv1048592.hstgr.cloud/webhook/dm_reply',
  GET_ALL_MESSAGES: 'https://n8n.srv1048592.hstgr.cloud/webhook/Get-allmsgs',
  COMMENT_REPLY: 'https://n8n.srv1048592.hstgr.cloud/webhook/comment_reply',
} as const;

/**
 * Rate limiter for webhook calls
 * Prevents excessive API calls
 */
class RateLimiter {
  private lastCallTime: Map<string, number> = new Map();
  private minInterval: number;

  constructor(minIntervalMs: number = 2000) {
    this.minInterval = minIntervalMs;
  }

  canCall(key: string): boolean {
    const now = Date.now();
    const lastCall = this.lastCallTime.get(key) || 0;
    
    if (now - lastCall < this.minInterval) {
      return false;
    }
    
    this.lastCallTime.set(key, now);
    return true;
  }

  getRemainingTime(key: string): number {
    const now = Date.now();
    const lastCall = this.lastCallTime.get(key) || 0;
    const remaining = this.minInterval - (now - lastCall);
    return Math.max(0, remaining);
  }
}

export const webhookRateLimiter = new RateLimiter(2000);
