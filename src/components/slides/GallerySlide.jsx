import SlideReveal from '../SlideReveal.jsx';

// A grid of images + heading + supporting text. `itemCount` controls how many
// placeholder tiles render — once real data lands in Part 2, this becomes an
// `items` array (image src + alt) mapped instead of a bare count.
//
// `headingAlign` (default 'left') / `bodyAlign` (default 'center') control where
// each element's own box sits horizontally, and its text alignment.
//
// The whole grid is wrapped as a single `noExit` SlideReveal block — per the
// brief, images don't animate out, they just stay as-is.
function GallerySlide({
  heading,
  text,
  itemCount = 4,
  headingAlign = 'left',
  bodyAlign = 'center',
  contentState,
  direction,
  transitionDuration = 0.7,
  reducedMotion = false,
}) {
  const revealProps = { state: contentState, direction, duration: transitionDuration, reducedMotion };

  return (
    <>
      <SlideReveal as="h2" order={0} {...revealProps} className={`heading-align-${headingAlign}`}>
        {heading}
      </SlideReveal>
      <SlideReveal as="div" order={2} noExit {...revealProps} className="gallery-grid">
        {Array.from({ length: itemCount }, (_, i) => (
          <div key={i} className="gallery-item-placeholder skeleton" />
        ))}
      </SlideReveal>
      <SlideReveal as="p" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {text}
      </SlideReveal>
    </>
  );
}

export default GallerySlide;