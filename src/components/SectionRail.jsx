import { useEffect, useState } from 'react';

function RailIcon({ name }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'identity') {
    return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M5.5 19c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5" /></svg>;
  }
  if (name === 'studio') {
    return <svg {...common}><path d="M4 18.5 8.5 14l3 2.5L19.5 8" /><path d="M16 8h3.5v3.5" /><path d="M4 5v13.5h16" /></svg>;
  }
  if (name === 'handoff') {
    return <svg {...common}><path d="M7 7h9a3 3 0 0 1 3 3v1" /><path d="m16 8 3 3 3-3" /><path d="M17 17H8a3 3 0 0 1-3-3v-1" /><path d="m8 16-3-3-3 3" /></svg>;
  }
  if (name === 'decision') {
    return <svg {...common}><path d="M5 5h14v15H5z" /><path d="M8 3h8v4H8z" /><path d="m8.5 13 2 2 5-5" /></svg>;
  }
  return <svg {...common}><path d="M5 4.5h14v15H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
}

export default function SectionRail({ items, onTop }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const updateActive = () => {
      const marker = Math.min(window.innerHeight * 0.34, 260);
      const passed = sections.filter((section) => section.getBoundingClientRect().top <= marker);
      const current = passed.at(-1) ?? sections[0];
      setActiveId((previous) => (previous === current.id ? previous : current.id));
    };

    const observer = new IntersectionObserver(updateActive, {
      rootMargin: '-12% 0px -65% 0px',
      threshold: [0, 0.25, 0.75],
    });
    sections.forEach((section) => observer.observe(section));
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [items]);

  const moveTo = (id) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    setActiveId(id);
    setOpen(false);
  };

  const currentLabel = items.find(({ id }) => id === activeId)?.label ?? '구획';

  return (
    <nav className={`section-rail${open ? ' is-open' : ''}`} aria-label="구획 바로가기">
      <button
        type="button"
        className="section-rail-toggle"
        aria-label={`구획 메뉴 ${open ? '접기' : '열기'}, 현재 ${currentLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <RailIcon name={items.find(({ id }) => id === activeId)?.icon} />
        <span>{currentLabel}</span>
        <b aria-hidden="true">{open ? '×' : '•••'}</b>
      </button>

      <div className="section-rail-items">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="section-rail-item"
            aria-current={activeId === item.id ? 'true' : undefined}
            onClick={() => moveTo(item.id)}
          >
            <RailIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="section-rail-footer">
        <button type="button" aria-label="맨 위로" onClick={onTop}>
          <span aria-hidden="true">↑</span>
          <span>맨 위로</span>
        </button>
      </div>
    </nav>
  );
}
