import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Slide from '../components/Slide.jsx';
import DotNav from '../components/DotNav.jsx';

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
        <div className="featured-image-placeholder" />
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
        <div className="featured-image-placeholder" />
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
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
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
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
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
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
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
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
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
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
          <div className="gallery-item-placeholder" />
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
        <div className="featured-image-placeholder" />
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
        <div className="featured-image-placeholder" />
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
  const [index, setIndex] = useState(0);
  const offsets = useMemo(() => computeOffsets(slides), []);
  const [navVisible, setNavVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);
  const scrubStartY = useRef(0);
  const scrubStartIndex = useRef(0);
  const touchOnNav = useRef(false); // true when the current touch sequence started on the dot-nav itself
  const navHideTimer = useRef(null);

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
    setTimeout(() => {
      isAnimating.current = false;
    }, TRANSITION_MS);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      wakeNav();
      if (e.deltaY > 0) goTo(index + 1);
      else if (e.deltaY < 0) goTo(index - 1);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        wakeNav();
        goTo(index + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        wakeNav();
        goTo(index - 1);
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
        scrubStartIndex.current = index;
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

      if (!isScrubbing) return;
      const touch = e.touches[0];
      const delta = scrubStartY.current - touch.clientY; // positive = dragged up = move forward
      const slideDelta = Math.round(delta / PX_PER_SLIDE_SCRUB);
      const target = Math.max(0, Math.min(slides.length - 1, scrubStartIndex.current + slideDelta));
      if (target !== index) setIndex(target);
    };

    const handleTouchEnd = (e) => {
      if (touchOnNav.current) {
        touchOnNav.current = false;
        return;
      }

      if (isScrubbing) {
        setIsScrubbing(false);
        scheduleNavHide();
        return;
      }

      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) goTo(index + 1);
      else goTo(index - 1);
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
  }, [index, isScrubbing]);

  useEffect(() => {
    wakeNav();
    return () => {
      if (navHideTimer.current) clearTimeout(navHideTimer.current);
    };
  }, []);

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
          duration: (isScrubbing ? SCRUB_TRANSITION_MS : TRANSITION_MS) / 1000,
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
      />
    </div>
  );
}



export default HomePage;