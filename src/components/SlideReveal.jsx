import { memo } from 'react';
import { motion } from 'framer-motion';

// Shared per-element entrance/exit wrapper used by every slide type's heading, body
// text, and image(s). One component so the animation logic lives in one place.
//
// `variant` picks HOW the element moves (see VARIANTS below):
//   - 'heading': always enters sliding RIGHT into place (coming from the left edge)
//     and exits sliding LEFT — regardless of which way you're navigating. Headings
//     are mostly left-aligned, so anchoring the motion to the left edge looks
//     natural for them. Fades in/out too.
//   - 'body': a "pop" — scales up from slightly smaller while fading in, and shrinks
//     slightly while fading out. It scales from its own center, so it works wherever
//     the text is placed on the slide.
//   - 'image': slides vertically a long distance with a slight scale + fade. It
//     follows the direction of travel: moving forward, images rise from below and
//     leave upward; moving backward, the reverse.
//
// `state` ('active' | 'exited' | 'peeking') comes from HomePage.jsx per slide:
//   - 'active': the current slide — element rests at full opacity, no offset.
//   - 'exited': not the current slide — element sits faded out at its "away" pose.
//   - 'peeking': the neighbor visible through a Title/Footer overlap — dimmed only.
//
// `side` (-1 | 0 | 1) is where this slide sits relative to the active one (-1 before
// it, +1 after it). Only variants with `followSide: true` (images) use it: their
// "away" pose is offset toward their own side, so they always enter from / exit
// toward the correct direction without needing to remember the last navigation.
//
// `order` (0, 1, 2...) staggers ENTRANCE only. Exits are simultaneous.
//
// `duration` should match the slide-track transition (passed from HomePage). Entrance
// delays are scaled down when that duration is short (fast scrubbing), so rapid
// navigation never waits on a long stagger.
//
// PERFORMANCE: only opacity and transforms (x / y / scale) are animated — the cheap,
// GPU-friendly properties. No filter/blur.

// The "away" pose for each kind of element: how far it's offset (px) and how much it's
// scaled while it's out of view. These are the main "how visible is the animation"
// knobs — bigger offsets / smaller scales = bolder.
//   x, y        — offset in px. For `followSide` variants this is multiplied by `side`.
//   scale       — size while away (1 = no scaling).
//   followSide  — true: offset direction depends on which side the slide is on.
//                 false: the offset is fixed (heading always goes to the left).
const VARIANTS = {
  heading: { x: -120, y: 0, scale: 1, followSide: false },
  body: { x: 0, y: 0, scale: 0.8, followSide: false },
  image: { x: 0, y: 100, scale: 0.94, followSide: true },
};

const ENTER_BASE_DELAY = 0.15; // seconds — lets the slide travel mostly into place before content moves
const STAGGER_STEP = 0.1; // seconds between each order's entrance
const PEEK_OPACITY = 0.4; // how dim the peeking neighbor looks
const ENTER_EASE = [0.16, 1, 0.3, 1]; // fast start, long soft landing — reads clearly
const NORMAL_TRANSITION_SECONDS = 0.7; // matches TRANSITION_MS in HomePage

function SlideReveal({
  state,
  side = 0,
  order = 0,
  variant = 'body',
  duration = 0.7,
  reducedMotion = false,
  as = 'div',
  className,
  style,
  children,
}) {
  const Tag = motion[as] || motion.div;
  const v = VARIANTS[variant] || VARIANTS.body;

  // Reduced motion: keep the fade, drop the movement and scaling.
  const direction = v.followSide ? side : 1;
  const awayX = reducedMotion ? 0 : v.x * direction;
  const awayY = reducedMotion ? 0 : v.y * direction;
  const awayScale = reducedMotion ? 1 : v.scale;

  let target;
  if (state === 'peeking') {
    target = { opacity: PEEK_OPACITY, x: 0, y: 0, scale: 1 };
  } else if (state === 'exited') {
    target = { opacity: 0, x: awayX, y: awayY, scale: awayScale };
  } else {
    target = { opacity: 1, x: 0, y: 0, scale: 1 };
  }

  const isEntering = state === 'active';
  const pace = Math.min(duration / NORMAL_TRANSITION_SECONDS, 1);

  let transition;
  if (reducedMotion) {
    transition = { duration: 0.01 };
  } else if (isEntering) {
    transition = {
      duration,
      delay: (ENTER_BASE_DELAY + order * STAGGER_STEP) * pace,
      ease: ENTER_EASE,
    };
  } else {
    // Leaving (or dimming): immediate, accelerating away.
    transition = { duration, delay: 0, ease: 'easeIn' };
  }

  return (
    <Tag className={className} style={style} animate={target} transition={transition}>
      {children}
    </Tag>
  );
}

export default memo(SlideReveal);