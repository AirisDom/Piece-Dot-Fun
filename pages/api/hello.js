// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  console.log(`API Health Check - ${timestamp} - User Agent: ${userAgent}`);
  
  res.status(200).json({ 
    status: 'healthy',
    timestamp,
    message: 'Piece Dot Fun API is running',
    version: '1.0.0',
    userAgent
  });
}
