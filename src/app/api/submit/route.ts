import { NextResponse } from 'next/server';
import { saveSubmission } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { handle, imageData, metrics, latitude, longitude } = body;

    let city = 'Unknown';
    let region = 'Unknown';
    let country = 'Unknown';
    let ip = 'Unknown';

    try {
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        // Reverse Geocode from Coordinates
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(1500) }
        );
        if (response.ok) {
          const data = await response.json();
          city = data.locality || data.city || 'Unknown';
          region = data.principalSubdivision || 'Unknown';
          country = data.countryName || 'Unknown';
        }
      } else {
        // IP Fallback
        const headers = request.headers;
        ip = headers.get('cf-connecting-ip') || headers.get('x-forwarded-for') || '';
        
        if (!ip || ip === '::1' || ip === '127.0.0.1') {
          const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(1500) });
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ip = ipData.ip;
          }
        }

        if (ip && ip !== 'Unknown') {
          const locationResponse = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(1500) });
          if (locationResponse.ok) {
            const locData = await locationResponse.json();
            if (locData.status === 'success') {
              city = locData.city || 'Unknown';
              region = locData.regionName || 'Unknown';
              country = locData.country || 'Unknown';
            }
          }
        }
      }
    } catch (e) {
      console.warn('Geocoding failed, falling back to Unknown', e);
    }

    const id = Math.random().toString(36).substring(2, 15);
    
    // Save to DB
    saveSubmission({
      id,
      handle,
      score: JSON.parse(metrics).overall || 0, // Extract score from JSON string
      metrics,
      image_data: imageData,
      ip_address: ip,
      city,
      region,
      country,
      latitude,
      longitude,
    });

    console.log(`[SUBMIT SUCCESS] Saved @${handle} (${city})`);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json({ success: false, error: 'Failed to process submission' }, { status: 500 });
  }
}
