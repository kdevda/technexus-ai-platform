import { NextApiRequest, NextApiResponse } from 'next';
import getRawBody from 'raw-body';

export async function middleware(
  req: NextApiRequest & { rawBody?: Buffer },
  res: NextApiResponse,
  next: () => void
) {
  if (req.method === 'POST') {
    const rawBody = await getRawBody(req);
    const strBody = rawBody.toString('utf8');
    req.rawBody = rawBody;
    req.body = strBody
      .split('&')
      .reduce((acc: Record<string, string>, curr: string) => {
        const [key, value] = curr.split('=');
        acc[decodeURIComponent(key)] = decodeURIComponent(value);
        return acc;
      }, {});
  }
  next();
} 