import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Scroll-reveal: animate sections into view.
if (typeof IntersectionObserver !== 'undefined') {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  const attach = () => {
    document.querySelectorAll('section').forEach((el) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      }
    });
  };

  // initial + on DOM changes
  setTimeout(attach, 100);
  const mo = new MutationObserver(() => setTimeout(attach, 50));
  mo.observe(document.getElementById('root')!, { childList: true, subtree: true });
}
