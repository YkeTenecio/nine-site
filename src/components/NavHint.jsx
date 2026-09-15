import { motion } from 'framer-motion';

// A one-time, non-blocking hint pointing out the less-obvious navigation gestures
// (edge-scrub on mobile, hover-to-expand dots on desktop). Shown once per browser
// (tracked via localStorage) and dismissed by a single click anywhere on it.
function NavHint({ onDismiss, reducedMotion = false }) {
  return (
    <motion.div
      className="nav-hint"
      onClick={onDismiss}
      role="status"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.35, ease: 'easeOut' }}
    >
      <p>
        Tip: hover the dots on the right to see every slide, or drag near the edge to jump around quickly.
      </p>
      <span className="nav-hint-close" aria-hidden="true">
        × 
      </span>
    </motion.div>
  );
}

export default NavHint;