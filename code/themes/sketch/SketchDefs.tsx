// Hand-drawn SVG defs for the Conceptual Sketch theme's homepage, rendered
// once (invisible) and referenced via <use href="#sk-i-..."> / filter:
// url(#sk-rough), same sprite pattern as the other themes' icon files.
//
// #sk-rough is the heart of the look: a turbulence + displacement filter
// that wobbles any straight stroke it is applied to, so CSS borders and
// SVG lines read as pencil drawn rather than ruled. It is only ever put on
// decorative layers (pseudo-element frames, doodles) -- never on text,
// which it would blur.
export default function SketchDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="sk-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sk-rough-strong" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {/* straight-ish arrow for links and buttons */}
      <symbol id="sk-i-arrow" viewBox="0 0 32 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12.5c6-.6 15-1.2 26-.4M20.5 5.5c2.8 2.4 5.2 4.6 7.6 6.6-2.6 1.8-5 4-7.2 6.4"
        />
      </symbol>
      {/* a little five-point doodle star */}
      <symbol id="sk-i-star" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2.5l2.6 6.4 6.9.4-5.3 4.4 1.8 6.8L12 16.6l-6 3.9 1.8-6.8L2.5 9.3l6.9-.4z"
        />
      </symbol>
    </svg>
  );
}
