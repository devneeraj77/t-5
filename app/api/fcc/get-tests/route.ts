import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const runner = require('@/test-runner.js');

interface TestItem {
  title: string;
  context: string;
  state?: string;
  assertions?: unknown[];
}

let cachedReport: TestItem[] | null = null;

function runMochaOnce(): Promise<TestItem[]> {
  return new Promise((resolve) => {
    if (cachedReport) {
      return resolve(cachedReport);
    }
    if (runner.report) {
      cachedReport = runner.report as TestItem[];
      return resolve(cachedReport);
    }
    runner.on('done', (tests: TestItem[]) => {
      cachedReport = tests;
      resolve(tests);
    });
    try {
      runner.run();
    } catch {
      resolve([]);
    }
  });
}

function testFilter(tests: TestItem[], type?: string | null, n?: string | null): TestItem[] | TestItem {
  let out: TestItem[];
  switch (type) {
    case 'unit':
      out = tests.filter((t) => t.context && t.context.match('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(
        (t) =>
          t.context &&
          t.context.match('Functional Tests') &&
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

  const tests = await runMochaOnce();
  const filtered = testFilter(tests || [], type, n);

  return NextResponse.json(filtered, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
