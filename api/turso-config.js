export default function handler(req, res) {
  // Read Turso environment variables provided by Vercel integration
  const url =
    process.env.TURSO_DATABASE_URL ||
    process.env.TURSO_DB_URL ||
    process.env.VITE_TURSO_DATABASE_URL ||
    process.env.LIBSQL_URL ||
    '';

  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    process.env.TURSO_DB_AUTH_TOKEN ||
    process.env.VITE_TURSO_AUTH_TOKEN ||
    process.env.LIBSQL_AUTH_TOKEN ||
    '';

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    url: url.trim(),
    authToken: authToken.trim(),
    configured: Boolean(url.trim()),
  });
}
