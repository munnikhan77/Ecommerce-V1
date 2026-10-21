// Thin-line icons, all drawn on a 24×24 grid. Usage: <Icon name="bag" />
const paths = {
  bag: <path d="M6 7h12l1 13H5L6 7Zm3 0V6a3 3 0 0 1 6 0v1" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m5-5-5 5 5 5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  trash: <path d="M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6H14v-6h2.5l.5-3.5h-3V8Z" />,
  tiktok: <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.4 2 4 4.5 4.2" />,
  package: <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Zm0 0 8 3.5 8-3.5M12 11v9" />,
  truck: <path d="M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6ZM7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01" />,
  refresh: <path d="M19 8a7.5 7.5 0 0 0-13.5 1M5 16a7.5 7.5 0 0 0 13.5-1M19 4v4h-4M5 20v-4h4" />,
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  logout: <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />,
  grid: <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
    </>
  ),
  tag: <path d="M4 4h7l9 9-7 7-9-9V4Zm4.5 4.5h.01" />,
};

export default function Icon({ name, size = 20, strokeWidth = 1.3, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
