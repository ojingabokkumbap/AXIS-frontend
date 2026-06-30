// Icon library — minimal stroke icons used throughout AXIS Admin
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 1.75 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round"
  };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    bank: <><path d="M3 10l9-6 9 6"/><path d="M5 10v9h14v-9"/><path d="M9 19v-6M15 19v-6"/></>,
    card: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    monitor: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    grading: <><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 13l2 2 5-5"/></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M5 5H3a2 2 0 0 0 0 4h2M19 5h2a2 2 0 0 1 0 4h-2"/><path d="M10 14v3h4v-3M8 20h8"/></>,
    megaphone: <><path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V5l-5 4H5a2 2 0 0 0-2 2z"/><path d="M16 9a3 3 0 0 1 0 6"/></>,
    chart: <><path d="M4 19h16"/><rect x="6" y="11" width="3" height="8"/><rect x="11" y="6" width="3" height="13"/><rect x="16" y="14" width="3" height="5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    download: <><path d="M12 4v12M6 12l6 4 6-4M4 20h16"/></>,
    upload: <><path d="M12 16V4M6 8l6-4 6 4M4 20h16"/></>,
    chevronR: <><path d="M9 6l6 6-6 6"/></>,
    chevronL: <><path d="M15 6l-9 6 9 6"/></>,
    chevronD: <><path d="M6 9l6 6 6-6"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18"/></>,
    edit: <><path d="M14 4l6 6-12 12H2v-6z"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/></>,
    alert: <><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></>,
    check: <><path d="M5 12l5 5L20 7"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    refresh: <><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 21v-5h5"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M9 12h12"/></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 14h6M9 18h4"/></>,
    flag: <><path d="M4 21V4h12l-2 4 2 4H4"/></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown: <><path d="M12 5v14M5 12l7 7 7-7"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    stop: <><rect x="5" y="5" width="14" height="14" rx="2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
};

window.Icon = Icon;
