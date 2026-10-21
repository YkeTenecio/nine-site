import { memo } from 'react';
import SlideReveal from '../SlideReveal.jsx';

// A grid of images + heading + supporting text. `itemCount` controls how many
// placeholder tiles render — once real data lands in Part 2, this becomes an
// `items` array (image src + alt) mapped instead of a bare count.
//
// `headingAlign` (default 'left') / `bodyAlign` (default 'center') control where
// each element's own box sits horizontally, and its text alignment.
//
// The whole grid is wrapped as a single 'image' SlideReveal block, so it slides
// in/out as one piece.
function GallerySlide({
  heading,
  text,
  itemCount = 4,
  headingAlign = 'left',
  bodyAlign = 'center',
  contentState,
  side,
  transitionDuration = 0.7,
  reducedMotion = false,
}) {
  const revealProps = { state: contentState, side, duration: transitionDuration, reducedMotion };

  return (
    <>
      <SlideReveal as="h2" variant="heading" order={0} {...revealProps} className={`heading-align-${headingAlign}`}>
        {heading}
      </SlideReveal>
      <SlideReveal as="div" variant="image" order={2} {...revealProps} className="gallery-grid">
        {Array.from({ length: itemCount }, (_, i) => (
          <div key={i} className="gallery-item-placeholder skeleton" />
        ))}
      </SlideReveal>
      <SlideReveal as="p" variant="body" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {text}
      </SlideReveal>
    </>
  );
}

export default memo(GallerySlide);
