import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  return NextResponse.json(
    { headers: headersObj },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
