import { memo } from 'react';
import { motion } from 'framer-motion';

// Shared per-element "pop in / pop out" wrapper used by every slide type's heading,
// body text, and image(s). One component so the animation logic lives in exactly
// one place instead of being re-implemented per slide type.
//
// `state` ('active' | 'exited' | 'peeking') comes from HomePage.jsx, computed per
// slide on every render:
//   - 'active': this is the current slide — element rests at full opacity/position.
//   - 'exited': this slide isn't the current one — element is faded out.
//   - 'peeking': this slide isn't active, but it's the one partially visible through
//     a Title/Footer slide's 30% overlap "peek" — element dims instead of fully
//     disappearing, so the peeking slide doesn't look like an empty gap.
//
// `side` (-1 | 0 | 1) is where this slide sits relative to the active one: -1 = it's
// before the active slide (above), +1 = after it (below), 0 = it IS the active slide.
// An exited element rests offset toward its own side — so when its slide becomes
// active it always slides in from the side it was waiting on (from below when you
// navigate forward into it, from above when you navigate backward into it), and when
// it leaves it drifts off toward the side it's now on. That reproduces "content
// enters/exits in the direction of travel" using only where each slide IS, with no
// need to remember which way the last navigation went (the old approach tracked a
// `direction` value, which went stale after the first re-render and made every
// hidden slide re-animate on each navigation).
//
// `order` (0, 1, 2...) staggers ENTRANCE only — heading first, body slightly after,
// image after that. Exits are never staggered: heading and body leave together.
//
// `noExit`: when true, this element ignores the 'exited' state and just stays
// resting (used for images — "the images just stay as is, no animated exit").
//
// `duration` should match the slide-track transition duration (passed from HomePage).
//
// PERFORMANCE NOTE: this animates only `opacity` and `y` (transform) — the two
// properties browsers can animate cheaply on the GPU. It deliberately does NOT
// animate `filter: blur()`: blur has to be re-rendered every frame, and on large
// elements (image boxes, the gallery grid) across a dozen slides it was a major
// source of stutter. If you want a blurred peek back, set PEEK_BLUR_PX above 0 —
// but expect it to cost frames on weaker devices.
const EXIT_TRAVEL_OFFSET = 24; // px — how far content drifts while fading out/in
const STAGGER_STEP = 0.08; // seconds between each order's entrance
const PEEK_OPACITY = 0.4; // how dim the peeking neighbor looks
const PEEK_BLUR_PX = 0; // 0 = no blur (fast). Raise to e.g. 2 for a blurred peek (slower).

function SlideReveal({
  state,
  side = 0,
  order = 0,
  noExit = false,
  duration = 0.7,
  reducedMotion = false,
  as = 'div',
  className,
  style,
  children,
}) {
  const Tag = motion[as] || motion.div;

  // Only include `filter` in the animation at all when a blur is actually wanted —
  // otherwise Framer would still write `filter: blur(0px)` onto every element,
  // forcing extra compositing work for nothing.
  const blur = (px) => (PEEK_BLUR_PX > 0 ? { filter: `blur(${px}px)` } : {});

  let target;
  if (state === 'peeking') {
    target = { opacity: PEEK_OPACITY, y: 0, ...blur(PEEK_BLUR_PX) };
  } else if (state === 'exited' && !noExit) {
    target = { opacity: 0, y: side * EXIT_TRAVEL_OFFSET, ...blur(0) };
  } else {
    // 'active', or 'exited' with noExit set (images: stay resting regardless).
    target = { opacity: 1, y: 0, ...blur(0) };
  }

  const isEntering = state === 'active';
  const transition = reducedMotion
    ? { duration: 0.01 }
    : {
        duration,
        delay: isEntering ? order * STAGGER_STEP : 0, // stagger only applies going IN
        ease: 'easeOut',
      };

  return (
    <Tag className={className} style={style} animate={target} transition={transition}>
      {children}
    </Tag>
  );
}

export default memo(SlideReveal);
