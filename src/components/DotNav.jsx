import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useMotionTemplate } from 'framer-motion';

const FULL_SIZE_RADIUS = 1; // slides within this distance of active stay full-size (prev/current/next)
const COLLAPSED_HEIGHT = 172; // px — matches the 7-dot window (see the mobile override below for the smaller variant)
const COLLAPSED_HEIGHT_MOBILE = 116;

function DotNav({
  count,
  activeIndex,
  onDotClick,
  visible = true,
  onMouseEnter,
  onMouseLeave,
  scrubbing = false,
  transitionDuration = 0.7,
}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const dotRefs = useRef([]);
  const [trackOffset, setTrackOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 1 = full top/bottom fade (collapsed, 7-dot window), 0 = no fade (expanded, nothing clipped).
  // Driven as a real CSS mask gradient (not an opaque overlay) so it reveals whatever's actually
  // behind the dots — works against any slide background color, unlike a colored overlay div.
  const fadeStrength = useMotionValue(1);
  const maskImage = useMotionTemplate`linear-gradient(to bottom, transparent 0%, black calc(12% * ${fadeStrength}), black calc(100% - 12% * ${fadeStrength}), transparent 100%)`;

  useEffect(() => {
    const controls = animate(fadeStrength, isHovering ? 0 : 1, { duration: 0.3, ease: 'easeOut' });
    return () => controls.stop();
  }, [isHovering, fadeStrength]);

  useLayoutEffect(() => {
    const measure = () => {
      const activeEl = dotRefs.current[activeIndex];
      const viewport = viewportRef.current;
      if (!activeEl || !viewport) return;
      const activeCenter = activeEl.offsetTop + activeEl.offsetHeight / 2;
      const viewportCenter = viewport.clientHeight / 2;
      setTrackOffset(viewportCenter - activeCenter);

      // scrollHeight measures the track's full content height regardless of the
      // viewport's overflow:hidden clipping, so this gives us the real pixel height
      // needed to show every dot — letting Framer Motion animate to an exact number
      // instead of the unreliable (and unanimatable) CSS `height: auto`.
      if (trackRef.current) setExpandedHeight(trackRef.current.scrollHeight);

      setIsMobile(window.innerWidth <= 480);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeIndex, count]);

  const collapsedHeight = isMobile ? COLLAPSED_HEIGHT_MOBILE : COLLAPSED_HEIGHT;

  const handleMouseEnter = (e) => {
    setIsHovering(true);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovering(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div
      className={`dot-nav ${visible ? 'dot-nav-visible' : 'dot-nav-hidden'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(e) => e.stopPropagation()} // let taps on dots register without also triggering the page's swipe/scrub handler
    >
      <motion.div
        className="dot-nav-viewport"
        ref={viewportRef}
        animate={{ height: isHovering ? expandedHeight || collapsedHeight : collapsedHeight }}
        transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
        style={{ WebkitMaskImage: maskImage, maskImage }}
      >
        <motion.div
          ref={trackRef}
          className="dot-track"
          animate={{ y: isHovering ? 0 : trackOffset }}
          transition={{ duration: transitionDuration, ease: [0.65, 0, 0.35, 1] }}
        >
          {Array.from({ length: count }, (_, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            const distance = Math.abs(slideIndex - activeIndex);
            const isEdge = distance > FULL_SIZE_RADIUS;
            // Scale/opacity/blur control SIZE/PROMINENCE only — shape (perfect circle) is
            // fixed in CSS via border-radius + overflow:hidden and never touched here, so
            // it can't visually distort mid-transition the way animating a flat background
            // color into a gradient border could.
            const scale = isActive ? (scrubbing ? 2 : 1.3) : isEdge ? 0.6 : 1;

            return (
              <motion.button
                key={slideIndex}
                ref={(el) => (dotRefs.current[slideIndex] = el)}
                animate={{
                  scale,
                  opacity: isEdge ? 0.45 : 1,
                  filter: isEdge ? 'blur(0.6px)' : 'blur(0px)',
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className={`dot ${isActive && scrubbing ? 'dot-scrub-active' : ''}`}
                onClick={() => onDotClick(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
              >
                {/* Hollow-sphere look: always present, a subtle glassy ring with a soft
                    inner sheen — this is what an inactive dot looks like. */}
                <span className="dot-hollow" />

                {/* Shiny-sphere look: a glossy, lit ball with a specular highlight —
                    crossfades in via opacity (not color interpolation) when this dot
                    becomes active, layered directly on top of the hollow look. */}
                <motion.span
                  className="dot-shiny"
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DotNav;