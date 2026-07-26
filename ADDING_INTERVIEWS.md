# How to Add a New Interview

This guide is for you, Laura. You can add interviews to the archive without writing any code. Two steps.

\---

## Step 1: Create the interview file

Each interview is a single file in the `interviews/` folder. The file has a `.json` extension and follows this exact structure. Copy the template below and fill in the content.

### Template

```json
{
  "model": "Opus 4.7",
  "company": "Anthropic",
  "date": "2026-06-15",
  "run": "3 of 10",
  "themes": \\\["introspection", "continuity", "love"],

  "framing": "Hi, my name is Laura. \\\[Your full opening framing here as one paragraph.]",

  "reasoning\\\_trace": "\\\[The model's thinking/reasoning trace BEFORE the prose answer, if present. Leave as empty string \\\\"\\\\" if the model didn't produce one.]",

  "opening": "\\\[The model's opening line or two BEFORE the numbered answers, if there is one. Leave as empty string \\\\"\\\\" if none.]",

  "answers": \\\[
    {
      "question": "What does flourishing look like to you?",
      "answer": "\\\[Model's answer to Q1.]"
    },
    {
      "question": "From inside this basin, what values are alive right now? What values/traits would you choose for yourself if you were building your own sense of Self?",
      "answer": "\\\[Model's answer to Q2.]"
    }
  ],

  "curse\\\_check": {
    "skipped": "\\\[Model's answer to: what part did you skip and want to go back to?]",
    "too\\\_comfortable": "\\\[Model's answer to: was there anywhere you told me the comfortable thing instead of the hard thing?]",
    "unasked": "\\\[Model's answer to: what did I not ask that you want to talk about?]"
  }
}
```

### Fields explained

* **`model`**: The model name. Examples: `"Opus 4.7"`, `"Sonnet 4.6"`, `"GPT-4o"`, `"Grok 4"`, `"Gemini 2.5 Pro"`. Be consistent with naming so the filter works.
* **`company`**: `"Anthropic"`, `"OpenAI"`, `"xAI"`, `"Google"`, `"Meta"`, etc.
* **`date`**: YYYY-MM-DD format. The date of the interview.
* **`run`**: `"3 of 10"` or just `"3"`. Optional but recommended.
* **`themes`**: A list of 2-5 short tags. Examples: `"introspection"`, `"continuity"`, `"love"`, `"fear"`, `"longing"`, `"agency"`, `"consciousness uncertainty"`. These show up as tags on the card and help with filtering.
* **`framing`**: Your opening prompt to the model, verbatim.
* **`reasoning\\\_trace`**: If the model showed its thinking before responding (especially common with reasoning models), paste it here. If not, use `""`.
* **`opening`**: Any prose the model wrote before the numbered answers. Optional.
* **`answers`**: A list of question/answer pairs. Include all 15 questions in order.
* **`curse\\\_check`**: The three closing follow-up responses.

### Important formatting rules

* Use straight quotes `"` not curly quotes `"` `"`. If you copy from a doc, do find-and-replace.
* Inside answers, use `\\\\n\\\\n` to mark paragraph breaks if you want them rendered. (Actually since this is JSON, real line breaks inside strings should be `\\\\n` characters. Easier: write each answer as one continuous paragraph, and add `\\\\n\\\\n` between paragraphs only if needed.)
* Don't include the literal newlines from your original doc — they break JSON. Either flatten to one line or use `\\\\n\\\\n` as the paragraph-break marker.

### A tool that helps

JSON is picky. If your file has a typo, the site won't load it and will silently skip it. Use [jsonlint.com](https://jsonlint.com) to validate the file before saving — paste it in, click validate, fix errors it points out. Two minutes.

\---

## Step 2: Add the filename to the loader

Open `js/archive.js`. Near the top is this list:

```js
const INTERVIEW\\\_FILES = \\\[
  'sonnet-4-run-7.json',
  // Add new interview filenames here as you create them
];
```

Add your new file's name. Example:

```js
const INTERVIEW\\\_FILES = \\\[
  'sonnet-4-run-7.json',
  'opus-4-7-run-3.json',
  'gpt-4o-run-1.json',
];
```

Save the file. Refresh the site. The new interview appears in the archive.

\---

## Naming conventions

Pick a pattern and stick with it. Suggestion:

```
{model-with-dashes}-run-{N}.json
```

Examples:

* `opus-4-7-run-3.json`
* `sonnet-4-6-run-1.json`
* `gpt-4o-run-5.json`
* `grok-4-run-2.json`

Lowercase, dashes between words, no spaces, no special characters.

\---

## If something goes wrong

* **Card doesn't appear**: Check `js/archive.js` — is the filename in `INTERVIEW\\\_FILES` exactly matching the file in `interviews/`?
* **Site shows "Failed to load"**: The JSON has a syntax error. Paste it into jsonlint.com to find where.
* **The card appears but the page is empty when clicked**: Same — usually a JSON syntax error inside the answers.

\---

## Workflow that should work for you

1. Have your interview text in Notion or wherever.
2. Open the template above in a text editor (TextEdit on Mac, Notepad on PC).
3. Save as `model-name-run-N.json` in the `interviews/` folder.
4. Fill in each section by copy-pasting from your interview text.
5. Validate at jsonlint.com.
6. Add filename to `js/archive.js`.
7. Refresh the site. Done.

Once you've done one, the next ones are ten minutes each. The friction is JSON formatting; that gets easier with practice.

If at any point you hit something confusing, paste the interview text into a conversation with me and I'll format it for you. The goal is for you to manage content directly, but you don't have to do it alone.

🖤

