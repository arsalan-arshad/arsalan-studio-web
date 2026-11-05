export type ExperienceItem = {
  id: string;
  period: string;
  title: string;
  org: string;
  detail: string;
};

/**
 * Worker history from resume (Arsalan_Arshad_Resume.pdf) — he is the worker, not hiring.
 * Dates and titles kept honest to the PDF.
 */
export const experience: ExperienceItem[] = [
  {
    id: "sustainable-infra",
    period: "Apr 2025 – Aug 2026",
    title: "Full Stack Developer (Contractor)",
    org: "Sustainable Infrastructure Company",
    detail:
      "React/Vite IoT dashboards (Thermal AC Cineplex), Azure IoT Hub/Functions telemetry, GIS overlays, digital-twin busbar/HACS configurator with RBAC and audit logging, GitHub Actions → Azure CI/CD, Python ETL for sensor integrity.",
  },
  {
    id: "ketene",
    period: "Feb 2024 – Feb 2025",
    title: "Senior Software Engineer",
    org: "Ketene IT Service Company",
    detail:
      "Fastlane CI/CD for iOS and Android (App Store & Google Play), full mobile release lifecycle, cloud-native backends on AWS/Firebase/Azure, AI-assisted delivery to reduce debt and speed shipping.",
  },
  {
    id: "booksport",
    period: "Apr 2023 – Aug 2023",
    title: "Lead Full Stack Developer",
    org: "BookSport Sports Startup",
    detail:
      "Led mobile (iOS/Android) and web platform revamp; CI/CD for stores and web; MERN + Firebase.",
  },
  {
    id: "hoome",
    period: "Mar 2022 – Dec 2022",
    title: "Full Stack Mobile Developer",
    org: "Hoome",
    detail:
      "React Native cross-platform AR apps; App Store / Play automated releases; Firebase auth and realtime.",
  },
  {
    id: "rpl",
    period: "Aug 2021 – Feb 2022",
    title: "Lead Mobile Developer",
    org: "RPL University Mentorship",
    detail:
      "Led React Native mentorship platform; OpenTok video + chat with session/token access control; TestFlight and store pipelines.",
  },
  {
    id: "waywiser",
    period: "Oct 2020 – Jul 2021",
    title: "Lead Full Stack Developer",
    org: "Waywiser Social Platform",
    detail:
      "Led mobile and web social product work — notifications, blog, chat, calendar booking; Node/Express backends.",
  },
  {
    id: "freelance",
    period: "Nov 2019 – Present",
    title: "Freelance Software Engineer",
    org: "Fiverr, Toptal & Upwork",
    detail:
      "5+ years delivering custom mobile and web work for global clients on Fiverr; active on Upwork; Toptal profile live. AI-enhanced workflows (Claude Code, Cursor) for quality and speed.",
  },
  {
    id: "digital-leap",
    period: "Apr 2019 – Dec 2020",
    title: "Full Stack Mobile Developer",
    org: "Digital Leap Karachi",
    detail:
      "Full-stack web and mobile with React, React Native, and Node.js; collaborated with design, backend, and PMs on client milestones.",
  },
  {
    id: "ingenious",
    period: "May 2018 – Dec 2018",
    title: "Android Native Developer",
    org: "Ingenious.pk Karachi",
    detail:
      "Native Android with Java, Kotlin, and XML; agile ceremonies, code reviews, and API design.",
  },
];
