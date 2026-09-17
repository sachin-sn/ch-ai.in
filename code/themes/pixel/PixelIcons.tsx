// Hand-authored pixel-grid icons (crisp rects, no anti-aliasing) shared by
// the pixel theme's homepage. Rendered once as an invisible <symbol> sprite
// and referenced elsewhere via <use href="#px-i-...">, so the markup stays
// cheap no matter how many places reuse an icon.
export default function PixelIcons() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ display: "none" }}>
      <symbol id="px-i-star" viewBox="0 0 8 8">
        <rect x="3" y="0" width="2" height="1" />
        <rect x="2" y="1" width="4" height="1" />
        <rect x="1" y="2" width="6" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="1" y="4" width="6" height="1" />
        <rect x="0" y="5" width="2" height="1" />
        <rect x="3" y="5" width="2" height="1" />
        <rect x="6" y="5" width="2" height="1" />
        <rect x="0" y="6" width="1" height="1" />
        <rect x="0" y="7" width="1" height="1" />
        <rect x="7" y="7" width="1" height="1" />
      </symbol>
      <symbol id="px-i-heart" viewBox="0 0 8 7">
        <rect x="1" y="0" width="2" height="1" />
        <rect x="5" y="0" width="2" height="1" />
        <rect x="0" y="1" width="8" height="1" />
        <rect x="0" y="2" width="8" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="1" y="4" width="6" height="1" />
        <rect x="2" y="5" width="4" height="1" />
        <rect x="3" y="6" width="2" height="1" />
      </symbol>
      <symbol id="px-i-coin" viewBox="0 0 8 8">
        <rect x="1" y="0" width="6" height="1" />
        <rect x="0" y="1" width="8" height="1" />
        <rect x="0" y="2" width="2" height="1" />
        <rect x="3" y="2" width="2" height="1" />
        <rect x="6" y="2" width="2" height="1" />
        <rect x="0" y="3" width="2" height="1" />
        <rect x="3" y="3" width="2" height="1" />
        <rect x="6" y="3" width="2" height="1" />
        <rect x="0" y="4" width="2" height="1" />
        <rect x="3" y="4" width="2" height="1" />
        <rect x="6" y="4" width="2" height="1" />
        <rect x="0" y="5" width="2" height="1" />
        <rect x="3" y="5" width="2" height="1" />
        <rect x="6" y="5" width="2" height="1" />
        <rect x="0" y="6" width="8" height="1" />
        <rect x="1" y="7" width="6" height="1" />
      </symbol>
      <symbol id="px-i-controller" viewBox="0 0 14 8">
        <rect x="2" y="0" width="10" height="1" />
        <rect x="1" y="1" width="12" height="1" />
        <rect x="0" y="2" width="2" height="1" />
        <rect x="3" y="2" width="1" height="1" />
        <rect x="10" y="2" width="1" height="1" />
        <rect x="12" y="2" width="2" height="1" />
        <rect x="0" y="3" width="5" height="1" />
        <rect x="9" y="3" width="5" height="1" />
        <rect x="0" y="4" width="3" height="1" />
        <rect x="4" y="4" width="6" height="1" />
        <rect x="11" y="4" width="3" height="1" />
        <rect x="0" y="5" width="3" height="1" />
        <rect x="4" y="5" width="1" height="1" />
        <rect x="6" y="5" width="2" height="1" />
        <rect x="9" y="5" width="1" height="1" />
        <rect x="11" y="5" width="3" height="1" />
        <rect x="0" y="6" width="3" height="1" />
        <rect x="4" y="6" width="6" height="1" />
        <rect x="11" y="6" width="3" height="1" />
        <rect x="1" y="7" width="2" height="1" />
        <rect x="11" y="7" width="2" height="1" />
      </symbol>
      <symbol id="px-i-check" viewBox="0 0 7 7">
        <rect x="6" y="0" width="1" height="1" />
        <rect x="5" y="1" width="2" height="1" />
        <rect x="4" y="2" width="2" height="1" />
        <rect x="0" y="3" width="1" height="1" />
        <rect x="3" y="3" width="2" height="1" />
        <rect x="0" y="4" width="4" height="1" />
        <rect x="1" y="5" width="2" height="1" />
        <rect x="1" y="6" width="1" height="1" />
      </symbol>
      <symbol id="px-i-arrow" viewBox="0 0 8 6">
        <rect x="2" y="0" width="1" height="1" />
        <rect x="1" y="1" width="2" height="1" />
        <rect x="0" y="2" width="8" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="1" y="4" width="2" height="1" />
        <rect x="2" y="5" width="1" height="1" />
      </symbol>
      <symbol id="px-i-shield" viewBox="0 0 8 7">
        <rect x="1" y="0" width="6" height="1" />
        <rect x="0" y="1" width="8" height="1" />
        <rect x="0" y="2" width="8" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="1" y="4" width="6" height="1" />
        <rect x="2" y="5" width="4" height="1" />
        <rect x="3" y="6" width="2" height="1" />
      </symbol>
    </svg>
  );
}
