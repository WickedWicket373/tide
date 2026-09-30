import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function strokeIcon(paths: ReactNode) {
  return function TideIcon({ width = 18, height = 18, ...props }: IconProps) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const SvgTideHome = strokeIcon(
  <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
);
export const SvgTideCard = strokeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </>,
);
export const SvgTideLayers = strokeIcon(
  <>
    <path d="m12 3 9 5-9 5-9-5 9-5z" />
    <path d="m3 13 9 5 9-5" />
  </>,
);
export const SvgTidePie = strokeIcon(
  <>
    <path d="M12 3v9h9" />
    <circle cx="12" cy="12" r="9" />
  </>,
);
export const SvgTideTrend = strokeIcon(
  <>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>,
);
export const SvgTideTarget = strokeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </>,
);
export const SvgTideSettings = strokeIcon(
  <>
    <path d="M4 7h9" />
    <path d="M17 7h3" />
    <circle cx="15" cy="7" r="2" />
    <path d="M4 17h3" />
    <path d="M11 17h9" />
    <circle cx="9" cy="17" r="2" />
  </>,
);
export const SvgTideRefresh = strokeIcon(
  <>
    <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" />
    <path d="M20 20v-4h-4" />
  </>,
);
export const SvgTideCheck = strokeIcon(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const SvgTideArrowUp = strokeIcon(
  <>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </>,
);
export const SvgTideArrowDown = strokeIcon(
  <>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </>,
);
export const SvgTideCalendar = strokeIcon(
  <>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </>,
);
export const SvgTideChart = strokeIcon(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </>,
);
export const SvgTideStore = strokeIcon(
  <>
    <path d="M4 10v10h16V10" />
    <path d="M3 10 5 4h14l2 6z" />
    <path d="M10 20v-5h4v5" />
  </>,
);
export const SvgTideRules = strokeIcon(
  <>
    <path d="M8 6h12" />
    <path d="M8 12h12" />
    <path d="M8 18h12" />
    <path d="m3 6 1 1 2-2" />
    <path d="m3 12 1 1 2-2" />
    <path d="m3 18 1 1 2-2" />
  </>,
);
export const SvgTideBank = strokeIcon(
  <>
    <path d="M3 10 12 4l9 6" />
    <path d="M5 10v8" />
    <path d="M10 10v8" />
    <path d="M14 10v8" />
    <path d="M19 10v8" />
    <path d="M3 20h18" />
  </>,
);
export const SvgTideTag = strokeIcon(
  <>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </>,
);
export const SvgTideChevronDown = strokeIcon(<path d="m6 9 6 6 6-6" />);
export const SvgTideChevronRight = strokeIcon(<path d="m9 6 6 6-6 6" />);
