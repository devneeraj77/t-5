const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

// Build reverse dictionaries
const britishToAmericanSpelling = {};
for (const [k, v] of Object.entries(americanToBritishSpelling)) {
  britishToAmericanSpelling[v] = k;
}

const britishToAmericanTitles = {};
for (const [k, v] of Object.entries(americanToBritishTitles)) {
  britishToAmericanTitles[v] = k;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class Translator {
  translate(text, locale, highlight = true) {
    if (typeof text !== 'string') return '';
    if (!text.trim()) return '';

    let working = text;
    const translations = [];

    function addReplacement(replacement) {
      const placeholder = `__REPL_${translations.length}__`;
      translations.push(replacement);
      return placeholder;
    }

    if (locale === 'american-to-british') {
      // 1. Titles (e.g. "mr." -> "Mr", "dr." -> "Dr")
      for (const [amTitle, brTitle] of Object.entries(americanToBritishTitles)) {
        const reg = new RegExp(`\\b${escapeRegex(amTitle)}(?=[\\s"',\\)\\];:]|$)`, 'gi');
        working = working.replace(reg, () => {
          const titleCap = brTitle.charAt(0).toUpperCase() + brTitle.slice(1);
          return addReplacement(titleCap);
        });
      }

      // 2. American Time (\d{1,2}:\d{2}) -> British Time (\d{1,2}.\d{2})
      const timeReg = /\b(\d{1,2}):(\d{2})\b/g;
      working = working.replace(timeReg, (match, h, m) => {
        return addReplacement(`${h}.${m}`);
      });

      // 3. Terms & Spelling (sorted by length descending so longer phrases match first)
      const terms = { ...americanOnly, ...americanToBritishSpelling };
      const sortedKeys = Object.keys(terms).sort((a, b) => b.length - a.length);

      for (const key of sortedKeys) {
        const reg = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
        working = working.replace(reg, (match) => {
          let replacement = terms[key];
          // Preserve capitalization if replacement is not already explicitly capitalized
          if (!/[A-Z]/.test(replacement)) {
            if (match[0] === match[0].toUpperCase()) {
              replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
          }
          return addReplacement(replacement);
        });
      }
    } else if (locale === 'british-to-american') {
      // 1. Titles (e.g. "mr" -> "Mr.", "dr" -> "Dr.")
      for (const [brTitle, amTitle] of Object.entries(britishToAmericanTitles)) {
        const reg = new RegExp(`\\b${escapeRegex(brTitle)}(?!\\.)(?=[\\s.,!?;:"'\\(\\)\\[\\]]|$)`, 'gi');
        working = working.replace(reg, () => {
          const titleCap = amTitle.charAt(0).toUpperCase() + amTitle.slice(1);
          return addReplacement(titleCap);
        });
      }

      // 2. British Time (\d{1,2}.\d{2}) -> American Time (\d{1,2}:\d{2})
      const timeReg = /\b(\d{1,2})\.(\d{2})\b/g;
      working = working.replace(timeReg, (match, h, m) => {
        return addReplacement(`${h}:${m}`);
      });

      // 3. Terms & Spelling (sorted by length descending so longer phrases match first)
      const terms = { ...britishOnly, ...britishToAmericanSpelling };
      const sortedKeys = Object.keys(terms).sort((a, b) => b.length - a.length);

      for (const key of sortedKeys) {
        const reg = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
        working = working.replace(reg, (match) => {
          let replacement = terms[key];
          // Preserve capitalization if replacement is not already explicitly capitalized
          if (!/[A-Z]/.test(replacement)) {
            if (match[0] === match[0].toUpperCase()) {
              replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
          }
          return addReplacement(replacement);
        });
      }
    } else {
      return null;
    }

    if (translations.length === 0) {
      return 'Everything looks good to me!';
    }

    return working.replace(/__REPL_(\d+)__/g, (_, idx) => {
      const repl = translations[Number(idx)];
      return highlight ? `<span class="highlight">${repl}</span>` : repl;
    });
  }
}

module.exports = Translator;
module.exports.default = Translator;
