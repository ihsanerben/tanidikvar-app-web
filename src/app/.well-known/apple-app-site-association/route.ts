import { appleAssociation } from '@/lib/mobile-associations';
export const dynamic = 'force-dynamic';
export function GET() {
  const data = appleAssociation(process.env.MOBILE_APPLE_TEAM_ID, process.env.MOBILE_BUNDLE_ID);
  return Response.json(data ?? { error: 'Mobile association is not configured' }, {
    status: data ? 200 : 503,
    headers: { 'Cache-Control': data ? 'public, max-age=300' : 'no-store' },
  });
}
