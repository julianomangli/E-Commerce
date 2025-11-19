'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function Carousel({
  slides = demoSlides,
  autoPlay = false,
  interval = 5000,
  className = '',
  respectReducedMotion = true, // set false to always animate
}) {
  const slideCount = slides.length || 0;

  // Build clones: [last, ...slides, first]
  const extended = useMemo(() => {
    if (slideCount <= 1) return slides;
    return [slides[slideCount - 1], ...slides, slides[0]];
  }, [slides, slideCount]);

  // Start on the first real slide
  const [idx, setIdx] = useState(slideCount > 1 ? 1 : 0);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef(null);

  const prefersReducedOS = usePrefersReducedMotion();
  const prefersReduced = respectReducedMotion ? prefersReducedOS : false;

  // Helpers
  const realIndex = slideCount > 1 ? (idx - 1 + slideCount) % slideCount : idx; // 0..N-1
  const goToReal = (i) => setIdx(slideCount > 1 ? i + 1 : i);
  const next = () => setIdx((i) => i + 1);
  const prev = () => setIdx((i) => i - 1);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || prefersReduced || slideCount <= 1) return;
    const id = setInterval(() => setIdx((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, slideCount, prefersReduced]);

  // Track width
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => (widthRef.current = el.clientWidth));
    widthRef.current = el.clientWidth;
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Drag (pointer events)
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setIsDragging(true);
    cancelRaf();
  };
  const onPointerMove = (e) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };
  const onPointerUp = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    setIsDragging(false);
    const threshold = Math.max(50, (widthRef.current / 100) * 6); // ~6%
    if (delta <= -threshold) {
      animateSnap(-widthRef.current - delta, next);
    } else if (delta >= threshold) {
      animateSnap(widthRef.current - delta, prev);
    } else {
      animateSnap(-delta, () => setDragX(0));
    }
  };

  // After CSS transition ends, snap off clones
  const onTransitionEnd = () => {
    if (slideCount <= 1) return;
    if (idx === 0) {
      setIsJumping(true);
      setIdx(slideCount);
      requestAnimationFrame(() => setIsJumping(false));
    } else if (idx === slideCount + 1) {
      setIsJumping(true);
      setIdx(1);
      requestAnimationFrame(() => setIsJumping(false));
    }
  };

  // Animate drag snap
  const animateSnap = (distance, onDone) => {
    const duration = prefersReduced ? 0 : 200;
    if (duration === 0) {
      setDragX(0);
      onDone?.();
      return;
    }
    const start = performance.now();
    const from = dragX;
    const to = dragX + distance;

    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDragX(from + (to - from) * ease);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDragX(0);
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };
  const cancelRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const translate = useMemo(
    () => `calc(${-idx * 100}% + ${dragX}px)`,
    [idx, dragX]
  );

  return (
    <section className={`w-full select-none ${className}`} aria-roledescription="carousel">
      {/* Viewport */}
      <div
        ref={trackRef}
        className="relative overflow-hidden rounded-2xl bg-black/5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div
          className="flex touch-pan-y will-change-transform"
          style={{
            width: `${extended.length * 100}%`,
            transform: `translateX(${translate})`,
            // ✅ Only disable transition when dragging or teleporting clones
            transition: (isDragging || isJumping) ? 'none' : 'transform 300ms ease',
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((s, i) => (
            <article
              key={i}
              className="relative w-full shrink-0"
              aria-roledescription="slide"
              aria-label={`${Math.min(i + 1, slideCount)} of ${slideCount}`}
            >
              <img
                src={s.image}
                alt={s.alt || s.title || `Slide ${i + 1}`}
                className="block h-[400px] w-full object-cover object-center sm:h-[500px] lg:h-[600px]"
                draggable={false}
                style={{ objectPosition: 'center' }}
              />

              {(s.title || s.text || s.cta) && (
                <div className="pointer-events-none absolute inset-0 flex items-end">
                  <div className="w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent p-5 sm:p-8">
                    <div className="max-w-4xl text-white">
                      {s.kicker && (
                        <p className="text-xs uppercase tracking-[0.2em] opacity-80">{s.kicker}</p>
                      )}
                      {s.title && (
                        <h3 className="mt-1 text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
                          {s.title}
                        </h3>
                      )}
                      {s.text && (
                        <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">{s.text}</p>
                      )}
                      {s.cta && s.href && (
                        <div className="pointer-events-auto mt-4">
                          <a
                            href={s.href}
                            className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black shadow hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                          >
                            {s.cta}
                            <svg viewBox="0 0 20 20" fill="currentColor" className="ml-1 h-4 w-4">
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Prev/Next (on top + stop propagation) */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between p-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L13 8.586a1 1 0 010 1.414L8.707 14.293a1 1 0 01-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widening indicators */}
      <div className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-center gap-2 px-2">
        {slides.map((_, i) => {
          const active = i === realIndex;
          return (
            <button
              key={i}
              onClick={() => goToReal(i)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active ? 'true' : 'false'}
              className={[
                'h-1.5 rounded-full transition-all',
                'bg-black/25 hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50',
                active ? 'w-12 bg-black' : 'w-5',
              ].join(' ')}
            />
          );
        })}
      </div>
    </section>
  );
}

/* Hook: OS-level reduced motion */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);
    onChange();
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    } else {
      media.addListener(onChange);
      return () => media.removeListener(onChange);
    }
  }, []);
  return reduced;
}

/* Clothing-focused demo slides */
export const demoSlides = [
  {
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&h=800&q=80',
    alt: 'Modern minimalist wardrobe',
    kicker: 'New Collection',
    title: 'Minimalist Essentials',
    text: 'Curated pieces for the modern wardrobe.',
    cta: 'Shop New Arrivals',
    href: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&h=800&q=80',
    alt: 'Elegant fashion store display',
    kicker: 'Bestsellers',
    title: 'Effortless Style',
    text: 'Premium fabrics, timeless designs.',
    cta: 'View Bestsellers',
    href: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&h=800&q=80',
    alt: 'Contemporary fashion boutique',
    kicker: 'Premium',
    title: 'Elevated Basics',
    text: 'Where comfort meets sophistication.',
    cta: 'Discover Premium',
    href: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1607274693667-ebb5a44d0a51?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&h=800&q=80',
    alt: 'Stylish clothing collection',
    kicker: 'Trending',
    title: 'Modern Classics',
    text: 'Versatile pieces for every occasion.',
    cta: 'Shop Trending',
    href: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&h=800&q=80',
    alt: 'Premium retail environment',
    kicker: 'Featured',
    title: 'Curated Collection',
    text: 'Handpicked styles for discerning taste.',
    cta: 'Explore Featured',
    href: '#',
  },
];
