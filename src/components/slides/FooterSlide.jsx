import SlideReveal from '../SlideReveal.jsx';

// The closing slide — heading plus a short line (contact/social/closing note).
// `headingAlign` (default 'left') / `bodyAlign` (default 'center') control where
// each element's own box sits horizontally, and its text alignment.
function FooterSlide({
  heading,
  text,
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
      <SlideReveal as="p" order={1} {...revealProps} className={`body-align-${bodyAlign}`}>
        {text}
      </SlideReveal>
    </>
  );
}

export default FooterSlide;