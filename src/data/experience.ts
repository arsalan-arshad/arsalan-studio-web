export type ExperienceItem = {
  id: string;
  period: string;
  title: string;
  org: string;
  /** One-line summary for timeline scan */
  detail: string;
  /** Resume-backed bullets (Arsalan_Arshad_Resume.pdf) */
  bullets: string[];
  /** Honest labels for scanning — only when resume/site evidence supports them */
  highlights?: string[];
};

/**
 * Worker history from resume (Arsalan_Arshad_Resume.pdf) — he is the worker, not hiring.
 * Dates, titles, and bullets kept honest to the PDF. Digitize Turf is past-company
 * framing on the studio story, not a dated resume row.
 */
export const experience: ExperienceItem[] = [
  {
    id: "sustainable-infra",
    period: "Apr 2025 – Aug 2026",
    title: "Full Stack Developer (Contractor)",
    org: "Sustainable Infrastructure Company",
    detail:
      "React/Vite IoT dashboards, Azure telemetry, GIS overlays, and a digital-twin panel configurator with RBAC and audit logging.",
    highlights: ["Contractor", "Web + cloud"],
    bullets: [
      "Built responsive IoT dashboards (React/Vite), including Thermal AC Cineplex Control for HVAC telemetry and automated control cycles.",
      "Scaled Azure IoT Hub / Functions backends for high-frequency sensor streams; GitHub Actions → Azure CI/CD with Key Vault / Actions secrets.",
      "GIS map overlays with custom raster layers and dynamic sensors for physical infrastructure assets.",
      "Drag-and-drop digital twin configurator (busbars / HACS) with RBAC, server-side validation, and audit/change history on frontend and backend.",
      "Python ETL for sensor payload schema checks, duplicate/out-of-order detection, and anomaly flags.",
    ],
  },
  {
    id: "ketene",
    period: "Feb 2024 – Feb 2025",
    title: "Senior Software Engineer",
    org: "Ketene IT Service Company",
    detail:
      "Fastlane CI/CD for iOS and Android store releases, cloud-native backends, and AI-assisted delivery.",
    highlights: ["Mobile CI/CD", "iOS & Android"],
    bullets: [
      "Designed Fastlane CI/CD for iOS and Android — App Store and Google Play automation.",
      "Owned the full mobile release lifecycle for production apps.",
      "Cloud-native backends and databases on AWS, Firebase, and Azure.",
      "Used AI developer tools (Claude Code, Cursor, related workflows) to cut debt and ship faster.",
    ],
  },
  {
    id: "booksport",
    period: "Apr 2023 – Aug 2023",
    title: "Lead Full Stack Developer",
    org: "BookSport Sports Startup",
    detail:
      "Led mobile (iOS/Android) and web platform revamp with MERN + Firebase and store CI/CD.",
    highlights: ["Startup", "Mobile + web lead"],
    bullets: [
      "Led iOS, Android, and web platform revamp with a modern, scalable architecture.",
      "CI/CD for App Store, Google Play, and web deployments.",
      "MERN stack (MongoDB, Express, React, Node.js) integrated with Firebase.",
    ],
  },
  {
    id: "hoome",
    period: "Mar 2022 – Dec 2022",
    title: "Full Stack Mobile Developer",
    org: "Hoome",
    detail:
      "React Native cross-platform AR apps with automated store releases and Firebase auth/realtime.",
    highlights: ["React Native", "AR mobile"],
    bullets: [
      "React Native cross-platform Augmented Reality (AR) mobile apps.",
      "App Store and Google Play automated production releases and CI/CD.",
      "Firebase auth, realtime database, and backend services.",
    ],
  },
  {
    id: "rpl",
    period: "Aug 2021 – Feb 2022",
    title: "Lead Mobile Developer",
    org: "RPL University Mentorship",
    detail:
      "Led React Native mentorship platform with OpenTok video/chat and store publishing pipelines.",
    highlights: ["React Native lead", "Education"],
    bullets: [
      "Led React Native iOS/Android mentorship platform development.",
      "Real-time video (OpenTok) and chat with session/token access control for rooms and calls.",
      "TestFlight and automated App Store / Google Play publishing pipelines.",
    ],
  },
  {
    id: "waywiser",
    period: "Oct 2020 – Jul 2021",
    title: "Lead Full Stack Developer",
    org: "Waywiser Social Platform",
    detail:
      "Led mobile and web social product work — notifications, blog, chat, calendar booking; Node/Express backends.",
    highlights: ["Startup-style product", "Mobile + web"],
    bullets: [
      "Led mobile and web social platform development and feature work.",
      "Core features: notifications, blog posts, chat, and calendar booking.",
      "Node.js / Express backend services.",
    ],
  },
  {
    id: "freelance",
    period: "Nov 2019 – Present",
    title: "Freelance Software Engineer",
    org: "Fiverr, Toptal & Upwork",
    detail:
      "5+ years delivering custom mobile and web work for global clients; AI-enhanced workflows for quality and speed.",
    highlights: ["Remote / global clients", "Marketplaces"],
    bullets: [
      "5+ years on Fiverr delivering custom mobile and web solutions for global clients (resume notes a 5-star delivery rating).",
      "Active on Upwork; Toptal profile live (resume: joined Toptal August 2026) alongside ongoing Fiverr work.",
      "AI-enhanced workflows (Claude Code, Cursor, Antigravity) for productivity and code quality.",
    ],
  },
  {
    id: "digital-leap",
    period: "Apr 2019 – Dec 2020",
    title: "Full Stack Mobile Developer",
    org: "Digital Leap Karachi",
    detail:
      "Full-stack web and mobile with React, React Native, and Node.js alongside design, backend, and PM partners.",
    highlights: ["React Native", "Karachi"],
    bullets: [
      "Full-stack web and mobile apps with React, React Native, and Node.js.",
      "Collaborated with design, backend, and project managers on client milestones.",
    ],
  },
  {
    id: "ingenious",
    period: "May 2018 – Dec 2018",
    title: "Android Native Developer",
    org: "Ingenious.pk Karachi",
    detail:
      "Native Android with Java, Kotlin, and XML; agile ceremonies, code reviews, and API design.",
    highlights: ["Android native"],
    bullets: [
      "Native Android apps with Java, Kotlin, and XML layouts.",
      "Agile ceremonies, code reviews, and API design participation.",
    ],
  },
];
