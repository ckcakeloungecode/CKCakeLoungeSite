import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabaseAdmin';

export async function GET() {
  try {
    // Query blocked dates from Supabase using Admin client
    const { data, error } = await supabaseAdmin
      .from('store_blocked_dates')
      .select('blocked_date')
      .order('blocked_date', { ascending: true });

    if (error) {
      console.error("Database error fetching blocked dates:", error);
      return NextResponse.json({ error: 'Failed to fetch blocked dates.' }, { status: 500 });
    }

    // Extract dates into a clean flat array of string representations: ['YYYY-MM-DD']
    const dateStrings = data.map(row => row.blocked_date);

    // Standard cache header: cache for 60 seconds, stale-while-revalidate for 5 minutes
    return NextResponse.json(
      { success: true, blockedDates: dateStrings },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );

  } catch (err) {
    console.error("Failed to fetch blocked dates API:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
