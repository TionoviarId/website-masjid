import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [year, month, day] = date.split('-');

    const apiUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=-1.6101&longitude=103.6131&method=20`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`Aladhan API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}
