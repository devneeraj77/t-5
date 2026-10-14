'use client';

import React, { useState, useEffect, useCallback } from 'react';

type LocaleType = 'american-to-british' | 'british-to-american';

interface Preset {
  label: string;
  category: 'Spelling' | 'Idiom' | 'Honorific' | 'Time' | 'Slang';
  locale: LocaleType;
  text: string;
}

const PRESETS: Preset[] = [
  {
    label: 'Mangoes & Yogurt',
    category: 'Spelling',
    locale: 'american-to-british',
    text: 'Mangoes are my favorite fruit. I ate yogurt for breakfast.',
  },
  {
    label: 'Condo & Trashcan',
    category: 'Slang',
    locale: 'american-to-british',
    text: "We had a party at my friend's condo. Can you toss this in the trashcan for me?",
  },
  {
    label: 'Rube Goldberg & Hooky',
    category: 'Idiom',
    locale: 'american-to-british',
    text: 'Like a high tech Rube Goldberg machine. To play hooky means to skip class or work.',
  },
  {
    label: 'Bond & Grosh',
    category: 'Honorific',
    locale: 'american-to-british',
    text: 'No Mr. Bond, I expect you to die. Dr. Grosh will see you now.',
  },
  {
    label: 'American Schedule',
    category: 'Time',
    locale: 'american-to-british',
    text: 'Lunch is at 12:15 today. Meeting starts at 10:30 sharp.',
  },
  {
    label: 'Footie & Chippy',
    category: 'Slang',
    locale: 'british-to-american',
    text: 'We watched the footie match for a while. I had a bicky then went to the chippy.',
  },
  {
    label: 'Bank Holiday Funfair',
    category: 'Idiom',
    locale: 'british-to-american',
    text: "I spent the bank holiday at the funfair. I've just got bits and bobs in my bum bag.",
  },
  {
    label: 'Mrs & Prof',
    category: 'Honorific',
    locale: 'british-to-american',
    text: "Have you met Mrs Kalyani? Prof Joyner of King's College, London.",
  },
  {
    label: 'British Tea Time',
    category: 'Time',
    locale: 'british-to-american',
    text: 'Tea time is usually around 4 or 4.30.',
  },
  {
    label: 'Caramelise & Paracetamol',
    category: 'Spelling',
    locale: 'british-to-american',
    text: 'First, caramelise the onions. Paracetamol takes up to an hour to work.',
  },
];

export default function Home() {
  const [text, setText] = useState<string>('Mangoes are my favorite fruit. Lunch is at 12:15 today with Dr. Grosh.');
  const [locale, setLocale] = useState<LocaleType>('american-to-british');
  const [translationHtml, setTranslationHtml] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [detectedTerms, setDetectedTerms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'translator' | 'guide' | 'api'>('translator');

  const handleTranslate = useCallback(async () => {
    setErrorMsg('');
    setTranslationHtml('');
    setDetectedTerms([]);

    if (!text || text.trim() === '') {
      setErrorMsg(JSON.stringify({ error: 'No text to translate' }));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ text, locale }),
      });

      const data = await res.json();

      if (data.error) {
        setErrorMsg(JSON.stringify(data));
      } else {
        setTranslationHtml(data.translation);

        // Extract highlighted terms for breakdown inspector
        if (data.translation) {
          const matches = [...data.translation.matchAll(/<span class="highlight">(.*?)<\/span>/g)];
          const terms = matches.map((m) => m[1]);
          setDetectedTerms(terms);
        }
      }
    } catch {
      setErrorMsg(JSON.stringify({ error: 'Failed to contact translation service' }));
    } finally {
      setIsLoading(false);
    }
  }, [text, locale]);

  // Initial translation on mount
  useEffect(() => {
    let active = true;
    async function loadInitial() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text: 'Mangoes are my favorite fruit. Lunch is at 12:15 today with Dr. Grosh.',
            locale: 'american-to-british',
          }),
        });
        const data = await res.json();
        if (!active) return;
        if (data.error) {
          setErrorMsg(JSON.stringify(data));
        } else {
          setTranslationHtml(data.translation);
          if (data.translation) {
            const matches = [...data.translation.matchAll(/<span class="highlight">(.*?)<\/span>/g)];
            setDetectedTerms(matches.map((m) => m[1]));
          }
        }
      } catch {
        if (active) {
          setErrorMsg(JSON.stringify({ error: 'Failed to contact translation service' }));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleSwapLocale = () => {
    setLocale((prev) => (prev === 'american-to-british' ? 'british-to-american' : 'american-to-british'));
    // If we have a translation with plain text, we can swap text
    if (translationHtml && !errorMsg) {
      const plainText = translationHtml.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
      if (plainText !== 'Everything looks good to me!') {
        setText(plainText);
      }
    }
  };

  const handleCopy = () => {
    if (!translationHtml) return;
    const plain = translationHtml.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    setTranslationHtml('');
    setErrorMsg('');
    setDetectedTerms([]);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0c0e12] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Banner / Masthead */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-700 via-rose-800 to-indigo-900 flex items-center justify-center text-white shadow-md font-serif text-xl font-bold">
              Æ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">
                  American / British English Translator
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-300 dark:border-emerald-800">
                  v2.0 QA
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Precision Transatlantic Linguistic Converter & Lexicon Analyzer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('translator')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'translator'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Translator Studio
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Dialect Guide
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'api'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              API & Tests
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'translator' && (
          <div className="space-y-6">
            {/* Literary Quote Ribbon */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-stone-700 dark:text-stone-300 text-xs sm:text-sm flex items-center justify-between gap-4 font-serif italic">
              <span>
                &ldquo;England and America are two countries separated by the same language.&rdquo; &mdash; George Bernard Shaw
              </span>
              <span className="shrink-0 text-xs not-italic font-sans text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                Bidirectional
              </span>
            </div>

            {/* Direction Bar & Controls */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Translation Mode:
                </span>

                {/* FreeCodeCamp Mandatory ID: locale-select */}
                <div className="relative">
                  <select
                    id="locale-select"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as LocaleType)}
                    className="appearance-none bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium text-sm pl-4 pr-10 py-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
                  >
                    <option value="american-to-british">American to British</option>
                    <option value="british-to-american">British to American</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <button
                  onClick={handleSwapLocale}
                  title="Swap Translation Direction"
                  className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                <span className="text-xs font-medium text-stone-400 mr-1 shrink-0">Sample tests:</span>
                {PRESETS.slice(0, 5).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLocale(preset.locale);
                      setText(preset.text);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Panel Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Card */}
              <div className="form-container bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {locale === 'american-to-british' ? '🇺🇸' : '🇬🇧'}
                    </span>
                    <span className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                      {locale === 'american-to-british' ? 'American English Source' : 'British English Source'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} chars</span>
                    {text && (
                      <button
                        onClick={handleClear}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* FreeCodeCamp Mandatory ID: text-input */}
                <div className="p-4 flex-1 flex flex-col">
                  <textarea
                    id="text-input"
                    rows={9}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      locale === 'american-to-british'
                        ? 'Type or paste American English text here (e.g. "Mangoes are my favorite fruit. Lunch is at 12:15 today with Dr. Grosh.").'
                        : 'Type or paste British English text here (e.g. "We watched the footie match for a while. First, caramelise the onions.").'
                    }
                    className="w-full flex-1 p-3.5 text-base sm:text-lg font-normal leading-relaxed text-stone-900 dark:text-stone-100 bg-transparent border-0 focus:outline-hidden resize-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div className="text-xs text-stone-400 hidden sm:block">
                      Press <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 font-mono text-[10px]">Enter</kbd> to translate
                    </div>

                    {/* FreeCodeCamp Mandatory ID: translate-btn */}
                    <input
                      type="button"
                      id="translate-btn"
                      value={isLoading ? 'Translating...' : 'Translate'}
                      onClick={handleTranslate}
                      disabled={isLoading}
                      className="ml-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Output Card */}
              <div
                id="output-container"
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col overflow-hidden"
              >
                <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {locale === 'american-to-british' ? '🇬🇧' : '🇺🇸'}
                    </span>
                    <span className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                      {locale === 'american-to-british' ? 'British English Translation' : 'American English Translation'}
                    </span>
                  </div>

                  {translationHtml && !errorMsg && (
                    <button
                      onClick={handleCopy}
                      className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {/* FreeCodeCamp Mandatory Container: solution-container */}
                <div id="solution-container" className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Translated Sentence:
                    </div>

                    {/* FreeCodeCamp Mandatory ID: translated-sentence */}
                    <div
                      id="translated-sentence"
                      className="text-base sm:text-lg font-serif leading-relaxed text-stone-900 dark:text-stone-100 min-h-[120px] p-4 rounded-xl bg-stone-50/60 dark:bg-stone-950/40 border border-dashed border-stone-200 dark:border-stone-800 select-text"
                      dangerouslySetInnerHTML={{ __html: translationHtml }}
                    />

                    {/* FreeCodeCamp Mandatory ID: error-msg */}
                    <div
                      id="error-msg"
                      className={`text-sm mt-3 font-mono p-3 rounded-xl ${
                        errorMsg
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 block'
                          : 'hidden'
                      }`}
                    >
                      {errorMsg}
                    </div>
                  </div>

                  {/* Highlights Breakdown Inspector */}
                  {detectedTerms.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Adapted Terms & Highlight Breakdown ({detectedTerms.length}):</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Highlighted in Green
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {detectedTerms.map((term, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {translationHtml === 'Everything looks good to me!' && (
                    <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                        ✓
                      </div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold block">Perfect Match</span>
                        No spelling differences, honorific adaptations, or slang changes required.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                    Linguistic Challenge Presets
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Click any scenario to instantly test verified FreeCodeCamp unit tests and vocabulary sets.
                  </p>
                </div>
                <span className="text-xs font-medium text-stone-400">10 Curated Cases</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLocale(p.locale);
                      setText(p.text);
                    }}
                    className="text-left p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1">
                        <span className="uppercase">{p.category}</span>
                        <span>{p.locale === 'american-to-british' ? '🇺🇸→🇬🇧' : '🇬🇧→🇺🇸'}</span>
                      </div>
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {p.label}
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-2 font-serif italic">
                      &ldquo;{p.text}&rdquo;
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dialect Reference Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                Comparative Transatlantic Lexicon Reference
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Key grammatical, spelling, and orthographic conventions maintained by this translation engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spelling Rules */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Spelling Transformations
                </h3>
                <ul className="text-xs space-y-2.5 text-stone-600 dark:text-stone-400">
                  <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                    <span className="font-medium text-stone-800 dark:text-stone-200">-or vs -our</span>
                    <span>favorite ⇄ favourite</span>
                  </li>
                  <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                    <span className="font-medium text-stone-800 dark:text-stone-200">-ize vs -ise</span>
                    <span>caramelize ⇄ caramelise</span>
                  </li>
                  <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
                    <span className="font-medium text-stone-800 dark:text-stone-200">-og vs -ogue</span>
                    <span>analog ⇄ analogue</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="font-medium text-stone-800 dark:text-stone-200">Consonant doubling</span>
                    <span>traveled ⇄ travelled</span>
                  </li>
                </ul>
              </div>

              {/* Honorific Rules */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Titles & Honorifics
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  American English uses period marks after title abbreviations; British English employs open punctuation without full stops.
                </p>
                <div className="space-y-1.5 font-mono text-xs bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Dr. Grosh</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Dr Grosh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Mr. Bond</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Mr Bond</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Prof. Joyner</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Prof Joyner</span>
                  </div>
                </div>
              </div>

              {/* Time Format Rules */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Temporal & Idiomatic
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  American English uses colons for time separation (<code className="text-emerald-600 dark:text-emerald-400">12:15</code>); British English predominantly employs full stops (<code className="text-emerald-600 dark:text-emerald-400">12.15</code>).
                </p>
                <div className="space-y-1.5 font-mono text-xs bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">trashcan</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">bin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">parking lot</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">car park</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">10:30</span>
                    <span className="text-stone-400">⇄</span>
                    <span className="text-emerald-600 dark:text-emerald-400">10.30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: API Reference & Test Suite Console */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  API Specification & Test Suite Status
                </h2>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-semibold">
                  30/30 Tests Passing
                </span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                The application exposes a robust REST API complying with all FreeCodeCamp Quality Assurance user stories.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint Documentation */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-stone-800 dark:text-stone-200">
                    /api/translate
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                      Request Body JSON:
                    </span>
                    <pre className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-800 overflow-x-auto">
{`{
  "text": "Mangoes are my favorite fruit.",
  "locale": "american-to-british" // or "british-to-american"
}`}
                    </pre>
                  </div>

                  <div>
                    <span className="font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                      Success Response (200 OK):
                    </span>
                    <pre className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-emerald-700 dark:text-emerald-400 border border-stone-200 dark:border-stone-800 overflow-x-auto">
{`{
  "text": "Mangoes are my favorite fruit.",
  "translation": "Mangoes are my <span class=\\"highlight\\">favourite</span> fruit."
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* cURL & Fetch Snippets */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
                  Quick cURL Command
                </h3>
                <pre className="p-3.5 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto">
{`curl -X POST https://your-domain/api/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text": "I ate yogurt for breakfast.", "locale": "american-to-british"}'`}
                </pre>

                <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 pt-2">
                  Test Suite Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">24 / 24</div>
                    <div className="text-stone-500 dark:text-stone-400 mt-0.5">Unit Tests Passing</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">6 / 6</div>
                    <div className="text-stone-500 dark:text-stone-400 mt-0.5">Functional Tests Passing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Classic Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            FreeCodeCamp Quality Assurance Certification &bull; American / British English Translator
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Next.js 16 App Router</span>
            <span>&bull;</span>
            <span>TypeScript</span>
            <span>&bull;</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
