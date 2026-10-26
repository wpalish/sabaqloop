// Match the local appearance preference without loading the workspace.
try {
  const theme = localStorage.getItem('sabaqloop.appearance');
  if (['light', 'dark'].includes(theme)) document.documentElement.dataset.theme = theme;
} catch {}
