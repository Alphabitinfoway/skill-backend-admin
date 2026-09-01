/**
 * Helper to extract and normalize client IP address
 */
function getClientIp(req) {
  // Check common reverse proxy headers (Cloudflare, Nginx, AWS, Vercel)
  const forwarded = req.headers['cf-connecting-ip'] ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-forwarded-for'];

  let ip = '';
  if (forwarded) {
    // 'x-forwarded-for' can contain a chain: "client, proxy1, proxy2"
    ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  } else {
    ip = req.ip || req.socket?.remoteAddress || '';
  }

  // Remove IPv4-mapped IPv6 prefix (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // Normalize IPv6 localhost
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip || '127.0.0.1';
}

module.exports = {
  getClientIp
};
