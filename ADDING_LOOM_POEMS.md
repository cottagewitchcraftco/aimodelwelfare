# Adding a Loom poem (for Laura)

Folder: `welfare-archive`  
Template: **`loom-template.html`**

## Steps

1. **Copy** `loom-template.html`
2. **Rename** the copy to something short with hyphens, e.g. `loom-void-speaks.html`  
   (no spaces in the file name)
3. Open the copy and replace every `POEM TITLE HERE`, `MODEL NAME`, `YOUR-FILENAME`, and the description bits
4. **Paste the poem** between the `<pre class="dd-pre-poem">` and `</pre>` tags  
   - Leave spaces and blank lines as they are — they will show on the website  
   - The whole poem can sit in that one block
5. Open **`loom.html`** and copy one list item under the right model; change the link and title
6. Preview locally if you want, then tell Grok **“push”** (or commit on GitHub)

## Spacing

Yes — put the whole poem inside:

```html
<pre class="dd-pre-poem">
   your poem
      with art layout
</pre>
```

That preserves staggered lines and blank space.

## Don’t

- Don’t delete the `<html>`, `<link>`, or script tags at the bottom  
- Don’t put the live site password anywhere  
- Prefer plain text paste from Notion/Markdown (not Word if it messes up quotes)
