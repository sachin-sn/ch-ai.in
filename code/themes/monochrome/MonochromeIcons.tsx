// Hand-authored icon sprite for the monochrome theme's homepage. Only one
// icon is needed -- the arrow used on buttons and project/case-study
// links -- since Mono's "precision index" identity avoids decorative
// icons (unlike material's leaf/branch flourishes). Rendered once as an
// invisible <symbol> sprite and referenced via <use href="#mo-i-arrow">,
// same pattern as themes/material/MaterialIcons.tsx and
// themes/pixel/PixelIcons.tsx.
export default function MonochromeIcons() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ display: "none" }}>
      <symbol id="mo-i-arrow" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14M13 6l6 6-6 6"
        />
      </symbol>
    </svg>
  );
}
