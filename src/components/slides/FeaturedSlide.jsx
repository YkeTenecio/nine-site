import { memo } from 'react';
import SlideReveal from '../SlideReveal.jsx';

// One large image + heading + supporting text. Used for any slide showcasing a
// single deliverable (Selected Work, Product Transformation intro, Gift Box
// Transformation, Workflow).
//
// `layout` controls the image/text arrangement:
//   - 'center' (default): heading on top, image filling the middle, text below —
//     everything stacked vertically. `imageMaxWidth` (px, default 1300) caps how
//     wide the image gets on large screens.
//   - 'image-left' / 'image-right': heading renders as its own full-width line above
//     everything, then a row below it with the image on the named side and the
//     supporting text on the other. `imageFlex`/`textFlex` (both default 1) set the
//     flex-grow ratio between the two columns.
//   - 'stack-plus-pair': heading on top, then a row below with two columns —
//     left column is one image with the supporting text underneath it (stacked),
//     right column is `pairCount` (default 2) images side by side. `imageFlex`/
//     `textFlex` here control the left-stack-vs-right-pair width ratio the same way.
//
// `headingAlign` / `bodyAlign` ('left' | 'center' | 'right') control where each
// element's own box sits horizontally and its text alignment.
//
// `contentState`/`side`/`transitionDuration`/`reducedMotion` drive the entrance/exit
// animation via SlideReveal: headings slide sideways, body text and images slide
// vertically (see SlideReveal.jsx for the full behavior).
function FeaturedSlide({
  heading,
  text,
  layout = 'center',
  headingAlign = 'left',
  bodyAlign = 'center',
  pairCount = 2,
  imageMaxWidth = 1300,
  imageFlex = 1,
  textFlex = 1,
  contentState,
  side,
  transitionDuration = 0.7,
  reducedMotion = false,
}) {
  const revealProps = { state: contentState, side, duration: transitionDuration, reducedMotion };

  if (layout === 'image-left' || layout === 'image-right') {
    return (
      <>
        <SlideReveal
          as="h2"
          variant="heading"
          order={0}
          {...revealProps}
          className={`featured-standalone-heading heading-align-${headingAlign}`}
        >
          {heading}
        </SlideReveal>
        <div className={`featured-row ${layout === 'image-right' ? 'featured-row-reverse' : ''}`}>
          <SlideReveal
            as="div"
            variant="image"
            order={2}
            {...revealProps}
            className="featured-image-placeholder skeleton featured-image-col"
            style={{ flex: imageFlex }}
          />
          <div className="featured-text-col" style={{ flex: textFlex }}>
            <SlideReveal as="p" variant="body" order={1} {...revealProps}>
              {text}
            </SlideReveal>
          </div>
        </div>
      </>
    );
  }

  if (layout === 'stack-plus-pair') {
    return (
      <>
        <SlideReveal
          as="h2"
          variant="heading"
          order={0}
          {...revealProps}
          className={`featured-standalone-heading heading-align-${headingAlign}`}
        >
          {heading}
        </SlideReveal>
        <div className="featured-split">
          <div className="featured-stack-col" style={{ flex: imageFlex }}>
            <SlideReveal
              as="div"
              variant="image"
              order={2}
              {...revealProps}
              className="featured-image-placeholder skeleton featured-stack-image"
            />
            <SlideReveal as="p" variant="body" order={1} {...revealProps}>
              {text}
            </SlideReveal>
          </div>
          <SlideReveal
            as="div"
            variant="image"
            order={2}
            {...revealProps}
            className="featured-pair-col"
            style={{ flex: textFlex }}
          >
            {Array.from({ length: pairCount }, (_, i) => (
              <div key={i} className="gallery-item-placeholder skeleton" />
            ))}
          </SlideReveal>
        </div>
      </>
    );
  }

  return (
    <>
      <SlideReveal as="h2" variant="heading" order={0} {...revealProps} className={`heading-align-${headingAlign}`}>
        {heading}
      </SlideReveal>
      <SlideReveal
        as="div"
        variant="image"
        order={2}
        {...revealProps}
        className="featured-image-placeholder skeleton"
        style={{ maxWidth: imageMaxWidth }}
      />
      <SlideReveal as="p" variant="body" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {text}
      </SlideReveal>
    </>
  );
}

export default memo(FeaturedSlide);
