import SlideReveal from '../SlideReveal.jsx';

// One large image + heading + supporting text. Used for any slide showcasing a
// single deliverable (Selected Work, Product Transformation intro, Gift Box
// Transformation, Workflow).
//
// `layout` controls the image/text arrangement:
//   - 'center' (default): heading on top, image filling the middle, text below —
//     everything stacked vertically. `imageMaxWidth` (px, default 1300) caps how
//     wide the image gets on large screens — set it per slide to make one slide's
//     image narrower/wider than another's, even though both use 'center'.
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
// `contentState`/`direction`/`transitionDuration`/`reducedMotion` drive the
// pop-in/pop-out animation via SlideReveal on every heading/text/image — images
// are marked `noExit` throughout, per the brief ("images just stay as is").
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
  direction,
  transitionDuration = 0.7,
  reducedMotion = false,
}) {
  const revealProps = { state: contentState, direction, duration: transitionDuration, reducedMotion };

  if (layout === 'image-left' || layout === 'image-right') {
    return (
      <>
        <SlideReveal
          as="h2"
          order={0}
          {...revealProps}
          className={`featured-standalone-heading heading-align-${headingAlign}`}
        >
          {heading}
        </SlideReveal>
        <div className={`featured-row ${layout === 'image-right' ? 'featured-row-reverse' : ''}`}>
          <SlideReveal
            as="div"
            order={2}
            noExit
            {...revealProps}
            className="featured-image-placeholder skeleton featured-image-col"
            style={{ flex: imageFlex }}
          />
          <div className="featured-text-col" style={{ flex: textFlex }}>
            <SlideReveal as="p" order={1} {...revealProps}>
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
              order={2}
              noExit
              {...revealProps}
              className="featured-image-placeholder skeleton featured-stack-image"
            />
            <SlideReveal as="p" order={1} {...revealProps}>
              {text}
            </SlideReveal>
          </div>
          <SlideReveal as="div" order={2} noExit {...revealProps} className="featured-pair-col" style={{ flex: textFlex }}>
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
      <SlideReveal as="h2" order={0} {...revealProps}>
        {heading}
      </SlideReveal>
      <SlideReveal
        as="div"
        order={2}
        noExit
        {...revealProps}
        className="featured-image-placeholder skeleton"
        style={{ maxWidth: imageMaxWidth }}
      />
      <SlideReveal as="p" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {text}
      </SlideReveal>
    </>
  );
}

export default FeaturedSlide;