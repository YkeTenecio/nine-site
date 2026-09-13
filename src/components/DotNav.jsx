function DotNav({ count, activeIndex, onDotClick, visible = true, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className={`dot-nav ${visible ? 'dot-nav-visible' : 'dot-nav-hidden'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={(e) => e.stopPropagation()} // let taps on dots register without also triggering the page's swipe/scrub handler
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          className={`dot ${i === activeIndex ? 'dot-active' : ''}`}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default DotNav;