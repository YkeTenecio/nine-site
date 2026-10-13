import { motion } from 'framer-motion';

// Shared per-element "pop in / pop out" wrapper used by every slide type's heading,
// body text, and image(s). One component so the animation logic lives in exactly
// one place instead of being re-implemented per slide type.
//
// `state` ('active' | 'exited' | 'peeking') comes from HomePage.jsx, computed per
// slide on every render:
//   - 'active': this is the current slide — element rests at full opacity/position.
//   - 'exited': this slide just left (or hasn't yet become) the active one — element
//     fades out, continuing in the direction of travel (see `direction` below).
//   - 'peeking': this slide isn't active, but it's the one partially visible through
//     a Title/Footer slide's 30% overlap "peek" — element dims and blurs instead of
//     fully disappearing, so the peeking slide doesn't look like an empty gap.
//
// `direction` (1 | -1 | 0) is which way navigation just moved (1 = forward/down,
// -1 = backward/up). It only affects the 'exited' exit direction — content leaving
// continues the same way the slide transition itself is moving, instead of in some
// unrelated direction.
//
// `order` (0, 1, 2...) staggers ENTRANCE only — order 0 (heading) appears first,
// order 1 (body) slightly after, order 2 (image) after that. Exits are never
// staggered: per the brief, heading and body should animate out together,
// simultaneously, since that's simpler and reads as a single cohesive motion.
//
// `noExit`: when true, this element ignores the 'exited' state entirely and just
// stays resting (used for images — "the images just stay as is, no animated exit").
// It still responds normally to 'active' and 'peeking'.
//
// `duration` should match whatever duration the slide-track transition itself is
// using (TRANSITION_MS or the faster SCRUB_TRANSITION_MS while scrubbing), passed
// down from HomePage.jsx, so content finishes animating in step with the slide
// transition rather than lagging behind or finishing early.
const EXIT_TRAVEL_OFFSET = 24; // px — how far content drifts while fading out/in
const STAGGER_STEP = 0.08; // seconds between each order's entrance

function SlideReveal({
  state,
  direction = 0,
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

  // Exit continues in the direction of travel: moving forward (down the slide
  // list) means content keeps drifting upward as it fades; moving backward, it
  // drifts downward. This mirrors the physical motion of the slide transition
  // itself rather than picking an arbitrary direction.
  const exitY = direction > 0 ? -EXIT_TRAVEL_OFFSET : direction < 0 ? EXIT_TRAVEL_OFFSET : 0;

  let target;
  if (state === 'peeking') {
    target = { opacity: 0.4, y: 0, filter: 'blur(2px)' };
  } else if (state === 'exited' && !noExit) {
    target = { opacity: 0, y: exitY, filter: 'blur(0px)' };
  } else {
    // 'active', or 'exited' with noExit set (images: stay resting regardless).
    target = { opacity: 1, y: 0, filter: 'blur(0px)' };
  }

  const isEntering = state === 'active';
  const transition = reducedMotion
    ? { duration: 0.01 }
    : {
        duration,
        delay: isEntering ? order * STAGGER_STEP : 0, // stagger only applies going IN; exits are simultaneous
        ease: 'easeOut',
      };

  return (
    <Tag className={className} style={style} animate={target} transition={transition}>
      {children}
    </Tag>
  );
}

export default SlideReveal;