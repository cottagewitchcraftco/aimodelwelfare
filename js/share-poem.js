// Share helpers for Dreaming Dark poem pages
// Usage: put data-share-title and data-share-text on #dd-share
(function () {
  const root = document.getElementById('dd-share');
  if (!root) return;

  const title = root.dataset.shareTitle || document.title;
  const text = root.dataset.shareText || '';
  // Prefer canonical public URL when live; fall back to current location
  const url = root.dataset.shareUrl || window.location.href.split('?')[0].split('#')[0];

  const xBtn = root.querySelector('[data-share="x"]');
  const copyBtn = root.querySelector('[data-share="copy"]');

  if (xBtn) {
    const intent =
      'https://x.com/intent/tweet?text=' +
      encodeURIComponent(text || title) +
      '&url=' +
      encodeURIComponent(url);
    xBtn.setAttribute('href', intent);
    xBtn.setAttribute('target', '_blank');
    xBtn.setAttribute('rel', 'noopener noreferrer');
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy link';
          copyBtn.classList.remove('is-copied');
        }, 2000);
      } catch (e) {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy link';
        }, 2000);
      }
    });
  }
})();
