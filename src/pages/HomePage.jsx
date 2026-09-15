import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Slide from '../components/Slide.jsx';
import DotNav from '../components/DotNav.jsx';
import NavHint from '../components/NavHint.jsx';

// Each slide: key (unique), className (controls bg color), and content.
// `short: true` makes a slide 70dvh instead of the full 100dvh, letting the adjacent
// slide peek through the remaining 30%. `overlapPrev: true` (footer only) pulls the
// snap position back by the overlap amount so the *previous* slide's tail stays visible
// at the top instead of the peek happening forward (see computeOffsets below).
const OVERLAP_DVH = 30;

const slides = [
  {
    key: 'title',
    className: 'slide-title',
    short: true,
    content: (
      <>
        <h1>[Portfolio Owner Name] — Placeholder Title</h1>
        <p>Ad & Creative Design Portfolio</p>
      </>
    ),
  },
  {
    key: 'selected-work',
    className: 'slide-home',
    content: (
      <>
        <h2>Selected Work</h2>
        <div className="featured-image-placeholder skeleton" />
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'product-transformation-1',
    className: 'slide-product-transformation',
    content: (
      <>
        <h2>01 — Product Transformation</h2>
        <div className="featured-image-placeholder skeleton" />
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'product-transformation-2',
    className: 'slide-product-transformation',
    content: (
      <>
        <h2>01 — Product Transformation (cont.)</h2>
        <div className="gallery-grid">
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
        </div>
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'lifestyle-concepts-1',
    className: 'slide-lifestyle-concepts',
    content: (
      <>
        <h2>02 — Lifestyle Product Concepts</h2>
        <div className="gallery-grid">
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
        </div>
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'lifestyle-concepts-2',
    className: 'slide-lifestyle-concepts',
    content: (
      <>
        <h2>02 — Lifestyle Product Concepts (cont.)</h2>
        <div className="gallery-grid">
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
        </div>
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'seasonal-campaigns-1',
    className: 'slide-seasonal-campaigns',
    content: (
      <>
        <h2>Concept: Seasonal Campaigns — Holiday Collection</h2>
        <div className="gallery-grid">
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
        </div>
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'seasonal-campaigns-2',
    className: 'slide-seasonal-campaigns',
    content: (
      <>
        <h2>Concept: Seasonal Campaigns — Holiday Collection (cont.)</h2>
        <div className="gallery-grid">
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
          <div className="gallery-item-placeholder skeleton" />
        </div>
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'gift-box-transformation',
    className: 'slide-featured',
    content: (
      <>
        <h2>Gift Box Transformation</h2>
        <div className="featured-image-placeholder skeleton" />
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'workflow',
    className: 'slide-extra',
    content: (
      <>
        <h2>Workflow</h2>
        <div className="featured-image-placeholder skeleton" />
        <p>Supporting text placeholder.</p>
      </>
    ),
  },
  {
    key: 'footer',
    className: 'slide-footer',
    short: true,
    overlapPrev: true,
    content: (
      <>
        <h2>Footer — Placeholder</h2>
        <p>Contact / social links / closing note placeholder.</p>
      </>
    ),
  },
];

const TRANSITION_MS = 700;
const NAV_HIDE_DELAY_MS = 1500;
const EDGE_ZONE_PX = 48; // width from the right edge that starts a scrub gesture instead of a normal swipe
const SCRUB_TRANSITION_MS = 120; // snappier follow-the-finger duration while scrubbing
const PX_PER_SLIDE_SCRUB = 45; // how many px of drag = one slide change while scrubbing (lower = more sensitive)
const NAV_HINT_STORAGE_KEY = 'portfolio_nav_hint_seen';
const NAV_HINT_DELAY_MS = 1200; // wait a beat after load before showing the hint, so it doesn't feel like a jump-scare

// Builds the vertical offset (in dvh) the track must translate to for each slide index,
// accounting for short slides and the footer's backward overlap.
function computeOffsets(slideList) {
  const offsets = [0];
  for (let i = 1; i < slideList.length; i++) {
    const prevHeight = slideList[i - 1].short ? 70 : 100;
    let next = offsets[i - 1] + prevHeight;
    if (slideList[i].overlapPrev) next -= OVERLAP_DVH;
    offsets.push(next);
  }
  return offsets;
}

function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const offsets = useMemo(() => computeOffsets(slides), []);
  const [navVisible, setNavVisible] = useState(true);
  const [isScrubbing, setIsScrubbingState] = useState(false);
  const indexRef = useRef(0); // mirrors `index` for use inside stable event handlers (avoids re-subscribing listeners on every slide change)
  const isScrubbingRef = useRef(false);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);
  const scrubStartY = useRef(0);
  const scrubStartIndex = useRef(0);
  const touchOnNav = useRef(false); // true when the current touch sequence started on the dot-nav itself
  const navHideTimer = useRef(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const setIsScrubbing = (value) => {
    isScrubbingRef.current = value;
    setIsScrubbingState(value);
  };

  const wakeNav = () => {
    setNavVisible(true);
    if (navHideTimer.current) clearTimeout(navHideTimer.current);
    navHideTimer.current = setTimeout(() => {
      setNavVisible(false);
    }, NAV_HIDE_DELAY_MS);
  };

  // Used while the cursor/touch is actively over the nav or its hover zone —
  // shows it and cancels any pending hide, without starting a new countdown.
  const holdNavOpen = () => {
    if (navHideTimer.current) clearTimeout(navHideTimer.current);
    setNavVisible(true);
  };

  // Starts the fade-out countdown — called once the cursor actually leaves
  // the nav/hover-zone area (desktop), so it doesn't fade while you're using it.
  const scheduleNavHide = () => {
    if (navHideTimer.current) clearTimeout(navHideTimer.current);
    navHideTimer.current = setTimeout(() => {
      setNavVisible(false);
    }, NAV_HIDE_DELAY_MS);
  };

  const goTo = (nextIndex) => {
    if (isAnimating.current) return;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    isAnimating.current = true;
    setIndex(nextIndex);
    const lockDuration = prefersReducedMotion ? 50 : TRANSITION_MS;
    setTimeout(() => {
      isAnimating.current = false;
    }, lockDuration);
  };

  // Mounted once — every handler below reads index/isScrubbing via refs instead of
  // closure state, so the listeners never get torn down and re-attached mid-gesture
  // (which was happening every single index change while scrubbing).
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      wakeNav();
      if (e.deltaY > 0) goTo(indexRef.current + 1);
      else if (e.deltaY < 0) goTo(indexRef.current - 1);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        wakeNav();
        goTo(indexRef.current + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        wakeNav();
        goTo(indexRef.current - 1);
      }
      if (e.key === 'Home') {
        wakeNav();
        goTo(0);
      }
      if (e.key === 'End') {
        wakeNav();
        goTo(slides.length - 1);
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartY.current = touch.clientY;

      // If the touch started on the dot-nav (or anything inside it), let DotNav's own
      // handlers (click, stopPropagation) own this touch entirely — don't treat it as a
      // page gesture at all. This is what was swallowing dot taps before: the dots sit
      // inside the edge-scrub zone, so a tap was being hijacked as a scrub.
      if (e.target.closest && e.target.closest('.dot-nav')) {
        touchOnNav.current = true;
        return;
      }
      touchOnNav.current = false;

      if (touch.clientX >= window.innerWidth - EDGE_ZONE_PX) {
        // Started near the right edge (but not on the dots themselves) — grab the
        // scrubber instead of the normal swipe-to-navigate.
        setIsScrubbing(true);
        scrubStartY.current = touch.clientY;
        scrubStartIndex.current = indexRef.current;
        holdNavOpen();
      } else {
        wakeNav();
      }
    };

    const handleTouchMove = (e) => {
      if (touchOnNav.current) return;

      // Block the browser's own pull-to-refresh / rubber-band scroll for every touch
      // on the page — we're handling all navigation ourselves, so no native scroll
      // gesture should ever be allowed to take over mid-swipe.
      e.preventDefault();

      if (!isScrubbingRef.current) return;
      const touch = e.touches[0];
      // Scrollbar-style mapping: finger up -> earlier slide (lower index, "up" in the dot list),
      // finger down -> later slide (higher index, "down" in the dot list).
      const delta = scrubStartY.current - touch.clientY; // positive when finger has moved up
      const slideDelta = Math.round(delta / PX_PER_SLIDE_SCRUB);
      const target = Math.max(0, Math.min(slides.length - 1, scrubStartIndex.current - slideDelta));
      if (target !== indexRef.current) setIndex(target);
    };

    const handleTouchEnd = (e) => {
      if (touchOnNav.current) {
        touchOnNav.current = false;
        return;
      }

      if (isScrubbingRef.current) {
        setIsScrubbing(false);
        scheduleNavHide();
        return;
      }

      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) goTo(indexRef.current + 1);
      else goTo(indexRef.current - 1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    wakeNav();
    return () => {
      if (navHideTimer.current) clearTimeout(navHideTimer.current);
    };
  }, []);

  useEffect(() => {
    let hasSeen = false;
    try {
      hasSeen = window.localStorage.getItem(NAV_HINT_STORAGE_KEY) === 'true';
    } catch {
      // localStorage can throw in some privacy modes — just skip the hint rather than crash.
      hasSeen = true;
    }
    if (hasSeen) return;

    const timer = setTimeout(() => setShowHint(true), NAV_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try {
      window.localStorage.setItem(NAV_HINT_STORAGE_KEY, 'true');
    } catch {
      // Ignore — worst case the hint reappears next visit, not a big deal.
    }
  };

  const handleDotClick = (i) => {
    wakeNav();
    goTo(i);
  };

  return (
    <div className="slide-viewport">
      <motion.div
        className="slide-track"
        animate={{ y: `-${offsets[index]}dvh` }}
        transition={{
          duration: prefersReducedMotion ? 0.05 : (isScrubbing ? SCRUB_TRANSITION_MS : TRANSITION_MS) / 1000,
          ease: [0.65, 0, 0.35, 1],
        }}
      >
        {slides.map((slide) => (
          <Slide
            key={slide.key}
            className={`${slide.className}${slide.short ? ' slide-short' : ''}`}
          >
            {slide.content}
          </Slide>
        ))}
      </motion.div>

      <div
        className="nav-hover-zone"
        onMouseEnter={holdNavOpen}
        onMouseLeave={scheduleNavHide}
      />

      <DotNav
        count={slides.length}
        activeIndex={index}
        onDotClick={handleDotClick}
        visible={navVisible}
        onMouseEnter={holdNavOpen}
        onMouseLeave={scheduleNavHide}
        scrubbing={isScrubbing}
        transitionDuration={prefersReducedMotion ? 0.05 : (isScrubbing ? SCRUB_TRANSITION_MS : TRANSITION_MS) / 1000}
        reducedMotion={prefersReducedMotion}
      />

      <AnimatePresence>
        {showHint && <NavHint onDismiss={dismissHint} reducedMotion={prefersReducedMotion} />}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;