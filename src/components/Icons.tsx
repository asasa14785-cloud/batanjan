import type { ReactNode } from "react";

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const mk = (d: ReactNode) =>
  function Icon({ size = 18, fill }: { size?: number; fill?: boolean }) {
    return (
      <svg {...base} width={size} height={size} fill={fill ? "currentColor" : "none"}>
        {d}
      </svg>
    );
  };

export const IconPlay = mk(<path d="M7 4.5v15l13-7.5z" />);
export const IconPause = mk(
  <>
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </>,
);
export const IconHeart = mk(<path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" />);
export const IconDownload = mk(
  <>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </>,
);
export const IconSearch = mk(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);
export const IconWand = mk(
  <>
    <path d="m4 20 11-11" />
    <path d="m14 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    <path d="m19 12 .7 1.3L21 14l-1.3.7L19 16l-.7-1.3L17 14l1.3-.7z" />
  </>,
);
export const IconSkipNext = mk(
  <>
    <path d="M6 5v14l9-7z" />
    <path d="M18 5v14" />
  </>,
);
export const IconSkipPrev = mk(
  <>
    <path d="M18 5v14l-9-7z" />
    <path d="M6 5v14" />
  </>,
);
export const IconLoop = mk(
  <>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </>,
);
export const IconVolume = mk(
  <>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </>,
);
export const IconLink = mk(
  <>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </>,
);
export const IconChevron = mk(<path d="m6 9 6 6 6-6" />);
export const IconClose = mk(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>,
);
export const IconShuffle = mk(
  <>
    <path d="M16 3h5v5" />
    <path d="M4 20 21 3" />
    <path d="M21 16v5h-5" />
    <path d="m15 15 6 6" />
    <path d="M4 4l5 5" />
  </>,
);
export const IconCopy = mk(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </>,
);
export const IconSimilar = mk(
  <>
    <circle cx="9" cy="12" r="5" />
    <circle cx="15" cy="12" r="5" />
  </>,
);
