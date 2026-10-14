# American / British English Translator

A full-stack Next.js App Router & TypeScript application that translates text between American English and British English. Developed to satisfy and exceed all requirements of the **freeCodeCamp Quality Assurance Certification** challenge.

## Features

- **Bidirectional Localization**:
  - **American to British** (`american-to-british`)
  - **British to American** (`british-to-american`)
- **Comprehensive Lexical Dictionaries**:
  - Slang & Idiomatic terms (`american-only.js` & `british-only.js`)
  - Orthographic spelling adaptations (`american-to-british-spelling.js`)
  - Honorific and title conventions (`american-to-british-titles.js` - e.g. `Dr.` vs `Dr`, `Mr.` vs `Mr`)
  - Temporal formats (e.g. `12:15` vs `12.15`)
- **Highlighting**: Translated words/phrases are wrapped in `<span class="highlight">...</span>` and styled in vibrant green.
- **Modern + Classic UI**:
  - Classic Oxford/Webster editorial style with serif typography accents and transatlantic crests.
  - Interactive direction selector and one-click quick-swap.
  - 10 pre-configured challenge presets for instant testing.
  - Live adapted terms inspector & breakdown badge pills.
  - Instant copy-to-clipboard, clear, and word/char counters.
  - Retains all required freeCodeCamp DOM IDs (`text-input`, `locale-select`, `translate-btn`, `translated-sentence`, `error-msg`).
- **Dual Server Support**:
  - Next.js App Router API (`/api/translate`) with CORS support.
  - Node/Express test server (`server.js`) for Chai HTTP functional testing and FCC runner compatibility.

## Running Tests

All 24 Unit Tests and 6 Functional Tests pass with 100% accuracy:

```bash
# Run all tests using Mocha
npm run test
```

## Running the Application

```bash
# Start Next.js development server
npm run dev

# Or create a production build and start
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## API Documentation

### `POST /api/translate`

#### Request Body
```json
{
  "text": "Mangoes are my favorite fruit.",
  "locale": "american-to-british"
}
```

#### Response (200 OK)
```json
{
  "text": "Mangoes are my favorite fruit.",
  "translation": "Mangoes are my <span class=\"highlight\">favourite</span> fruit."
}
```

#### Error Handling
- Missing fields: `{ "error": "Required field(s) missing" }`
- Empty text: `{ "error": "No text to translate" }`
- Invalid locale: `{ "error": "Invalid value for locale field" }`
- No translation required: `{ "text": "...", "translation": "Everything looks good to me!" }`
