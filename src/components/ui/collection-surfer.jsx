import { motion, useTransform, useSpring, useMotionValue, useAnimationFrame } from "framer-motion";
import React from "react";

// CollectionItem shape: { id, image, title }
// variant: "magnetic" | "uplift" | "simple"

// How fast the carousel auto-advances on its own (arbitrary "px of virtual scroll"
// per second). Replaces the original's window-scroll-driven position entirely — this
// runs on its own clock, so it never depends on the page actually scrolling (this
// project disables native scrolling site-wide in favor of its own slide-snap system).
const AUTO_ADVANCE_SPEED = 90;

export function CollectionSurfer({ items, variant = "magnetic", active = true }) {
  // Loop setup: duplicate items so we can seamlessly wrap back to the start once
  // we've auto-advanced past one full set.
  const duplicatedItems = [...items, ...items];

  const scrollPerItem = 600;
  const loopDistance = items.length * scrollPerItem;

  // Continuously increasing "virtual scroll" position, driven by elapsed time
  // instead of the browser's real scrollbar.
  const progress = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    // Pausing here (rather than unmounting or hiding the component) means resuming
    // just picks up from wherever it left off — no jump back to the start — since
    // `progress` simply stops changing instead of resetting. Pausing matters because
    // this app keeps every slide mounted simultaneously (translate-based scrolling,
    // not conditional rendering), so an unpaused instance would keep animating and
    // writing to the DOM every frame even while completely off-screen.
    if (!active) return;
    if (items.length === 0) return;
    progress.set(progress.get() + AUTO_ADVANCE_SPEED * (delta / 1000));
  });

  const loopedProgress = useTransform(progress, (value) => value % loopDistance);

  // Scaled down from the original's 240/-84/-288 (tuned for a full-viewport, 300x400px
  // card experience) — proportionally reduced (0.6x) to fit a contained slide box
  // without the vertical depth movement getting clipped by overflow:hidden, which
  // would otherwise flatten the whole effect into what looks like plain sideways
  // scrolling.
  const stepX = 144;
  const stepY = -50;
  // stepZ kept modest relative to `perspective` below on purpose: the scene's own
  // Z-translation (as it auto-advances) PLUS each card's own Z offset can add up —
  // if that combined depth gets too close to (or exceeds) `perspective`, cards near
  // the "far" end of that range foreshorten into an extreme, paper-thin sliver
  // instead of a readable tilted card. Keeping stepZ small and perspective generous
  // leaves enough headroom that this never happens, regardless of itemCount.
  const stepZ = -70;

  const x = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepX]);
  const y = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepY]);
  const z = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepZ]);

  // Mouse position for the magnetic/uplift proximity effects — initialized off-screen
  // so no card is affected until the cursor actually enters this component's box.
  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);

  const handleMouseMove = (e) => {
    if (variant === "simple") return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    if (variant === "simple") return;
    mouseX.set(-10000);
    mouseY.set(-10000);
  };

  return (
    // Contained within its parent box (whatever GallerySlide gives it) instead of
    // taking over the full browser viewport — no position:fixed/inset:0, no 50,000px
    // scroll spacer, no hardcoded heading/caption (GallerySlide renders its own).
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "2400px", perspectiveOrigin: "50% 50%" }}
      >
        <motion.div
          className="relative w-0 h-0"
          style={{ x, y, z, transformStyle: "preserve-3d" }}
        >
          {duplicatedItems.map((item, i) => (
            <Card
              key={`${item.id}-${i}`}
              item={item}
              i={i}
              itemsLength={items.length}
              stepX={stepX}
              stepY={stepY}
              stepZ={stepZ}
              mouseX={mouseX}
              mouseY={mouseY}
              variant={variant}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Card({ item, i, itemsLength, stepX, stepY, stepZ, mouseX, mouseY, variant }) {
  const ref = React.useRef(null);

  const distance = useTransform([mouseX, mouseY], ([mx, my]) => {
    if (!ref.current || variant === "simple") return 200;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.sqrt(Math.pow(mx - centerX, 2) + Math.pow(my - centerY, 2));
  });

  // Distance thresholds scaled down to match the smaller card size (was 0-400,
  // tuned for the original 300x400px cards).
  const targetScale = useTransform(distance, [0, 240], [1.5, 1]);
  const springScale = useSpring(targetScale, { mass: 0.5, stiffness: 300, damping: 20 });

  const targetUplift = useTransform(distance, [0, 240], [-60, 0]);
  const springUplift = useSpring(targetUplift, { mass: 0.5, stiffness: 300, damping: 20 });

  const transform = useTransform([springScale, springUplift], ([s, u]) => {
    let scaleValue = 1;
    let upliftValue = 0;

    if (variant === "magnetic") {
      scaleValue = Number(s);
    } else if (variant === "uplift") {
      upliftValue = Number(u);
    }

    // Centers the fan around the middle of the stage instead of starting at the
    // origin corner (card i=0 sitting untransformed, everything else trailing off
    // increasingly far in one direction) — that corner-start was pushing most of
    // the fan outside the visible box entirely, leaving only one card in frame,
    // often at a severe enough off-axis angle to look like a thin sliver rather
    // than a normal tilted card. Subtracting a constant here shifts every card
    // (both the original and duplicated sets) equally, so it doesn't affect the
    // spacing between them or the seamless-loop mechanism — it just re-centers
    // where that whole fan sits at rest.
    const centerOffset = (itemsLength - 1) / 2;
    const baseX = (i - centerOffset) * stepX;
    const baseY = (i - centerOffset) * stepY;
    const baseZ = (i - centerOffset) * stepZ;

    // Softened from the original's -50deg: that steep a yaw, combined with a card
    // sitting off-axis from the perspective's vanishing point, is what produced the
    // paper-thin "blade" look — a shallower angle keeps every card's image content
    // recognizable while still giving the row a tilted, dimensional feel.
    return `translate3d(${baseX}px, ${baseY + upliftValue}px, ${baseZ}px) rotateY(-18deg) scale(${scaleValue})`;
  });

  return (
    <motion.div
      ref={ref}
      className="absolute w-[180px] h-[240px] bg-neutral-900 overflow-hidden shadow-2xl transition-colors duration-500 ease-out group"
      style={{ transform, transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-6 -left-4 text-white font-mono text-xs opacity-50 transition-opacity group-hover:opacity-100">
        {String((i % Math.max(itemsLength, 1)) + 1).padStart(2, "0")}
      </div>

      <div className="relative w-full h-full brightness-75 group-hover:brightness-100 transition-all duration-300">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}