import { memo } from 'react';
import SlideReveal from '../SlideReveal.jsx';

// The opening slide — a large h1 title plus a short subtitle line.
// `headingAlign` (default 'left') / `bodyAlign` (default 'center') control where
// each element's own box sits horizontally, and its text alignment.
//
// `contentState`/`side`/`transitionDuration`/`reducedMotion` drive the entrance/exit
// animation via SlideReveal: headings slide sideways, body text and images slide
// vertically (see SlideReveal.jsx for the full behavior).
function TitleSlide({
  heading,
  subtext,
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
      <SlideReveal as="h1" variant="heading" order={0} {...revealProps} className={`heading-align-${headingAlign}`}>
        {heading}
      </SlideReveal>
      <SlideReveal as="p" variant="body" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {subtext}
      </SlideReveal>
    </>
  );
}

export default memo(TitleSlide);
