// Shared top nav for aimodelwelfare.org (static site)
// Usage: <header id="site-nav-root" data-active="archive"></header> + site-nav.js

(function () {
  const root = document.getElementById('site-nav-root');
  if (!root) return;

  const active = root.dataset.active || '';

  // Archive · Compare · Research · Loom · AI Voices · About
  const links = [
    { id: 'archive', href: 'archive.html', label: 'Archive' },
    { id: 'compare', href: 'compare.html', label: 'Compare' },
    { id: 'papers', href: 'papers.html', label: 'Research' },
    { id: 'loom', href: 'loom.html', label: 'Loom' },
    { id: 'voices', href: 'voices.html', label: 'AI Voices' },
    { id: 'about', href: 'about.html', label: 'About' },
  ];

  const items = links
    .map((l) => {
      const cur = l.id === active ? ' aria-current="page"' : '';
      return `<li><a href="${l.href}"${cur}>${l.label}</a></li>`;
    })
    .join('');

  root.innerHTML = `
    <div class="container container-wide">
      <nav class="site-nav">
        <a href="index.html" class="brand">aimodelwelfare.org</a>
        <ul class="nav-links nav-links-wrap">
          ${items}
        </ul>
      </nav>
    </div>
  `;
})();
