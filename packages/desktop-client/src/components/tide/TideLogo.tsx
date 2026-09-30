type TideLogoMarkProps = {
  size?: number;
};

/** The Tide mark: two waves on a teal tile. */
export function TideLogoMark({ size = 30 }: TideLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="30" height="30" rx="9" fill="#0e7c72" />
      <path
        d="M7 12.5c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M7 18c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0"
        fill="none"
        stroke="#9fe6d2"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
