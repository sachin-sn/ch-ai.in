// Hand-authored line-icon sprite shared by the material theme's homepage
// and its light/dark ModeToggle button. Rendered once as an invisible
// <symbol> sprite and referenced elsewhere via <use href="#m-i-...">, same
// pattern as themes/pixel/PixelIcons.tsx.
export default function MaterialIcons() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ display: "none" }}>
      <symbol id="m-i-sun" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
        </g>
      </symbol>
      <symbol id="m-i-moon" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z"
        />
      </symbol>
      <symbol id="m-i-arrow" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14M13 6l6 6-6 6"
        />
      </symbol>
      <symbol id="m-i-mail" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 6.2h17v11.6h-17zM3.8 6.6l8.2 6.5 8.2-6.5"
        />
      </symbol>
      <symbol id="m-i-github" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3.2a8.8 8.8 0 0 0-2.8 17.1c.44.08.6-.19.6-.42v-1.6c-2.45.53-2.96-1.05-2.96-1.05-.4-1.02-.98-1.29-.98-1.29-.8-.55.06-.54.06-.54.89.06 1.35.91 1.35.91.78 1.34 2.06.95 2.56.73.08-.56.31-.95.55-1.17-1.96-.22-4.02-.98-4.02-4.36 0-.96.35-1.75.9-2.37-.09-.22-.4-1.12.09-2.34 0 0 .74-.24 2.42.9a8.4 8.4 0 0 1 4.4 0c1.68-1.14 2.42-.9 2.42-.9.49 1.22.18 2.12.09 2.34.56.62.9 1.41.9 2.37 0 3.39-2.07 4.13-4.04 4.35.32.28.6.82.6 1.66v2.46c0 .23.16.51.61.42A8.8 8.8 0 0 0 12 3.2z"
        />
      </symbol>
      <symbol id="m-i-linkedin" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.4" />
          <path d="M8 10.3v6.2M8 7.7v.02M12 16.5v-3.7c0-1.3.8-2.2 2-2.2s1.8.9 1.8 2.2v3.7M12 12v4.5" />
        </g>
      </symbol>
      <symbol id="m-i-leaf" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 19c8-1 12-6 13.5-13C11 6.5 6 10.5 5 19Z M6 18c3.5-3.5 6-6.5 9.5-11"
        />
      </symbol>
      <symbol id="m-i-branch" viewBox="0 0 60 200">
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M30 200V40" />
          <path d="M30 150c-10-6-16-14-16-24M30 120c12-4 18-12 18-22M30 90c-9-5-14-12-14-20M30 60c11-3 17-10 17-18" />
          <circle cx="14" cy="122" r="3.2" />
          <circle cx="48" cy="94" r="3.2" />
          <circle cx="16" cy="66" r="3.2" />
        </g>
      </symbol>
    </svg>
  );
}
