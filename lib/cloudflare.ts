/**
 * Cloudflare DNS Management
 * Handles subdomain creation for customer instances
 */

// Lazy-load credentials to allow dotenv to load first
function getCredentials() {
  return {
    token: process.env.CLOUDFLARE_API_TOKEN || '',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || ''
  }
}

const BASE_DOMAIN = 'clawdet.com';

interface DNSRecord {
  id?: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

interface CloudflareResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result?: any;
}

/**
 * Create a subdomain DNS record pointing to a VPS IP
 * Example: createSubdomain('johndoe', '188.34.197.212')
 * Creates: johndoe.clawdet.com → 188.34.197.212
 */
export async function createSubdomain(
  username: string,
  ipAddress: string,
  proxied: boolean = true // Use Cloudflare proxy for free SSL
): Promise<{ success: boolean; subdomain?: string; error?: string }> {
  try {
    const subdomain = `${username}.${BASE_DOMAIN}`;
    
    console.log(`[Cloudflare] Creating DNS record: ${subdomain} → ${ipAddress}`);

    // Check if record already exists
    const existingRecord = await getRecord(username);
    if (existingRecord) {
      console.log(`[Cloudflare] Record already exists, updating...`);
      return await updateSubdomain(username, ipAddress, proxied);
    }

    // Create new A record
    const { token, zoneId } = getCredentials()
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'A',
          name: username, // Cloudflare automatically appends the zone domain
          content: ipAddress,
          ttl: 1, // Automatic TTL (Cloudflare-managed)
          proxied: proxied, // Enables Cloudflare proxy (SSL, DDoS protection)
        }),
      }
    );

    const data: CloudflareResponse = await response.json();

    if (!data.success) {
      console.error('[Cloudflare] DNS creation failed:', data.errors);
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Unknown Cloudflare error',
      };
    }

    console.log(`[Cloudflare] ✅ DNS record created: ${subdomain}`);
    return {
      success: true,
      subdomain: subdomain,
    };
  } catch (error) {
    console.error('[Cloudflare] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update existing subdomain to point to new IP
 */
async function updateSubdomain(
  username: string,
  ipAddress: string,
  proxied: boolean = true
): Promise<{ success: boolean; subdomain?: string; error?: string }> {
  try {
    const existingRecord = await getRecord(username);
    if (!existingRecord) {
      return { success: false, error: 'Record not found' };
    }

    const subdomain = `${username}.${BASE_DOMAIN}`;
    const { token, zoneId } = getCredentials()
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existingRecord.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'A',
          name: username,
          content: ipAddress,
          ttl: 1,
          proxied: proxied,
        }),
      }
    );

    const data: CloudflareResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Update failed',
      };
    }

    console.log(`[Cloudflare] ✅ DNS record updated: ${subdomain}`);
    return {
      success: true,
      subdomain: subdomain,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get existing DNS record for a username
 */
async function getRecord(username: string): Promise<DNSRecord | null> {
  try {
    const { token, zoneId } = getCredentials()
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${username}.${BASE_DOMAIN}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: CloudflareResponse = await response.json();

    if (data.success && data.result && data.result.length > 0) {
      return data.result[0];
    }

    return null;
  } catch (error) {
    console.error('[Cloudflare] Error fetching record:', error);
    return null;
  }
}

/**
 * Delete a subdomain DNS record
 */
export async function deleteSubdomain(username: string): Promise<{ success: boolean; error?: string }> {
  try {
    const existingRecord = await getRecord(username);
    if (!existingRecord || !existingRecord.id) {
      return { success: false, error: 'Record not found' };
    }

    const { token, zoneId } = getCredentials()
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existingRecord.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: CloudflareResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Delete failed',
      };
    }

    console.log(`[Cloudflare] ✅ DNS record deleted: ${username}.${BASE_DOMAIN}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check DNS propagation status
 * Returns true if the subdomain resolves to the expected IP
 */
export async function checkDNSPropagation(
  subdomain: string,
  expectedIP: string
): Promise<{ success: boolean; currentIP?: string; error?: string }> {
  try {
    // Use DNS over HTTPS (Google Public DNS)
    const response = await fetch(
      `https://dns.google/resolve?name=${subdomain}&type=A`
    );
    const data = await response.json();

    if (data.Answer && data.Answer.length > 0) {
      const resolvedIP = data.Answer[0].data;
      const matches = resolvedIP === expectedIP;

      return {
        success: matches,
        currentIP: resolvedIP,
      };
    }

    return {
      success: false,
      error: 'No DNS answer received',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DNS check failed',
    };
  }
}

/**
 * Wait for DNS propagation (with timeout)
 */
export async function waitForDNSPropagation(
  subdomain: string,
  expectedIP: string,
  maxAttempts: number = 12, // 12 attempts * 5s = 1 minute max
  delayMs: number = 5000
): Promise<boolean> {
  console.log(`[Cloudflare] Waiting for DNS propagation: ${subdomain} → ${expectedIP}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkDNSPropagation(subdomain, expectedIP);

    if (result.success) {
      console.log(`[Cloudflare] ✅ DNS propagated successfully in ${attempt * delayMs / 1000}s`);
      return true;
    }

    if (attempt < maxAttempts) {
      console.log(`[Cloudflare] Attempt ${attempt}/${maxAttempts}: Not propagated yet (current: ${result.currentIP}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`[Cloudflare] ⚠️  DNS propagation timeout after ${maxAttempts * delayMs / 1000}s`);
  return false;
}

// Mock mode for testing without real Cloudflare API
export const mockMode = {
  enabled: false, // Set to true to test without API calls

  async createSubdomain(username: string, ipAddress: string): Promise<{ success: boolean; subdomain?: string; error?: string }> {
    console.log(`[Cloudflare MOCK] Creating DNS: ${username}.${BASE_DOMAIN} → ${ipAddress}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return {
      success: true,
      subdomain: `${username}.${BASE_DOMAIN}`,
    };
  },

  async waitForDNSPropagation(subdomain: string, expectedIP: string): Promise<boolean> {
    console.log(`[Cloudflare MOCK] DNS propagation simulated for ${subdomain}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  },
};
