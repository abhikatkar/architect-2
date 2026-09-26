/**
 * The product's mark, drawn in tokens.
 *
 * Same geometry as app/icon.svg: two inputs meeting at one decision point, on
 * the faint grid the canvases use. The file version carries its own colours
 * because a favicon gets no stylesheet. This one takes them from the theme,
 * so a visitor who forces light or dark with the toggle gets a mark that
 * follows, which a static SVG cannot do.
 *
 * Decorative here: every place it appears sits next to the words
 * "Architect 2.0", so announcing it again would be noise.
 */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g className="stroke-rule" strokeWidth={1} opacity={0.9}>
        <path d="M7.5 2.5V29.5M24.5 2.5V29.5M2.5 7.5H29.5M2.5 24.5H29.5" />
      </g>
      <g
        className="stroke-blueprint"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      >
        <path d="M8 8 15.5 16" />
        <path d="M8 24 15.5 16" />
        <path d="M15.5 16h3.4" />
      </g>
      <circle className="fill-blueprint" cx={7.6} cy={7.6} r={3.6} />
      <circle className="fill-blueprint" cx={7.6} cy={24.4} r={3.6} />
      <circle
        className="fill-paper stroke-blueprint"
        cx={23.2}
        cy={16}
        r={4.6}
        strokeWidth={2.4}
      />
    </svg>
  );
}
