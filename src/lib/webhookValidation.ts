// Webhook URL validation to prevent SSRF attacks

const ALLOWED_WEBHOOK_DOMAINS = [
  'hooks.zapier.com',
  'hooks.slack.com',
  'hooks.make.com',
  'webhook.site',
  'pipedream.com',
  'n8n.cloud',
  'n8n.io',
  'hstgr.cloud', // Hostinger cloud (n8n instances)
  'integromat.com',
  'api.telegram.org',
  'discord.com',
  'app.asana.com',
  'api.notion.com',
];

/**
 * Validates webhook URLs to prevent SSRF attacks
 * Blocks localhost, private IPs, and non-allowlisted domains
 */
export const isAllowedWebhookUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    const parsed = new URL(url);
    
    // Must use HTTPS for security
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Webhook URL must use HTTPS protocol' };
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (hostname === 'localhost' || hostname.startsWith('127.')) {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }
    
    // Block private IP ranges (RFC 1918)
    if (
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }
    
    // Block other special addresses
    if (
      hostname === '0.0.0.0' ||
      hostname.startsWith('169.254.') || // Link-local
      hostname.startsWith('224.') || // Multicast
      hostname.startsWith('255.') // Broadcast
    ) {
      return { valid: false, error: 'Special IP addresses are not allowed' };
    }
    
    // Check against allowlist
    const isAllowed = ALLOWED_WEBHOOK_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return { 
        valid: false, 
        error: `Domain not in allowlist. Allowed domains: ${ALLOWED_WEBHOOK_DOMAINS.join(', ')}` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validates webhook URL for storage in database
 * Use this before saving webhook configurations
 */
export const validateWebhookForStorage = (url: string | null | undefined): { valid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { valid: true }; // Empty is okay
  }
  
  return isAllowedWebhookUrl(url.trim());
};
