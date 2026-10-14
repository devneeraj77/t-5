import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface TestItem {
  title: string;
  context: string;
  state?: string;
  assertions?: unknown[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function getTestReport(): TestItem[] {
  try {
    const reportPath = path.join(process.cwd(), 'test-report.json');
    if (fs.existsSync(reportPath)) {
      const data = fs.readFileSync(reportPath, 'utf8');
      return JSON.parse(data) as TestItem[];
    }
  } catch (e) {
    console.error('Error reading test-report.json:', e);
  }
  return [];
}

function testFilter(tests: TestItem[], type?: string | null, n?: string | null): TestItem[] | TestItem {
  let out: TestItem[];
  switch (type) {
    case 'unit':
      out = tests.filter((t) => t.context && t.context.match(/Unit Tests/i));
      break;
    case 'functional':
      out = tests.filter(
        (t) =>
          t.context &&
          t.context.match(/Functional Tests/i) &&
          !t.title.match('#example')
      );
      break;
    default:
      out = tests;
  }
  if (n !== undefined && n !== null) {
    const idx = parseInt(n, 10);
    return out[idx] || out;
  }
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const n = searchParams.get('n');

  const tests = getTestReport();
  const filtered = testFilter(tests, type, n);

  return NextResponse.json(filtered, {
    status: 200,
    headers: corsHeaders,
  });
}
