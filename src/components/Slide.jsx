function Slide({ children, className = '' }) {
  return (
    <section className={`slide ${className}`}>
      {children}
    </section>
  );
}

export default Slide;