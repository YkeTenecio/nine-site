import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Slide from '../components/Slide.jsx';
import DotNav from '../components/DotNav.jsx';
import NavHint from '../components/NavHint.jsx';
import TitleSlide from '../components/slides/TitleSlide.jsx';
import FooterSlide from '../components/slides/FooterSlide.jsx';
import FeaturedSlide from '../components/slides/FeaturedSlide.jsx';
import GallerySlide from '../components/slides/GallerySlide.jsx';

// Each slide: key (unique), bg/headingColor/bodyColor/headingFont/bodyFont (which
// palette slot it uses — see the matching `slide-bg-N` / `heading-color-N` /
// `body-color-N` / `heading-font-N` / `body-font-N` classes in index.css), and
// `type` + whichever of heading/subtext/text/itemCount/layout that type needs —
// rendered via the matching component below. Four archetypes:
//   - TitleSlide    (heading, subtext)
//   - FooterSlide   (heading, text)
//   - FeaturedSlide (heading, text, optional layout: 'center' | 'image-left' | 'image-right' | 'stack-plus-pair')
//   - GallerySlide  (heading, text, itemCount)
// This is the shape Part 2's Supabase data will map onto directly (heading/text/images
// per row, plus a layout choice for Featured slides).
//
// All five palette fields (`bg`, `headingColor`, `bodyColor`, `headingFont`, `bodyFont`)
// work identically: each is a plain number referencing a palette slot defined in
// index.css. Assignment is fully manual per slide — any slide can use any slot, in
// any pattern, independent of the other four. To restyle the site, edit the palette
// values in index.css; to change which slide uses which slot, edit the number here.
//
// `short: true` makes a slide 70dvh instead of the full 100dvh, letting the adjacent
// slide peek through the remaining 30%. `overlapPrev: true` (footer only) pulls the
// snap position back by the overlap amount so the *previous* slide's tail stays visible
// at the top instead of the peek happening forward (see computeOffsets below).
const OVERLAP_DVH = 30;

const slides = [
  {
    key: 'Slide 1',
    bg: 1,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    short: true,
    type: 'title',
    heading: '[Portfolio Owner Name] — Placeholder Title',
    subtext: 'Ad & Creative Design Portfolio',
  },
  {
    key: 'Slide 2',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'featured',
    heading: 'Selected Work',
    text: 'Supporting text placeholder.',
  },
  {
    key: 'Slide 3',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'featured',
    heading: 'Selected Work Display',
    text: 'Supporting text placeholder.',
  },
  {
    key: 'Slide 4',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'gallery',
    heading: 'Selected Work Display (cont.)',
    text: 'Supporting text placeholder.',
    itemCount: 4,
  },
  {
    key: 'Slide 5',
    bg: 1,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'gallery',
    heading: 'Selected Work 2 Display',
    text: 'Supporting text placeholder.',
    itemCount: 4,
  },
  {
    key: 'Slide 6',
    bg: 1,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'gallery',
    heading: 'SSelected Work 2 Display (cont.)',
    text: 'Supporting text placeholder.',
    itemCount: 4,
  },
  {
    key: 'Slide 7',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'gallery',
    heading: 'Concept Works',
    text: 'Supporting text placeholder.',
    itemCount: 4,
  },
  {
    key: 'Slide 8',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'gallery',
    heading: 'Concept Works (cont.)',
    text: 'Supporting text placeholder.',
    itemCount: 4,
  },
  {
    key: 'Slide 9',
    bg: 1,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'featured',
    heading: 'Concept Works 2',
    text: 'Supporting text placeholder.',
  },
  {
    key: 'Slide 10',
    bg: 2,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    type: 'featured',
    heading: 'Workflow',
    text: 'Supporting text placeholder.',
  },
  {
    key: 'Slide 11',
    bg: 3,
    headingColor: 1,
    bodyColor: 1,
    headingFont: 1,
    bodyFont: 1,
    short: true,
    overlapPrev: true,
    type: 'footer',
    heading: 'Footer — Placeholder',
    text: 'Contact / social links / closing note placeholder.',
  },
];

// Maps a slide's `type` to the component that renders it.
const SLIDE_COMPONENTS = {
  title: TitleSlide,
  footer: FooterSlide,
  featured: FeaturedSlide,
  gallery: GallerySlide,
};

function renderSlideBody(slide, contentState, side, transitionDuration, reducedMotion) {
  const Component = SLIDE_COMPONENTS[slide.type];
  if (!Component) return null;
  return (
    <Component
      heading={slide.heading}
      subtext={slide.subtext}
      text={slide.text}
      itemCount={slide.itemCount}
      layout={slide.layout}
      headingAlign={slide.headingAlign}
      bodyAlign={slide.bodyAlign}
      pairCount={slide.pairCount}
      imageMaxWidth={slide.imageMaxWidth}
      imageFlex={slide.imageFlex}
      textFlex={slide.textFlex}
      contentState={contentState}
      side={side}
      transitionDuration={transitionDuration}
      reducedMotion={reducedMotion}
    />
  );
}

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
  // closure state, so the listeners never get torn down and re-attached mid-gesture.
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
      // page gesture at all.
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
      // on the page — we're handling all navigation ourselves.
      e.preventDefault();

      if (!isScrubbingRef.current) return;
      const touch = e.touches[0];
      // Scrollbar-style mapping: finger up -> earlier slide, finger down -> later slide.
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

  const slideTransitionDuration =
    (prefersReducedMotion ? 50 : isScrubbing ? SCRUB_TRANSITION_MS : TRANSITION_MS) / 1000;

  // A slide is 'peeking' when it isn't active but is the neighbor partially visible
  // through Title's or Footer's 30% overlap — see SlideReveal.jsx for why that gets
  // a dimmed treatment instead of the normal full fade-out.
  function getContentState(i) {
    if (i === index) return 'active';
    const isPeekingNeighborOfTitle = index === 0 && i === 1;
    const isPeekingNeighborOfFooter = index === slides.length - 1 && i === slides.length - 2;
    if (isPeekingNeighborOfTitle || isPeekingNeighborOfFooter) return 'peeking';
    return 'exited';
  }

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
        {slides.map((slide, i) => {
          const contentState = getContentState(i);
          // Where this slide sits relative to the active one: -1 above, +1 below, 0 = active.
          // SlideReveal uses this so content always enters from / exits toward the right side.
          const side = Math.sign(i - index);
          // 'slide-live' marks slides someone can actually see (active, or peeking through
          // Title/Footer) — index.css pauses the skeleton shimmer on every other slide.
          const liveClass = contentState === 'exited' ? '' : ' slide-live';
          return (
            <Slide
              key={slide.key}
              className={`slide-bg-${slide.bg} heading-color-${slide.headingColor} body-color-${slide.bodyColor} heading-font-${slide.headingFont} body-font-${slide.bodyFont}${slide.short ? ' slide-short' : ''}${liveClass}`}
            >
              {renderSlideBody(slide, contentState, side, slideTransitionDuration, prefersReducedMotion)}
            </Slide>
          );
        })}
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
        transitionDuration={slideTransitionDuration}
        reducedMotion={prefersReducedMotion}
      />

      <AnimatePresence>
        {showHint && <NavHint onDismiss={dismissHint} reducedMotion={prefersReducedMotion} />}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
