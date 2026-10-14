import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Translator = require('@/components/translator.js');

const translator = new Translator();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    let body: { text?: unknown; locale?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { text, locale } = body || {};

    if (text === undefined || locale === undefined) {
      return NextResponse.json(
        { error: 'Required field(s) missing' },
        { status: 200, headers: corsHeaders }
      );
    }

    if (text === '') {
      return NextResponse.json(
        { error: 'No text to translate' },
        { status: 200, headers: corsHeaders }
      );
    }

    if (locale !== 'american-to-british' && locale !== 'british-to-american') {
      return NextResponse.json(
        { error: 'Invalid value for locale field' },
        { status: 200, headers: corsHeaders }
      );
    }

    const translation = translator.translate(text as string, locale as string);
    return NextResponse.json(
      { text, translation },
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
