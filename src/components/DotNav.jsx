const WINDOW_SIZE = 7; // total dots shown at once
const FULL_SIZE_RADIUS = 1; // how many slides on each side of active stay full-size (prev/current/next)

function DotNav({ count, activeIndex, onDotClick, visible = true, onMouseEnter, onMouseLeave, scrubbing = false }) {
  // If there are 7 or fewer slides total, just show them all — no windowing needed.
  const windowLength = Math.min(WINDOW_SIZE, count);

  // Center the window on activeIndex, clamped so it never runs past the first/last slide.
  const idealStart = activeIndex - Math.floor(windowLength / 2);
  const windowStart = Math.max(0, Math.min(idealStart, count - windowLength));

  const visibleIndices = Array.from({ length: windowLength }, (_, p) => windowStart + p);

  return (
    <div
      className={`dot-nav ${visible ? 'dot-nav-visible' : 'dot-nav-hidden'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={(e) => e.stopPropagation()} // let taps on dots register without also triggering the page's swipe/scrub handler
    >
      {visibleIndices.map((slideIndex) => {
        const isActive = slideIndex === activeIndex;
        const distance = Math.abs(slideIndex - activeIndex);
        const isEdge = distance > FULL_SIZE_RADIUS; // outer dots (prev-2/prev-3, next+2/next+3): smaller + blurred

        const classes = [
          'dot',
          isEdge ? 'dot-edge' : '',
          isActive ? 'dot-active' : '',
          isActive && scrubbing ? 'dot-scrub-active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={slideIndex}
            className={classes}
            onClick={() => onDotClick(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        );
      })}
    </div>
  );
}

export default DotNav;