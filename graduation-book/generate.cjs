const {   Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,   Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,   ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,   TableOfContents, ImageRun, ExternalHyperlink } = require('docx')
const fs = require('fs');

// ── Helpers ────────────────────────────────────────────────────────────────── const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })] })
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 36, color: '1F4E79' })] })
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 28, color: '2E75B6' })] })
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, size: 24, color: '2E75B6' })] })
const BREAK = () => new Paragraph({ children: [new PageBreak()] })
const SPACE = () => new Paragraph({ children: [new TextRun('')] })
const BODY = (text) => new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text, size: 24 })] })
const BULLET = (text) => new Paragraph({   numbering: { reference: 'bullets', level: 0 },   spacing: { after: 120 },   children: [new TextRun({ text, size: 24 })] })
const NUMBERED = (text) => new Paragraph({   numbering: { reference: 'numbers', level: 0 },   spacing: { after: 120 },   children: [new TextRun({ text, size: 24 })] });
// ── Table Helpers ───────────────────────────────────────────────────────────── const border = { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' }
const borders = { top: border, bottom: border, left: border, right: border };
const headerCell = (text, width) => new TableCell({   borders,   width: { size: width, type: WidthType.DXA },   shading: { fill: '1F4E79', type: ShadingType.CLEAR },   margins: { top: 80, bottom: 80, left: 120, right: 120 },   children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 22 })] })] });
const dataCell = (text, width, center = false, bg = 'FFFFFF') => new TableCell({   borders,   width: { size: width, type: WidthType.DXA },   shading: { fill: bg, type: ShadingType.CLEAR },   margins: { top: 80, bottom: 80, left: 120, right: 120 },   children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text, size: 22 })] })] });
const simpleTable = (headers, rows, widths) => new Table({   width: { size: 9360, type: WidthType.DXA },   columnWidths: widths,   rows: [     new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),     ...rows.map((row, ri) => new TableRow({       children: row.map((cell, ci) => dataCell(cell, widths[ci], false, ri % 2 === 0 ? 'F5F8FF' : 'FFFFFF'))     }))   ] });
// ── Cover Page ──────────────────────────────────────────────────────────────── const coverPage = [   SPACE(), SPACE(), SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Faculty of Computers and Information', size: 28, bold: true, color: '1F4E79' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Menoufia University', size: 28, bold: true, color: '1F4E79' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Department of Information Technology', size: 24, color: '2E75B6' })] }),   SPACE(), SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: '─────────────────────────────────', size: 24, color: '2E75B6' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: 'Graduation Project Report', size: 32, bold: true, color: '1F4E79' })] }),   SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Smart Network Simulation Labs', size: 44, bold: true, color: '1F4E79' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'محاكي التدريب العملي للشبكات', size: 32, bold: true, color: '2E75B6' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: '─────────────────────────────────', size: 24, color: '2E75B6' })] }),   SPACE(), SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'Submitted By:', size: 24, bold: true, color: '1F4E79' })] }),   ...[      'Youssef Ali Mostafa Frhat',     'Youssef Khaled Mohamed Hasnain Rizk',     'El-Sayed Mohamed El-Ghandour',     'Ahmed Mahmoud Mohamed Salem',     'Fathy Ibrahim Wahba Gadallah',     'Seif Hamdy Abdeldayem Ahmed',   ].map(name => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: name, size: 24, color: '333333' })] })),   SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'Under the Supervision of:', size: 24, bold: true, color: '1F4E79' })] }),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Dr. Amina El-Mahalawi', size: 24, color: '333333' })] }),   SPACE(), SPACE(),   new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Academic Year 2025 / 2026', size: 24, bold: true, color: '1F4E79' })] }),   BREAK(), ];
// ── Abstract ────────────────────────────────────────────────────────────────── const abstractSection = [   H1('Abstract'),   SPACE(),   BODY('Smart Network Simulation Labs (Smart IT Lab) is a full-stack web-based platform designed to address a critical educational challenge faced by Information Technology students: the inability to perform hands-on networking labs due to hardware limitations or the absence of capable devices. Traditional networking education requires specialized equipment such as Cisco routers and switches, along with resource-intensive simulation software, which many students cannot access.'),   SPACE(),   BODY('This project delivers a browser-based solution that simulates real Cisco IOS command-line interface (CLI) environments, allowing students to practice OSPF, VLAN, ACL, BGP, CCNA, and other networking protocols from any device — including laptops, tablets, and mobile phones — with zero hardware requirements.'),   SPACE(),   BODY('The platform features a live terminal engine with stateful Cisco IOS simulation, automated objective validation, real-time progress tracking, an achievement system, a competitive leaderboard, and full administrative control. It is built using modern web technologies including React 18, Node.js, Express, and MongoDB, and is deployed on a production-grade infrastructure using DevOps and DevSecOps practices including CI/CD pipelines, containerization, automated security scanning, and continuous monitoring.'),   SPACE(),   BODY('Beyond solving the educational problem, this project serves as a comprehensive demonstration of the team\'s acquired skills in full-stack development, cloud deployment, DevOps engineering, and DevSecOps — applying industry-standard tools and methodologies to deliver a secure, scalable, and production-ready system.'),   BREAK(), ];
// ── Chapter 1: Introduction ─────────────────────────────────────────────────── const chapter1 = [   H1('Chapter 1: Introduction'),   SPACE(),   H2('1.1 Background and Motivation'),   BODY('The field of Information Technology education, particularly in networking and infrastructure domains, has long relied on physical laboratory environments. Students pursuing certifications such as CCNA, CompTIA Network+, and similar qualifications require hands-on experience configuring routers, switches, and network topologies using real or simulated equipment.'),   SPACE(),   BODY('However, a significant barrier exists: networking simulation software such as Cisco Packet Tracer and GNS3 demands considerable computational resources, while physical lab access is limited to university hours. Students with low-specification laptops or tablets — or those without personal computers entirely — are effectively excluded from practical preparation.'),   SPACE(),   BODY('At the Faculty of Computers and Information, Menoufia University, this challenge is particularly evident. Many students struggle to complete lab exercises at home, leading to reduced practical competency and lower performance in professional certification exams.'),   SPACE(),   H2('1.2 Problem Statement'),   BODY('The core problem addressed by this project can be summarized as follows:'),   BULLET('Students with limited hardware capabilities cannot install or run networking simulation software.'),   BULLET('Students without personal computers have no access to hands-on lab practice outside university.'),   BULLET('Existing web-based solutions lack authentic Cisco IOS command simulation and real-time validation.'),   BULLET('There is no unified platform that combines lab practice, progress tracking, achievements, and competitive learning for IT students.'),   SPACE(),   H2('1.3 Proposed Solution'),   BODY('Smart IT Lab proposes a fully browser-based networking simulation platform that:'),   NUMBERED('Simulates authentic Cisco IOS CLI environments accessible from any browser on any device.'),   NUMBERED('Provides 46 structured lab exercises covering OSPF, VLAN, ACL, BGP, CCNA, and Network Fundamentals.'),   NUMBERED('Validates student commands in real-time and provides instant feedback on objective completion.'),   NUMBERED('Tracks student progress, scores, streaks, and achievements across all labs.'),   NUMBERED('Enables competitive learning through a weekly and monthly leaderboard system.'),   NUMBERED('Provides administrators with a management dashboard for user oversight and platform monitoring.'),   SPACE(),   H2('1.4 Project Objectives'),   BODY('The primary objectives of this project are:'),   BULLET('Develop a production-ready web application that accurately simulates Cisco IOS networking environments.'),   BULLET('Deliver a responsive user interface accessible on desktops, tablets, and mobile devices.'),   BULLET('Implement a secure authentication system with JWT tokens, refresh token rotation, and OAuth integration.'),   BULLET('Deploy the application using industry-standard DevOps practices including containerization, CI/CD, and automated testing.'),   BULLET('Apply DevSecOps principles including automated security scanning, vulnerability detection, and secret management.'),   BULLET('Demonstrate the team\'s proficiency in full-stack development, cloud infrastructure, and security engineering as a graduation deliverable.'),   SPACE(),   H2('1.5 Project Scope'),   BODY('The project encompasses the following scope:'),   BULLET('Frontend: A React 18 single-page application with responsive design for all device sizes.'),   BULLET('Backend: A Node.js/Express REST API with stateful IOS simulation engine.'),   BULLET('Database: MongoDB with Mongoose ODM, seeded with 46 labs and 13 achievements.'),   BULLET('Infrastructure: Docker containerization, Railway cloud hosting, MongoDB Atlas.'),   BULLET('DevOps: GitHub Actions CI/CD pipeline with automated build, test, and deployment.'),   BULLET('DevSecOps: Trivy Docker scanning, Gitleaks secret detection, Semgrep code analysis, Dependabot dependency management.'),   BULLET('Monitoring: UptimeRobot availability monitoring, Sentry error tracking, k6 load testing.'),   SPACE(),   H2('1.6 Report Organization'),   BODY('This report is organized as follows:'),   BULLET('Chapter 2 provides a literature review of existing networking simulation tools.'),   BULLET('Chapter 3 describes the system requirements analysis and use cases.'),   BULLET('Chapter 4 presents the system design including architecture, database, and UI.'),   BULLET('Chapter 5 details the implementation of all system modules.'),   BULLET('Chapter 6 covers the DevOps and DevSecOps pipeline implementation.'),   BULLET('Chapter 7 presents testing results including load testing and security analysis.'),   BULLET('Chapter 8 concludes the report with achievements and future work.'),   BREAK(), ];
// ── Chapter 2: Literature Review ────────────────────────────────────────────── const chapter2 = [   H1('Chapter 2: Literature Review'),   SPACE(),   H2('2.1 Overview of Network Simulation Tools'),   BODY('Network simulation and emulation tools have been central to networking education for decades. This chapter reviews the most prominent existing tools, identifies their limitations, and positions Smart IT Lab as a complementary solution addressing unmet needs.'),   SPACE(),   H2('2.2 Existing Tools and Their Limitations'),   SPACE(),   H3('2.2.1 Cisco Packet Tracer'),   BODY('Cisco Packet Tracer is the most widely used network simulation tool in academic settings. It provides a graphical interface for building network topologies and simulating Cisco device behavior. However, it requires local installation, consumes significant RAM and CPU resources, and is restricted to Windows and macOS platforms. Students using Android tablets, Chromebooks, or low-specification devices cannot use it effectively.'),   SPACE(),   H3('2.2.2 GNS3'),   BODY('GNS3 (Graphical Network Simulator-3) offers more realistic simulation by running actual Cisco IOS images. It is preferred for professional training but requires powerful hardware, complex setup, and licensed IOS images. It is entirely unsuitable for students with basic computing devices.'),   SPACE(),   H3('2.2.3 EVE-NG'),   BODY('EVE-NG (Emulated Virtual Environment Next Generation) is a professional-grade network emulation platform used in enterprise training environments. It requires a dedicated server and is not accessible to individual students without significant infrastructure.'),   SPACE(),   H3('2.2.4 Web-Based Alternatives'),   BODY('Several web-based networking labs exist, such as Cisco\'s Skills for All platform and NetAcad. While accessible via browsers, these platforms are restricted to Cisco\'s own curriculum, do not offer open lab environments, lack achievement and leaderboard systems, and do not provide the gamified learning experience that increases student engagement.'),   SPACE(),   H2('2.3 Comparison Summary'),   SPACE(),   simpleTable(     ['Feature', 'Packet Tracer', 'GNS3', 'Cisco Skills', 'Smart IT Lab'],     [       ['Browser-based', '✗', '✗', 'Partial', '✓'],       ['Mobile support', '✗', '✗', 'Limited', '✓'],       ['Zero installation', '✗', '✗', '✓', '✓'],       ['Cisco IOS CLI', '✓', '✓', 'Limited', '✓'],       ['Progress tracking', 'Limited', '✗', 'Limited', '✓'],       ['Achievements', '✗', '✗', 'Limited', '✓'],       ['Leaderboard', '✗', '✗', '✗', '✓'],       ['Open lab design', '✓', '✓', '✗', '✓'],       ['Free access', '✓', '✓', 'Partial', '✓'],     ],     [2800, 1640, 1240, 1440, 2240]   ),   SPACE(),   H2('2.4 Positioning of Smart IT Lab'),   BODY('Smart IT Lab fills the gap between professional-grade tools that require powerful hardware and limited web-based platforms that lack authentic CLI simulation. By delivering a stateful Cisco IOS engine in a browser, Smart IT Lab democratizes networking education, making it accessible to every student regardless of their device capabilities.'),   BREAK(), ];
// ── Chapter 3: Requirements ─────────────────────────────────────────────────── const chapter3 = [   H1('Chapter 3: System Requirements Analysis'),   SPACE(),   H2('3.1 Stakeholders'),   BODY('The primary stakeholders of Smart IT Lab are:'),   BULLET('Students: IT students who need to practice networking labs for coursework and professional certifications.'),   BULLET('Instructors/Supervisors: Faculty members who monitor student progress and platform usage.'),   BULLET('Administrators: Platform administrators who manage users, labs, and system health.'),   SPACE(),   H2('3.2 Functional Requirements'),   SPACE(),   H3('3.2.1 Authentication Module'),   BULLET('FR-01: Users shall be able to register with email and password.'),   BULLET('FR-02: Users shall be able to log in and receive JWT access tokens (15-minute expiry) and refresh tokens (7-day expiry, httpOnly cookie).'),   BULLET('FR-03: The system shall support GitHub and Google OAuth 2.0 authentication.'),   BULLET('FR-04: Users shall be able to request password reset via email.'),   BULLET('FR-05: Email verification shall be required upon registration.'),   SPACE(),   H3('3.2.2 Lab Module'),   BULLET('FR-06: Students shall be able to browse 46 available labs filterable by difficulty, category, and search.'),   BULLET('FR-07: Students shall be able to start, stop, and save progress on any lab.'),   BULLET('FR-08: The system shall provide a real-time CLI terminal simulating Cisco IOS.'),   BULLET('FR-09: The system shall automatically validate student commands against lab objectives.'),   BULLET('FR-10: Network topology diagrams shall be displayed for each lab.'),   SPACE(),   H3('3.2.3 Progress and Gamification Module'),   BULLET('FR-11: The system shall track labs completed, score, and time spent per student.'),   BULLET('FR-12: Students shall earn achievements upon completing specific milestones.'),   BULLET('FR-13: A weekly and monthly leaderboard shall rank students by points.'),   BULLET('FR-14: Students shall maintain streaks for consecutive daily lab activity.'),   SPACE(),   H3('3.2.4 Admin Module'),   BULLET('FR-15: Administrators shall be able to view and manage all user accounts.'),   BULLET('FR-16: Administrators shall be able to suspend or deactivate user accounts.'),   BULLET('FR-17: Administrators shall view platform analytics including active users and lab statistics.'),   BULLET('FR-18: Server health metrics shall be displayed in the admin dashboard.'),   SPACE(),   H2('3.3 Non-Functional Requirements'),   SPACE(),   simpleTable(     ['ID', 'Category', 'Requirement'],     [       ['NFR-01', 'Performance', 'API response time < 2 seconds for 95th percentile under 50 concurrent users'],       ['NFR-02', 'Availability', 'System uptime ≥ 99% measured by continuous monitoring'],       ['NFR-03', 'Security', 'All passwords hashed with bcrypt (cost factor 12); secrets rotated and never committed to VCS'],       ['NFR-04', 'Scalability', 'Stateless API design with JWT to support horizontal scaling'],       ['NFR-05', 'Responsiveness', 'UI fully functional on screens from 320px to 4K resolution'],       ['NFR-06', 'Compatibility', 'Supported on Chrome, Firefox, Safari, Edge, and mobile browsers'],       ['NFR-07', 'Maintainability', 'Code organized in feature modules with Zod validation and ESM imports'],       ['NFR-08', 'Security', 'Docker images scanned for vulnerabilities; zero critical unresolved issues'],     ],     [1200, 1800, 6360]   ),   BREAK(), ];
// ── Chapter 4: System Design ────────────────────────────────────────────────── const chapter4 = [   H1('Chapter 4: System Design'),   SPACE(),   H2('4.1 System Architecture'),   BODY('Smart IT Lab follows a three-tier architecture consisting of a React SPA frontend, a Node.js/Express backend API, and a MongoDB database, all connected through HTTPS with JWT-based stateless authentication.'),   SPACE(),   H3('4.1.1 Architecture Overview'),   BODY('The system is deployed as two independent services on Railway cloud platform:'),   BULLET('Frontend Service: Static React SPA served by Nginx, accessible at smart-it-lab-production.up.railway.app'),   BULLET('Backend Service: Node.js Express API (beautiful-encouragement-production.up.railway.app)'),   BULLET('Database: MongoDB Atlas M0 cluster in eu-west-1 (Ireland)'),   SPACE(),   H3('4.1.2 Communication Flow'),   BODY('The browser communicates with the backend exclusively via HTTPS REST API calls. The frontend uses Axios with withCredentials: true to send the httpOnly refresh cookie alongside API requests. Server-Sent Events (SSE) are used for real-time lab event streaming from the backend to the browser.'),   SPACE(),   H2('4.2 Technology Stack'),   SPACE(),   simpleTable(     ['Layer', 'Technology', 'Version', 'Purpose'],     [       ['Frontend', 'React', '18.3.1', 'UI framework'],       ['Frontend', 'TypeScript', '5.x', 'Type safety'],       ['Frontend', 'Vite', '6.3.5', 'Build tool'],       ['Frontend', 'TailwindCSS', '4.1.12', 'Utility-first styling'],       ['Frontend', 'shadcn/Radix UI', 'Latest', 'Component library'],       ['Backend', 'Node.js', '20 LTS', 'JavaScript runtime'],       ['Backend', 'Express', '4.18.2', 'HTTP framework'],       ['Backend', 'Mongoose', '9.2.1', 'MongoDB ODM'],       ['Backend', 'Passport.js', 'Latest', 'OAuth authentication'],       ['Backend', 'Zod', 'Latest', 'Request validation'],       ['Database', 'MongoDB Atlas', 'M0 Free', 'Document database'],       ['Hosting', 'Railway', 'Cloud', 'PaaS deployment'],       ['CDN/DNS', 'Cloudflare', 'Free', 'DNS and CDN'],     ],     [1800, 2000, 1600, 3960]   ),   SPACE(),   H2('4.3 Database Design'),   SPACE(),   H3('4.3.1 Collections Overview'),   BODY('The MongoDB database contains eight collections organized around the core domain entities:'),   SPACE(),   simpleTable(     ['Collection', 'Purpose', 'Key Indexes'],     [       ['users', 'Student and admin accounts', 'email (unique), provider+providerId (unique)'],       ['labs', 'Lab definitions and topology', 'labId (unique)'],       ['userlabs', 'Student progress per lab', 'userId+labId (unique compound)'],       ['achievements', 'Achievement definitions', 'achievementId (unique)'],       ['userachievements', 'Student achievement records', 'userId+achievementId (unique compound)'],       ['leaderboardentries', 'Weekly/monthly rankings', 'userId+period+weekOf (unique compound)'],       ['usersettings', 'UI preferences per user', 'userId (unique)'],       ['servermetrics', 'Admin server monitoring', 'serverId (unique)'],     ],     [2400, 3500, 3460]   ),   SPACE(),   H3('4.3.2 Entity Relationships'),   BODY('The database follows a document-oriented design with the following relationships:'),   BULLET('Users ↔ Labs: Many-to-Many via UserLabs junction collection (one record per student per lab).'),   BULLET('Users ↔ Achievements: Many-to-Many via UserAchievements (one record per student per achievement).'),   BULLET('Users → LeaderboardEntries: One-to-Many (one entry per student per period per week).'),   BULLET('Users → UserSettings: One-to-One (settings created on registration).'),   BULLET('ServerMetrics: Standalone collection for admin monitoring, no foreign keys.'),   SPACE(),   H2('4.4 API Design'),   BODY('The backend exposes a RESTful API under the /api prefix. All responses follow a consistent envelope: { success: boolean, message?: string, data?: any }. Rate limiting is applied globally with stricter limits on authentication endpoints.'),   SPACE(),   simpleTable(     ['Route Group', 'Base Path', 'Key Endpoints'],     [       ['Authentication', '/api/auth', 'register, login, logout, refresh-token, me, verify-email, forgot-password, reset-password, github/callback, google/callback'],       ['Labs', '/api/labs', 'GET /, GET /:id, POST /:id/start, POST /:id/stop, POST /:id/save-progress, POST /:id/terminal'],       ['Achievements', '/api/achievements', 'GET /, POST /:id/unlock'],       ['Leaderboard', '/api/leaderboard', 'GET /?period=weekly|monthly'],       ['Settings', '/api/settings', 'GET /, PATCH /, PATCH /profile, PATCH /password, PATCH /avatar, DELETE /account'],       ['Admin Users', '/api/users', 'GET /, GET /:id, PATCH /:id, DELETE /:id, PATCH /:id/suspend'],       ['Admin Analytics', '/api/admin', 'GET /stats, GET /servers, GET /activity'],       ['Events (SSE)', '/api/events', 'GET /lab/:id?token= (real-time lab events)'],       ['Health', '/api/health', 'GET / (returns uptime, status, version)'],     ],     [2000, 2000, 5360]   ),   SPACE(),   H2('4.5 Security Design'),   BODY('Security is a foundational concern in Smart IT Lab, implemented at multiple layers:'),   SPACE(),   H3('4.5.1 Authentication Security'),   BULLET('Passwords hashed with bcrypt at cost factor 12.'),   BULLET('JWT access tokens expire after 15 minutes; refresh tokens after 7 days.'),   BULLET('Refresh tokens stored as httpOnly, Secure, SameSite=Strict cookies.'),   BULLET('Email and password reset tokens stored as SHA-256 hashes in the database.'),   BULLET('OAuth tokens verified against provider APIs before account creation.'),   SPACE(),   H3('4.5.2 API Security'),   BULLET('Helmet.js sets security headers including HSTS, X-Frame-Options, and CSP.'),   BULLET('CORS configured to accept only the production frontend domain.'),   BULLET('Express rate limiter applied globally with stricter limits on /api/auth.'),   BULLET('All request bodies validated with Zod schemas before processing.'),   BULLET('trust proxy enabled for correct IP detection behind Railway\'s edge.'),   BREAK(), ];
// ── Chapter 5: Implementation ───────────────────────────────────────────────── const chapter5 = [   H1('Chapter 5: System Implementation'),   SPACE(),   H2('5.1 Frontend Implementation'),   SPACE(),   H3('5.1.1 Application Structure'),   BODY('The React frontend is organized as a feature-based SPA with the following structure:'),   BULLET('src/app/App.tsx: Root component providing Theme, Language, Auth, and Labs context providers.'),   BULLET('src/app/routes.tsx: Centralized route definitions using createBrowserRouter.'),   BULLET('src/app/contexts/: Authentication, theme, language, and labs state management.'),   BULLET('src/app/pages/: One component per route (Landing, Dashboard, Labs, LabInterface, Admin).'),   BULLET('src/app/services/: Axios singleton with interceptors for token refresh.'),   BULLET('src/app/hooks/useLabEvents.ts: EventSource hook for SSE lab events.'),   SPACE(),   H3('5.1.2 Key UI Screens'),   BODY('The application provides the following primary screens:'),   BULLET('Landing Page: Marketing page with features, team section, and CTA.'),   BULLET('Dashboard: Student overview with active labs, completed labs, rank, and streak.'),   BULLET('My Labs: Searchable lab catalog with progress indicators and filters.'),   BULLET('Lab Interface: Three-panel layout with instructions, network topology, and CLI terminal.'),   BULLET('Achievements: Gallery of earned and locked achievements with progress indicators.'),   BULLET('Leaderboard: Weekly and monthly rankings with points and average scores.'),   BULLET('Admin Dashboard: User management, platform statistics, and server metrics.'),   SPACE(),   H2('5.2 Backend Implementation'),   SPACE(),   H3('5.2.1 Server Architecture'),   BODY('The Express server follows a modular architecture where each feature domain (auth, labs, users, admin, achievements, leaderboard, settings, events) is encapsulated in its own module with dedicated routes, controllers, and services.'),   SPACE(),   BODY('Middleware execution order in server.js:'),   NUMBERED('helmet() — Security headers'),   NUMBERED('CORS configuration — Origin validation'),   NUMBERED('express.json() / urlencoded() — Body parsing'),   NUMBERED('cookieParser() — Cookie access'),   NUMBERED('passport() — OAuth initialization'),   NUMBERED('Rate limiter — Request throttling on /api'),   NUMBERED('Route registration — Feature module routes'),   NUMBERED('404 handler — Unknown route fallback'),   NUMBERED('Global error handler — Centralized error response'),   SPACE(),   H3('5.2.2 Cisco IOS Simulation Engine'),   BODY('The core innovation of Smart IT Lab is its stateful Cisco IOS simulation engine (ios-engine.js). The engine maintains per-device state including:'),   BULLET('Current CLI mode (user EXEC, privileged EXEC, global configuration, interface configuration, router configuration).'),   BULLET('Interface configurations (IP addresses, descriptions, status).'),   BULLET('Routing protocol configurations (OSPF, BGP, RIP, static routes).'),   BULLET('VLAN database and spanning tree configurations.'),   BULLET('ACL definitions and assignments.'),   SPACE(),   BODY('For each lab, the engine validates student commands against predefined objectives. When an objective is met, the system fires an SSE event to the browser, updating the lab interface in real-time without page reload.'),   SPACE(),   H3('5.2.3 Real-Time Events with SSE'),   BODY('Server-Sent Events provide unidirectional real-time communication from server to browser. Each active lab session maintains a connection in the labConnections Map. When the terminal engine detects an objective completion, it emits an event to all SSE clients associated with that lab session.'),   SPACE(),   H2('5.3 Lab Content'),   BODY('Smart IT Lab provides 46 labs across 6 categories:'),   SPACE(),   simpleTable(     ['Category', 'Labs Count', 'Topics Covered'],     [       ['Routing Protocols', '12', 'OSPF, BGP, RIP, Static Routes, Route Redistribution'],       ['Switching', '8', 'VLAN Configuration, Trunk Ports, STP, EtherChannel'],       ['Security', '8', 'ACL (Standard & Extended), NAT, Port Security, DHCP Snooping'],       ['CCNA Track', '10', 'Comprehensive CCNA exam preparation labs'],       ['Network Fundamentals', '5', 'IPv4/IPv6 Addressing, Subnetting, Basic Configuration'],       ['Advanced Topics', '3', 'BGP Multi-AS, MPLS, QoS'],     ],     [2800, 1800, 4760]   ),   SPACE(),   H2('5.4 Screenshots'),   SPACE(),   H3('5.4.1 Landing Page'),   BODY('Figure 5.1 shows the Smart IT Lab landing page, featuring the platform tagline "Master Enterprise Networking in a Virtual Lab", key feature highlights, and the team section.'),   SPACE(),   H3('5.4.2 Student Dashboard'),   BODY('Figure 5.2 shows the student dashboard displaying labs solved (6), global rank (#1), hours spent (3h), achievements earned (2), active labs, and completed lab history with scores.'),   SPACE(),   H3('5.4.3 Lab Interface'),   BODY('Figure 5.3 shows the three-panel lab interface for "IPv6 Addressing & Configuration": objectives panel (left), network topology diagram (center), and the Cisco IOS CLI terminal (bottom). The live validation panel (right) shows real-time objective completion.'),   SPACE(),   H3('5.4.4 Leaderboard'),   BODY('Figure 5.4 shows the competitive leaderboard with weekly rankings, points, labs completed, average score, and current streak.'),   BREAK(), ];
// ── Chapter 6: DevOps & DevSecOps ──────────────────────────────────────────── const chapter6 = [   H1('Chapter 6: DevOps and DevSecOps Implementation'),   SPACE(),   BODY('A key objective of this project is to demonstrate proficiency in DevOps and DevSecOps practices. This chapter documents the complete pipeline, toolchain, and security measures applied to Smart IT Lab in production.'),   SPACE(),   H2('6.1 DevOps Philosophy and Approach'),   BODY('DevOps is a set of practices that combines software development (Dev) and IT operations (Ops), aiming to shorten the development lifecycle while delivering high-quality software continuously. For Smart IT Lab, DevOps principles are applied from code commit to production deployment through automated pipelines.'),   SPACE(),   BODY('DevSecOps extends DevOps by integrating security practices at every stage of the development pipeline — shifting security "left" so vulnerabilities are detected and resolved before reaching production.'),   SPACE(),   H2('6.2 Version Control Strategy'),   BODY('The project uses GitHub for version control with the following branching strategy:'),   BULLET('main: Production-ready code; all merges trigger automated deployment to Railway.'),   BULLET('develop: Integration branch for feature development.'),   BULLET('feature/*: Individual feature branches merged via pull requests.'),   SPACE(),   BODY('Branch protection rules are configured on main to require passing CI checks before any merge, preventing broken code from reaching production.'),   SPACE(),   H2('6.3 Containerization with Docker'),   BODY('Both the frontend and backend are containerized using multi-stage Docker builds:'),   SPACE(),   H3('6.3.1 Frontend Dockerfile'),   BODY('Stage 1 (Builder): Uses node:20-alpine to install dependencies and build the React SPA with Vite. The VITE_API_URL build argument injects the production API URL at build time.'),   BODY('Stage 2 (Runner): Uses nginx:1.28-alpine to serve the static dist/ directory. A custom nginx.conf handles SPA routing with try_files fallback and enables gzip compression.'),   SPACE(),   H3('6.3.2 Backend Dockerfile'),   BODY('The backend uses a multi-stage build with node:20-alpine, installing only production dependencies (npm ci --only=production). The container runs as a non-root expressjs user with dumb-init as PID 1 for proper signal handling. A curl healthcheck on /api/health ensures Railway detects service readiness.'),   SPACE(),   H2('6.4 CI/CD Pipeline'),   BODY('GitHub Actions provides the automation backbone for continuous integration and deployment. The pipeline triggers on every push to main and pull request creation.'),   SPACE(),   simpleTable(     ['Workflow', 'Trigger', 'Jobs', 'Duration'],     [       ['CI/CD Pipeline', 'push to main, PR', 'Frontend build validation', '~35 seconds'],       ['Security Scan (Trivy)', 'push to main, PR', 'Docker image vulnerability scan', '~50 seconds'],       ['Gitleaks Secret Scan', 'push to main, PR', 'Git history secret detection', '~8 seconds'],       ['Semgrep Security Scan', 'push to main, PR', 'Static code security analysis', '~2 minutes'],       ['Load Testing (k6)', 'push to main', 'Performance test with 50 VUs', '~2 minutes'],     ],     [2800, 2200, 2760, 1600]   ),   SPACE(),   BODY('Railway is configured for automatic deployment on every successful push to main, providing seamless continuous delivery with zero-downtime deployments.'),   SPACE(),   H2('6.5 Cloud Infrastructure'),   SPACE(),   H3('6.5.1 Railway Platform'),   BODY('Railway hosts two independent services within the meticulous-flexibility project:'),   BULLET('Backend Service (beautiful-encouragement): Node.js Express API, Port 5000, 1 replica.'),   BULLET('Frontend Service (smart-it-lab): Nginx static server, Port 8080.'),   SPACE(),   BODY('Railway provides automatic TLS certificate provisioning, environment variable management, deployment logs, metrics (CPU, RAM), and a built-in console for one-off commands such as database seeding.'),   SPACE(),   H3('6.5.2 MongoDB Atlas'),   BODY('The database is hosted on MongoDB Atlas M0 (free tier) in eu-west-1 (Ireland). Network access is configured to allow connections from Railway\'s egress IPs. The connection string uses retryWrites=true&w=majority for durability.'),   SPACE(),   H2('6.6 DevSecOps Toolchain'),   SPACE(),   H3('6.6.1 Trivy — Docker Image Scanning'),   BODY('Trivy by Aqua Security scans Docker images for known CVEs in OS packages and application dependencies. On the initial scan, 33 vulnerabilities were detected in the nginx:1.27-alpine base image. After upgrading to nginx:1.28-alpine, the count reduced to 20, all in Alpine system libraries (openssl, libxml2, musl) — none in application code. Results are reported as HIGH or CRITICAL with fixed version recommendations.'),   SPACE(),   H3('6.6.2 Gitleaks — Secret Detection'),   BODY('Gitleaks scans the entire git history for accidentally committed secrets including API keys, passwords, JWT tokens, and connection strings. The scan runs with fetch-depth: 0 to examine all commits since repository creation. The scan returned clean results, confirming no secrets were ever committed to version control.'),   SPACE(),   H3('6.6.3 Semgrep — Static Application Security Testing'),   BODY('Semgrep performs deep static analysis of the application source code using 2,933 security rules. The scan identified:'),   BULLET('1 Reachable Supply Chain Finding: multer CVE-2026-5079 (HIGH) — Denial of Service via deeply nested field names.'),   BULLET('15 Undetermined Supply Chain Findings: Various package vulnerabilities including nodemailer, qs, and undici.'),   BULLET('54 Non-blocking Code Findings: Potential NoSQL injection patterns in MongoDB queries and XSS in SSE endpoint — flagged for future remediation.'),   SPACE(),   H3('6.6.4 Dependabot — Dependency Vulnerability Management'),   BODY('GitHub Dependabot continuously monitors npm packages in both the frontend and backend for known vulnerabilities. It automatically opens pull requests with version bumps to patched releases. 25 vulnerabilities were identified across both package.json files, distributed as 11 high, 10 moderate, and 4 low severity.'),   SPACE(),   H3('6.6.5 GitHub Secret Scanning'),   BODY('GitHub\'s native secret scanning monitors all pushes to the repository for patterns matching known secret formats (API keys, tokens, credentials). This provides an additional layer of protection beyond Gitleaks.'),   SPACE(),   H2('6.7 Monitoring and Observability'),   SPACE(),   H3('6.7.1 UptimeRobot'),   BODY('UptimeRobot monitors the frontend service every 5 minutes via HTTP check. Alerts are sent via email to the development team when downtime is detected. Since deployment, the platform has maintained 100% uptime.'),   SPACE(),   H3('6.7.2 Sentry Error Tracking'),   BODY('Sentry is integrated into the React frontend via @sentry/react SDK. It captures runtime JavaScript exceptions with full stack traces, browser information, user context, and reproduction steps. The Sentry organization (sofcore) is connected to the GitHub repository for commit-level error attribution.'),   SPACE(),   H2('6.8 Complete DevOps Architecture'),   BODY('The complete DevOps and DevSecOps pipeline can be summarized as follows:'),   SPACE(),   simpleTable(     ['Stage', 'Tool', 'Purpose', 'Status'],     [       ['Source Control', 'GitHub', 'Version control, PRs, branch protection', '✓ Active'],       ['CI/CD', 'GitHub Actions', 'Automated build, test, deploy pipeline', '✓ Active'],       ['Containerization', 'Docker', 'Multi-stage builds for both services', '✓ Active'],       ['Hosting', 'Railway', 'PaaS cloud hosting with auto-deploy', '✓ Active'],       ['Database', 'MongoDB Atlas', 'Managed cloud database (Ireland)', '✓ Active'],       ['Container Security', 'Trivy', 'Docker image CVE scanning', '✓ Active'],       ['Secret Detection', 'Gitleaks', 'Git history secret scanning', '✓ Active'],       ['Code Security', 'Semgrep', 'Static application security testing', '✓ Active'],       ['Dependency Security', 'Dependabot', 'Automated dependency updates', '✓ Active'],       ['Uptime Monitoring', 'UptimeRobot', 'Availability monitoring every 5 min', '✓ Active'],       ['Error Tracking', 'Sentry', 'Runtime error capture and alerting', '✓ Active'],       ['Load Testing', 'k6', 'Performance testing with 50 VUs', '✓ Active'],     ],     [2400, 2000, 3360, 1600]   ),   BREAK(), ];
// ── Chapter 7: Testing ──────────────────────────────────────────────────────── const chapter7 = [   H1('Chapter 7: Testing and Evaluation'),   SPACE(),   H2('7.1 Testing Strategy'),   BODY('Smart IT Lab employs a multi-level testing strategy covering unit tests, integration tests, load testing, and security testing. Tests are automated and integrated into the CI/CD pipeline, ensuring every code change is verified before deployment.'),   SPACE(),   H2('7.2 Unit and Integration Testing'),   SPACE(),   H3('7.2.1 Backend Testing (Jest)'),   BODY('The backend uses Jest with Supertest for HTTP testing and mongodb-memory-server for in-memory database testing. Coverage thresholds are set at 80% lines. The rate limiter is disabled in test mode (NODE_ENV=test) to prevent interference.'),   SPACE(),   H3('7.2.2 Frontend Testing (Vitest)'),   BODY('The React frontend uses Vitest with Testing Library and jsdom for component testing. Tests verify rendering, user interactions, and API service functions.'),   SPACE(),   H2('7.3 Load Testing with k6'),   BODY('k6 load testing was conducted against the production backend API endpoint /api/health with the following test scenario:'),   SPACE(),   simpleTable(     ['Stage', 'Duration', 'Virtual Users', 'Purpose'],     [       ['Ramp-up', '30 seconds', '0 → 10 VUs', 'Gradual load increase'],       ['Sustained load', '1 minute', '10 → 50 VUs', 'Peak load simulation'],       ['Ramp-down', '30 seconds', '50 → 0 VUs', 'Gradual load decrease'],     ],     [2000, 2000, 2360, 3000]   ),   SPACE(),   H3('7.3.1 Load Test Results'),   SPACE(),   simpleTable(     ['Metric', 'Result', 'Threshold', 'Status'],     [       ['p(95) Response Time', '20.65 ms', '< 2000 ms', '✓ PASSED'],       ['Average Response Time', '19.34 ms', 'N/A', '✓ Excellent'],       ['Minimum Response Time', '17.75 ms', 'N/A', '✓ Excellent'],       ['Maximum Response Time', '277.46 ms', 'N/A', '✓ Acceptable'],       ['Total Requests', '2,653', 'N/A', '✓ Complete'],       ['Throughput', '22 req/sec', 'N/A', '✓ Good'],     ],     [3000, 2000, 2000, 2360]   ),   SPACE(),   BODY('The backend demonstrated excellent performance characteristics with a 95th percentile response time of only 20.65 milliseconds — far below the 2-second threshold — under 50 concurrent virtual users. This confirms the platform can handle significant concurrent load without performance degradation.'),   SPACE(),   H2('7.4 Security Testing Results'),   SPACE(),   H3('7.4.1 Trivy Docker Scan Summary'),   BODY('After upgrading the base image from nginx:1.27-alpine to nginx:1.28-alpine, vulnerability count decreased from 33 to 20. All remaining vulnerabilities are in Alpine system libraries (openssl, libxml2, musl, nghttp2) — not in application code. These are tracked as known issues pending upstream Alpine package updates.'),   SPACE(),   H3('7.4.2 Gitleaks Scan Result'),   BODY('Gitleaks scan of complete git history returned zero findings, confirming that no secrets, credentials, or sensitive configuration values were ever committed to the repository.'),   SPACE(),   H3('7.4.3 Semgrep Code Analysis Summary'),   simpleTable(     ['Finding Type', 'Count', 'Severity', 'Action'],     [       ['Reachable Supply Chain', '1', 'HIGH', 'multer upgrade to 2.2.0 planned'],       ['Undetermined Supply Chain', '15', 'MODERATE', 'Tracked in Dependabot'],       ['Non-blocking Code Issues', '54', 'LOW-MODERATE', 'Queued for future sprint'],     ],     [3000, 1500, 2000, 2860]   ),   SPACE(),   H2('7.5 Manual Acceptance Testing'),   BODY('Manual end-to-end acceptance testing was performed across all major user journeys:'),   SPACE(),   simpleTable(     ['Test Case', 'Expected Result', 'Status'],     [       ['User registration and email verification', 'Account created, verification email sent', '✓ Pass'],       ['Login with email/password', 'JWT tokens issued, dashboard loaded', '✓ Pass'],       ['GitHub OAuth login', 'Account created/linked, tokens issued', '✓ Pass'],       ['Browse and filter labs', 'Labs displayed with correct filters', '✓ Pass'],       ['Start a Cisco IOS lab', 'Terminal loads, topology displayed', '✓ Pass'],       ['Execute valid Cisco commands', 'Commands processed, output displayed', '✓ Pass'],       ['Complete lab objective', 'Objective marked complete, score updated', '✓ Pass'],       ['Submit completed lab', 'Score calculated, points awarded', '✓ Pass'],       ['Unlock achievement', 'Achievement notification, points added', '✓ Pass'],       ['View leaderboard', 'Rankings displayed correctly', '✓ Pass'],       ['Admin suspend user', 'User account suspended', '✓ Pass'],       ['Password reset via email', 'Reset link sent, password updated', '✓ Pass'],       ['Mobile device access', 'All pages render correctly on mobile', '✓ Pass'],     ],     [3800, 3000, 2560]   ),   BREAK(), ];
// ── Chapter 8: Conclusion ───────────────────────────────────────────────────── const chapter8 = [   H1('Chapter 8: Conclusion and Future Work'),   SPACE(),   H2('8.1 Project Summary'),   BODY('Smart IT Lab successfully delivers a production-ready, browser-based networking simulation platform that addresses a real and pressing challenge in IT education. Students at Menoufia University and beyond can now practice authentic Cisco IOS networking labs from any device, without the need for expensive hardware or resource-intensive software installations.'),   SPACE(),   BODY('The platform has achieved all stated objectives:'),   BULLET('A stateful Cisco IOS CLI engine with real-time command validation is fully operational.'),   BULLET('46 structured labs across 6 categories cover the core CCNA curriculum and beyond.'),   BULLET('A gamified learning experience with achievements, points, streaks, and leaderboards increases student engagement.'),   BULLET('Full administrative control enables instructors to monitor and manage student progress.'),   BULLET('A complete DevOps and DevSecOps pipeline ensures continuous delivery, automated security, and production monitoring.'),   SPACE(),   H2('8.2 Technical Achievements'),   BODY('Beyond the educational functionality, this project demonstrates significant technical competency:'),   SPACE(),   simpleTable(     ['Domain', 'Achievement'],     [       ['Full-Stack Development', 'React 18 SPA with TypeScript, Node.js ESM backend, MongoDB ODM'],       ['Authentication Security', 'JWT rotation, bcrypt hashing, OAuth 2.0, httpOnly cookies, email verification'],       ['Real-Time Communication', 'Server-Sent Events for live lab validation and objective tracking'],       ['DevOps Engineering', 'Docker multi-stage builds, Railway PaaS deployment, GitHub Actions CI/CD'],       ['DevSecOps', 'Trivy, Gitleaks, Semgrep, Dependabot, GitHub Secret Scanning'],       ['Performance Testing', 'k6 load testing: p(95) = 20.65ms under 50 concurrent users'],       ['Monitoring', 'UptimeRobot (100% uptime), Sentry error tracking, k6 performance baselines'],       ['Responsive Design', 'Full functionality on mobile, tablet, and desktop via TailwindCSS'],     ],     [3000, 6360]   ),   SPACE(),   H2('8.3 Limitations'),   BODY('The current implementation has the following known limitations:'),   BULLET('SSE connections are stored in an in-memory Map, limiting horizontal scaling to a single backend replica.'),   BULLET('The admin revenue statistics use estimated values rather than real transaction data.'),   BULLET('Student streak tracking requires further refinement for edge cases.'),   BULLET('25 npm package vulnerabilities detected by Dependabot are pending resolution.'),   SPACE(),   H2('8.4 Future Work'),   BODY('Planned enhancements for future development iterations include:'),   SPACE(),   H3('8.4.1 Short-Term'),   BULLET('Upgrade vulnerable packages (multer 2.2.0, nodemailer 9.0.1, undici 7.28.0).'),   BULLET('Migrate SSE registry to Redis Pub/Sub to enable horizontal backend scaling.'),   BULLET('Add Prometheus metrics endpoint and Grafana dashboard for observability.'),   BULLET('Implement OWASP ZAP dynamic application security testing in CI pipeline.'),   SPACE(),   H3('8.4.2 Medium-Term'),   BULLET('Add instructor role with lab creation and student assignment capabilities.'),   BULLET('Implement Terraform Infrastructure as Code for reproducible cloud deployment.'),   BULLET('Add video walkthrough support for lab objectives.'),   BULLET('Develop mobile native applications for iOS and Android.'),   SPACE(),   H3('8.4.3 Long-Term'),   BULLET('Expand lab catalog to cover CCNP and AWS/Azure cloud networking certifications.'),   BULLET('Implement AI-powered hints that analyze student command history.'),   BULLET('Add collaborative labs enabling multiple students to work on shared topology.'),   BULLET('Pursue university-level licensing to integrate with official CCNA curriculum.'),   SPACE(),   H2('8.5 Conclusion'),   BODY('Smart IT Lab represents a comprehensive graduation project that bridges the gap between theoretical networking education and practical hands-on experience. By combining authentic Cisco IOS simulation, gamified learning, and production-grade DevOps infrastructure, the project demonstrates the team\'s readiness for professional software engineering roles.'),   SPACE(),   BODY('The application of DevOps and DevSecOps practices — from containerization and CI/CD pipelines to automated security scanning and continuous monitoring — reflects industry standards and validates the team\'s commitment to building software that is not just functional, but secure, reliable, and maintainable.'),   SPACE(),   BODY('We are proud to present Smart IT Lab as a contribution to educational technology in Egypt and the Arab world, and we look forward to its continued development and adoption.'),   BREAK(), ];
// ── References ──────────────────────────────────────────────────────────────── const references = [   H1('References'),   SPACE(),   NUMBERED('Cisco Systems. (2024). Cisco Packet Tracer User Guide. Cisco Networking Academy.'),   NUMBERED('Fielding, R. T., & Taylor, R. N. (2002). Principled Design of the Modern Web Architecture. ACM Transactions on Internet Technology, 2(2), 115-150.'),   NUMBERED('Humble, J., & Farley, D. (2010). Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation. Addison-Wesley.'),   NUMBERED('Kim, G., Humble, J., Debois, P., & Willis, J. (2016). The DevOps Handbook. IT Revolution Press.'),   NUMBERED('MongoDB, Inc. (2024). MongoDB Manual — Schema Design Best Practices. MongoDB Documentation.'),   NUMBERED('OWASP Foundation. (2024). OWASP Top Ten Web Application Security Risks. https://owasp.org/Top10/'),   NUMBERED('React Team. (2024). React 18 Documentation. https://react.dev'),   NUMBERED('Shostack, A. (2014). Threat Modeling: Designing for Security. Wiley.'),   NUMBERED('Turnbull, J. (2014). The Docker Book: Containerization is the New Virtualization. James Turnbull.'),   NUMBERED('Vercel. (2024). Vite Documentation — Build Tool Guide. https://vitejs.dev'),   NUMBERED('Aqua Security. (2024). Trivy Documentation — Container Security Scanner. https://trivy.dev'),   NUMBERED('Grafana Labs. (2024). k6 Documentation — Load Testing for Engineering Teams. https://k6.io/docs'),   BREAK(), ];
// ── Appendices ──────────────────────────────────────────────────────────────── const appendices = [   H1('Appendix A: System API Reference'),   SPACE(),   BODY('This appendix provides a complete reference of all API endpoints exposed by the Smart IT Lab backend. The API is accessible at https://beautiful-encouragement-production.up.railway.app/api'),   SPACE(),   H2('A.1 Authentication Endpoints'),   simpleTable(     ['Method', 'Endpoint', 'Description', 'Auth Required'],     [       ['POST', '/api/auth/register', 'Create new student account', 'No'],       ['POST', '/api/auth/login', 'Authenticate and receive tokens', 'No'],       ['POST', '/api/auth/logout', 'Invalidate refresh token', 'Yes'],       ['POST', '/api/auth/refresh-token', 'Exchange refresh token for new access token', 'Cookie'],       ['GET', '/api/auth/me', 'Get authenticated user profile', 'Yes'],       ['POST', '/api/auth/verify-email', 'Verify email with token', 'No'],       ['POST', '/api/auth/forgot-password', 'Request password reset email', 'No'],       ['POST', '/api/auth/reset-password', 'Reset password with token', 'No'],       ['GET', '/api/auth/github', 'Initiate GitHub OAuth flow', 'No'],       ['GET', '/api/auth/google', 'Initiate Google OAuth flow', 'No'],     ],     [1200, 2800, 3360, 1900]   ),   SPACE(),   BREAK(),   H1('Appendix B: Database Schema Details'),   SPACE(),   BODY('This appendix provides the complete MongoDB schema definitions for all collections in the Smart IT Lab database, including field types, constraints, and indexes.'),   SPACE(),   H2('B.1 Users Collection'),   BODY('Primary collection storing all user accounts including students, instructors, and administrators.'),   SPACE(),   simpleTable(     ['Field', 'Type', 'Constraint', 'Description'],     [       ['_id', 'ObjectId', 'PK, auto', 'MongoDB document identifier'],       ['name', 'String', 'required, trim', 'Display name'],       ['email', 'String', 'required, unique, lowercase', 'Login email address'],       ['password', 'String', 'select: false', 'bcrypt hash (cost 12), not returned by default'],       ['role', 'Enum', 'default: student', 'student | admin | instructor'],       ['plan', 'Enum', 'default: free', 'free | pro | enterprise'],       ['isActive', 'Boolean', 'default: true', 'Account enabled status'],       ['emailVerified', 'Boolean', 'default: false', 'Email confirmation status'],       ['provider', 'Enum', 'default: local', 'local | github | google'],       ['totalPoints', 'Number', 'default: 0', 'Cumulative gamification points'],       ['streak', 'Number', 'default: 0', 'Current consecutive day streak'],     ],     [1800, 1400, 2200, 3960]   ),   SPACE(),   H2('B.2 UserLabs Collection'),   BODY('Junction collection tracking each student\'s progress on each lab, including full command history and device state.'),   SPACE(),   simpleTable(     ['Field', 'Type', 'Constraint', 'Description'],     [       ['userId', 'ObjectId', 'required, FK → Users', 'Reference to student'],       ['labId', 'String', 'required, FK → Labs.labId', 'Reference to lab (string ID)'],       ['status', 'Enum', 'required', 'not-started | running | stopped | completed'],       ['progress', 'Number', 'min: 0, max: 100', 'Percentage of objectives completed'],       ['score', 'Number', 'default: 0', 'Lab score out of 100'],       ['completedObjectives', '[Number]', 'default: []', 'Array of completed objective indices'],       ['commandHistory', '[Object]', 'max: 500 entries', 'Full CLI session history'],       ['deviceStates', 'Mixed', 'default: {}', 'Current IOS state per device'],     ],     [2400, 1400, 2000, 3560]   ),   BREAK(),   H1('Appendix C: DevOps Pipeline Configuration'),   SPACE(),   H2('C.1 GitHub Actions Workflow'),   BODY('The following GitHub Actions workflows are configured in .github/workflows/:'),   SPACE(),   simpleTable(     ['File', 'Workflow Name', 'Triggers', 'Jobs'],     [       ['ci-cd.yml', 'CI/CD Pipeline', 'push main, PR', 'frontend-test'],       ['security.yml', 'Security Scan', 'push main, PR', 'trivy-scan'],       ['gitleaks.yml', 'Gitleaks Secret Scan', 'push main, PR', 'gitleaks'],       ['semgrep.yml', 'Semgrep Security Scan', 'push main, PR', 'semgrep'],       ['load-test.yml', 'Load Testing', 'push main', 'k6-load-test'],       ['dependabot.yml', 'Dependabot Updates', 'weekly schedule', 'auto-PRs'],     ],     [2000, 2400, 2200, 2760]   ),   SPACE(),   H2('C.2 Environment Variables Reference'),   simpleTable(     ['Variable', 'Service', 'Required', 'Description'],     [       ['NODE_ENV', 'Backend', 'Yes', 'Runtime environment (production)'],       ['PORT', 'Backend', 'Auto', 'Listen port (Railway injects)'],       ['MONGO_URI', 'Backend', 'Yes', 'MongoDB Atlas connection string'],       ['JWT_SECRET', 'Backend', 'Yes', 'Access token signing key (64 bytes, base64)'],       ['JWT_REFRESH_SECRET', 'Backend', 'Yes', 'Refresh token signing key (different from above)'],       ['JWT_ACCESS_EXPIRY', 'Backend', 'No', 'Access token TTL (default: 15m)'],       ['JWT_REFRESH_EXPIRY', 'Backend', 'No', 'Refresh token TTL (default: 7d)'],       ['FRONTEND_URL', 'Backend', 'Yes', 'Allowed CORS origin (production frontend URL)'],       ['GITHUB_CLIENT_ID', 'Backend', 'Optional', 'GitHub OAuth application ID'],       ['GITHUB_CLIENT_SECRET', 'Backend', 'Optional', 'GitHub OAuth application secret'],       ['GOOGLE_CLIENT_ID', 'Backend', 'Optional', 'Google OAuth client ID'],       ['CLOUDINARY_CLOUD_NAME', 'Backend', 'Optional', 'Cloudinary for avatar uploads'],       ['SMTP_HOST', 'Backend', 'Optional', 'SMTP server (tokens logged to console if absent)'],       ['VITE_API_URL', 'Frontend', 'Yes', 'Backend API base URL (build-time injection)'],     ],     [2600, 1400, 1400, 3960]   ), ];
// ── Build Document ──────────────────────────────────────────────────────────── const doc = new Document({   numbering: {     config: [       {         reference: 'bullets',         levels: [{           level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,           style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 100 } } }         }]       },       {         reference: 'numbers',         levels: [{           level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,           style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 100 } } }         }]       }     ]   },   styles: {     default: {       document: { run: { font: 'Arial', size: 24 } }     },     paragraphStyles: [       {         id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,         run: { size: 36, bold: true, font: 'Arial', color: '1F4E79' },         paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }       },       {         id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,         run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },         paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }       },       {         id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,         run: { size: 24, bold: true, font: 'Arial', color: '2E75B6' },         paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }       },     ]   },   sections: [{     properties: {       page: {         size: { width: 11906, height: 16838 },         margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }       }     },     headers: {       default: new Header({         children: [new Paragraph({           border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },           children: [             new TextRun({ text: 'Smart Network Simulation Labs', bold: true, color: '1F4E79', size: 18 }),             new TextRun({ text: '   |   Faculty of Computers and Information, Menoufia University', color: '666666', size: 18 }),           ]         })]       })     },     footers: {       default: new Footer({         children: [new Paragraph({           border: { top: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },           alignment: AlignmentType.CENTER,           children: [             new TextRun({ text: 'Page ', size: 18, color: '666666' }),             new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '666666' }),             new TextRun({ text: ' of ', size: 18, color: '666666' }),             new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '666666' }),           ]         })]       })     },     children: [       ...coverPage,       // TOC       H1('Table of Contents'),       new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),       BREAK(),       ...abstractSection,       ...chapter1,       ...chapter2,       ...chapter3,       ...chapter4,       ...chapter5,       ...chapter6,       ...chapter7,       ...chapter8,       ...references,       ...appendices,     ]   }] });  Packer.toBuffer(doc).then(buffer => {   fs.writeFileSync('/mnt/user-data/outputs/Smart_IT_Lab_Graduation_Book.docx', buffer);   console.log('✅ Book created successfully!'); }).catch(err => {   console.error('❌ Error:', err);   process.exit(1); });
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TableOfContents, ImageRun, ExternalHyperlink
} = require('docx');
const fs = require('fs');
// ── Helpers ──────────────────────────────────────────────────────────────────
const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })] });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 36, color: '1F4E79' })] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 28, color: '2E75B6' })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, size: 24, color: '2E75B6' })] });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });
const SPACE = () => new Paragraph({ children: [new TextRun('')] });
const BODY = (text) => new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text, size: 24 })] });
const BULLET = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 120 },
  children: [new TextRun({ text, size: 24 })]
});
const NUMBERED = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { after: 120 },
  children: [new TextRun({ text, size: 24 })]
});
// ── Table Helpers ─────────────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' };
const borders = { top: border, bottom: border, left: border, right: border };
const headerCell = (text, width) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  shading: { fill: '1F4E79', type: ShadingType.CLEAR },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 22 })] })]
});
const dataCell = (text, width, center = false, bg = 'FFFFFF') => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  shading: { fill: bg, type: ShadingType.CLEAR },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text, size: 22 })] })]
});
const simpleTable = (headers, rows, widths) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),
    ...rows.map((row, ri) => new TableRow({
      children: row.map((cell, ci) => dataCell(cell, widths[ci], false, ri % 2 === 0 ? 'F5F8FF' : 'FFFFFF'))
    }))
  ]
});
// ── Cover Page ────────────────────────────────────────────────────────────────
const coverPage = [
  SPACE(), SPACE(), SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Faculty of Computers and Information', size: 28, bold: true, color: '1F4E79' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Menoufia University', size: 28, bold: true, color: '1F4E79' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Department of Information Technology', size: 24, color: '2E75B6' })] }),
  SPACE(), SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: '─────────────────────────────────', size: 24, color: '2E75B6' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: 'Graduation Project Report', size: 32, bold: true, color: '1F4E79' })] }),
  SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Smart Network Simulation Labs', size: 44, bold: true, color: '1F4E79' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'محاكي التدريب العملي للشبكات', size: 32, bold: true, color: '2E75B6' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: '─────────────────────────────────', size: 24, color: '2E75B6' })] }),
  SPACE(), SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'Submitted By:', size: 24, bold: true, color: '1F4E79' })] }),
  ...[ 
    'Youssef Ali Mostafa Frhat',
    'Youssef Khaled Mohamed Hasnain Rizk',
    'El-Sayed Mohamed El-Ghandour',
    'Ahmed Mahmoud Mohamed Salem',
    'Fathy Ibrahim Wahba Gadallah',
    'Seif Hamdy Abdeldayem Ahmed',
  ].map(name => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: name, size: 24, color: '333333' })] })),
  SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'Under the Supervision of:', size: 24, bold: true, color: '1F4E79' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Dr. Amina El-Mahalawi', size: 24, color: '333333' })] }),
  SPACE(), SPACE(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Academic Year 2025 / 2026', size: 24, bold: true, color: '1F4E79' })] }),
  BREAK(),
];
// ── Abstract ──────────────────────────────────────────────────────────────────
const abstractSection = [
  H1('Abstract'),
  SPACE(),
  BODY('Smart Network Simulation Labs (Smart IT Lab) is a full-stack web-based platform designed to address a critical educational challenge faced by Information Technology students: the inability to perform hands-on networking labs due to hardware limitations or the absence of capable devices. Traditional networking education requires specialized equipment such as Cisco routers and switches, along with resource-intensive simulation software, which many students cannot access.'),
  SPACE(),
  BODY('This project delivers a browser-based solution that simulates real Cisco IOS command-line interface (CLI) environments, allowing students to practice OSPF, VLAN, ACL, BGP, CCNA, and other networking protocols from any device — including laptops, tablets, and mobile phones — with zero hardware requirements.'),
  SPACE(),
  BODY('The platform features a live terminal engine with stateful Cisco IOS simulation, automated objective validation, real-time progress tracking, an achievement system, a competitive leaderboard, and full administrative control. It is built using modern web technologies including React 18, Node.js, Express, and MongoDB, and is deployed on a production-grade infrastructure using DevOps and DevSecOps practices including CI/CD pipelines, containerization, automated security scanning, and continuous monitoring.'),
  SPACE(),
  BODY('Beyond solving the educational problem, this project serves as a comprehensive demonstration of the team\'s acquired skills in full-stack development, cloud deployment, DevOps engineering, and DevSecOps — applying industry-standard tools and methodologies to deliver a secure, scalable, and production-ready system.'),
  BREAK(),
];
// ── Chapter 1: Introduction ───────────────────────────────────────────────────
const chapter1 = [
  H1('Chapter 1: Introduction'),
  SPACE(),
  H2('1.1 Background and Motivation'),
  BODY('The field of Information Technology education, particularly in networking and infrastructure domains, has long relied on physical laboratory environments. Students pursuing certifications such as CCNA, CompTIA Network+, and similar qualifications require hands-on experience configuring routers, switches, and network topologies using real or simulated equipment.'),
  SPACE(),
  BODY('However, a significant barrier exists: networking simulation software such as Cisco Packet Tracer and GNS3 demands considerable computational resources, while physical lab access is limited to university hours. Students with low-specification laptops or tablets — or those without personal computers entirely — are effectively excluded from practical preparation.'),
  SPACE(),
  BODY('At the Faculty of Computers and Information, Menoufia University, this challenge is particularly evident. Many students struggle to complete lab exercises at home, leading to reduced practical competency and lower performance in professional certification exams.'),
  SPACE(),
  H2('1.2 Problem Statement'),
  BODY('The core problem addressed by this project can be summarized as follows:'),
  BULLET('Students with limited hardware capabilities cannot install or run networking simulation software.'),
  BULLET('Students without personal computers have no access to hands-on lab practice outside university.'),
  BULLET('Existing web-based solutions lack authentic Cisco IOS command simulation and real-time validation.'),
  BULLET('There is no unified platform that combines lab practice, progress tracking, achievements, and competitive learning for IT students.'),
  SPACE(),
  H2('1.3 Proposed Solution'),
  BODY('Smart IT Lab proposes a fully browser-based networking simulation platform that:'),
  NUMBERED('Simulates authentic Cisco IOS CLI environments accessible from any browser on any device.'),
  NUMBERED('Provides 46 structured lab exercises covering OSPF, VLAN, ACL, BGP, CCNA, and Network Fundamentals.'),
  NUMBERED('Validates student commands in real-time and provides instant feedback on objective completion.'),
  NUMBERED('Tracks student progress, scores, streaks, and achievements across all labs.'),
  NUMBERED('Enables competitive learning through a weekly and monthly leaderboard system.'),
  NUMBERED('Provides administrators with a management dashboard for user oversight and platform monitoring.'),
  SPACE(),
  H2('1.4 Project Objectives'),
  BODY('The primary objectives of this project are:'),
  BULLET('Develop a production-ready web application that accurately simulates Cisco IOS networking environments.'),
  BULLET('Deliver a responsive user interface accessible on desktops, tablets, and mobile devices.'),
  BULLET('Implement a secure authentication system with JWT tokens, refresh token rotation, and OAuth integration.'),
  BULLET('Deploy the application using industry-standard DevOps practices including containerization, CI/CD, and automated testing.'),
  BULLET('Apply DevSecOps principles including automated security scanning, vulnerability detection, and secret management.'),
  BULLET('Demonstrate the team\'s proficiency in full-stack development, cloud infrastructure, and security engineering as a graduation deliverable.'),
  SPACE(),
  H2('1.5 Project Scope'),
  BODY('The project encompasses the following scope:'),
  BULLET('Frontend: A React 18 single-page application with responsive design for all device sizes.'),
  BULLET('Backend: A Node.js/Express REST API with stateful IOS simulation engine.'),
  BULLET('Database: MongoDB with Mongoose ODM, seeded with 46 labs and 13 achievements.'),
  BULLET('Infrastructure: Docker containerization, Railway cloud hosting, MongoDB Atlas.'),
  BULLET('DevOps: GitHub Actions CI/CD pipeline with automated build, test, and deployment.'),
  BULLET('DevSecOps: Trivy Docker scanning, Gitleaks secret detection, Semgrep code analysis, Dependabot dependency management.'),
  BULLET('Monitoring: UptimeRobot availability monitoring, Sentry error tracking, k6 load testing.'),
  SPACE(),
  H2('1.6 Report Organization'),
  BODY('This report is organized as follows:'),
  BULLET('Chapter 2 provides a literature review of existing networking simulation tools.'),
  BULLET('Chapter 3 describes the system requirements analysis and use cases.'),
  BULLET('Chapter 4 presents the system design including architecture, database, and UI.'),
  BULLET('Chapter 5 details the implementation of all system modules.'),
  BULLET('Chapter 6 covers the DevOps and DevSecOps pipeline implementation.'),
  BULLET('Chapter 7 presents testing results including load testing and security analysis.'),
  BULLET('Chapter 8 concludes the report with achievements and future work.'),
  BREAK(),
];
// ── Chapter 2: Literature Review ──────────────────────────────────────────────
const chapter2 = [
  H1('Chapter 2: Literature Review'),
  SPACE(),
  H2('2.1 Overview of Network Simulation Tools'),
  BODY('Network simulation and emulation tools have been central to networking education for decades. This chapter reviews the most prominent existing tools, identifies their limitations, and positions Smart IT Lab as a complementary solution addressing unmet needs.'),
  SPACE(),
  H2('2.2 Existing Tools and Their Limitations'),
  SPACE(),
  H3('2.2.1 Cisco Packet Tracer'),
  BODY('Cisco Packet Tracer is the most widely used network simulation tool in academic settings. It provides a graphical interface for building network topologies and simulating Cisco device behavior. However, it requires local installation, consumes significant RAM and CPU resources, and is restricted to Windows and macOS platforms. Students using Android tablets, Chromebooks, or low-specification devices cannot use it effectively.'),
  SPACE(),
  H3('2.2.2 GNS3'),
  BODY('GNS3 (Graphical Network Simulator-3) offers more realistic simulation by running actual Cisco IOS images. It is preferred for professional training but requires powerful hardware, complex setup, and licensed IOS images. It is entirely unsuitable for students with basic computing devices.'),
  SPACE(),
  H3('2.2.3 EVE-NG'),
  BODY('EVE-NG (Emulated Virtual Environment Next Generation) is a professional-grade network emulation platform used in enterprise training environments. It requires a dedicated server and is not accessible to individual students without significant infrastructure.'),
  SPACE(),
  H3('2.2.4 Web-Based Alternatives'),
  BODY('Several web-based networking labs exist, such as Cisco\'s Skills for All platform and NetAcad. While accessible via browsers, these platforms are restricted to Cisco\'s own curriculum, do not offer open lab environments, lack achievement and leaderboard systems, and do not provide the gamified learning experience that increases student engagement.'),
  SPACE(),
  H2('2.3 Comparison Summary'),
  SPACE(),
  simpleTable(
    ['Feature', 'Packet Tracer', 'GNS3', 'Cisco Skills', 'Smart IT Lab'],
    [
      ['Browser-based', '✗', '✗', 'Partial', '✓'],
      ['Mobile support', '✗', '✗', 'Limited', '✓'],
      ['Zero installation', '✗', '✗', '✓', '✓'],
      ['Cisco IOS CLI', '✓', '✓', 'Limited', '✓'],
      ['Progress tracking', 'Limited', '✗', 'Limited', '✓'],
      ['Achievements', '✗', '✗', 'Limited', '✓'],
      ['Leaderboard', '✗', '✗', '✗', '✓'],
      ['Open lab design', '✓', '✓', '✗', '✓'],
      ['Free access', '✓', '✓', 'Partial', '✓'],
    ],
    [2800, 1640, 1240, 1440, 2240]
  ),
  SPACE(),
  H2('2.4 Positioning of Smart IT Lab'),
  BODY('Smart IT Lab fills the gap between professional-grade tools that require powerful hardware and limited web-based platforms that lack authentic CLI simulation. By delivering a stateful Cisco IOS engine in a browser, Smart IT Lab democratizes networking education, making it accessible to every student regardless of their device capabilities.'),
  BREAK(),
];
// ── Chapter 3: Requirements ───────────────────────────────────────────────────
const chapter3 = [
  H1('Chapter 3: System Requirements Analysis'),
  SPACE(),
  H2('3.1 Stakeholders'),
  BODY('The primary stakeholders of Smart IT Lab are:'),
  BULLET('Students: IT students who need to practice networking labs for coursework and professional certifications.'),
  BULLET('Instructors/Supervisors: Faculty members who monitor student progress and platform usage.'),
  BULLET('Administrators: Platform administrators who manage users, labs, and system health.'),
  SPACE(),
  H2('3.2 Functional Requirements'),
  SPACE(),
  H3('3.2.1 Authentication Module'),
  BULLET('FR-01: Users shall be able to register with email and password.'),
  BULLET('FR-02: Users shall be able to log in and receive JWT access tokens (15-minute expiry) and refresh tokens (7-day expiry, httpOnly cookie).'),
  BULLET('FR-03: The system shall support GitHub and Google OAuth 2.0 authentication.'),
  BULLET('FR-04: Users shall be able to request password reset via email.'),
  BULLET('FR-05: Email verification shall be required upon registration.'),
  SPACE(),
  H3('3.2.2 Lab Module'),
  BULLET('FR-06: Students shall be able to browse 46 available labs filterable by difficulty, category, and search.'),
  BULLET('FR-07: Students shall be able to start, stop, and save progress on any lab.'),
  BULLET('FR-08: The system shall provide a real-time CLI terminal simulating Cisco IOS.'),
  BULLET('FR-09: The system shall automatically validate student commands against lab objectives.'),
  BULLET('FR-10: Network topology diagrams shall be displayed for each lab.'),
  SPACE(),
  H3('3.2.3 Progress and Gamification Module'),
  BULLET('FR-11: The system shall track labs completed, score, and time spent per student.'),
  BULLET('FR-12: Students shall earn achievements upon completing specific milestones.'),
  BULLET('FR-13: A weekly and monthly leaderboard shall rank students by points.'),
  BULLET('FR-14: Students shall maintain streaks for consecutive daily lab activity.'),
  SPACE(),
  H3('3.2.4 Admin Module'),
  BULLET('FR-15: Administrators shall be able to view and manage all user accounts.'),
  BULLET('FR-16: Administrators shall be able to suspend or deactivate user accounts.'),
  BULLET('FR-17: Administrators shall view platform analytics including active users and lab statistics.'),
  BULLET('FR-18: Server health metrics shall be displayed in the admin dashboard.'),
  SPACE(),
  H2('3.3 Non-Functional Requirements'),
  SPACE(),
  simpleTable(
    ['ID', 'Category', 'Requirement'],
    [
      ['NFR-01', 'Performance', 'API response time < 2 seconds for 95th percentile under 50 concurrent users'],
      ['NFR-02', 'Availability', 'System uptime ≥ 99% measured by continuous monitoring'],
      ['NFR-03', 'Security', 'All passwords hashed with bcrypt (cost factor 12); secrets rotated and never committed to VCS'],
      ['NFR-04', 'Scalability', 'Stateless API design with JWT to support horizontal scaling'],
      ['NFR-05', 'Responsiveness', 'UI fully functional on screens from 320px to 4K resolution'],
      ['NFR-06', 'Compatibility', 'Supported on Chrome, Firefox, Safari, Edge, and mobile browsers'],
      ['NFR-07', 'Maintainability', 'Code organized in feature modules with Zod validation and ESM imports'],
      ['NFR-08', 'Security', 'Docker images scanned for vulnerabilities; zero critical unresolved issues'],
    ],
    [1200, 1800, 6360]
  ),
  BREAK(),
];
// ── Chapter 4: System Design ──────────────────────────────────────────────────
const chapter4 = [
  H1('Chapter 4: System Design'),
  SPACE(),
  H2('4.1 System Architecture'),
  BODY('Smart IT Lab follows a three-tier architecture consisting of a React SPA frontend, a Node.js/Express backend API, and a MongoDB database, all connected through HTTPS with JWT-based stateless authentication.'),
  SPACE(),
  H3('4.1.1 Architecture Overview'),
  BODY('The system is deployed as two independent services on Railway cloud platform:'),
  BULLET('Frontend Service: Static React SPA served by Nginx, accessible at smart-it-lab-production.up.railway.app'),
  BULLET('Backend Service: Node.js Express API (beautiful-encouragement-production.up.railway.app)'),
  BULLET('Database: MongoDB Atlas M0 cluster in eu-west-1 (Ireland)'),
  SPACE(),
  H3('4.1.2 Communication Flow'),
  BODY('The browser communicates with the backend exclusively via HTTPS REST API calls. The frontend uses Axios with withCredentials: true to send the httpOnly refresh cookie alongside API requests. Server-Sent Events (SSE) are used for real-time lab event streaming from the backend to the browser.'),
  SPACE(),
  H2('4.2 Technology Stack'),
  SPACE(),
  simpleTable(
    ['Layer', 'Technology', 'Version', 'Purpose'],
    [
      ['Frontend', 'React', '18.3.1', 'UI framework'],
      ['Frontend', 'TypeScript', '5.x', 'Type safety'],
      ['Frontend', 'Vite', '6.3.5', 'Build tool'],
      ['Frontend', 'TailwindCSS', '4.1.12', 'Utility-first styling'],
      ['Frontend', 'shadcn/Radix UI', 'Latest', 'Component library'],
      ['Backend', 'Node.js', '20 LTS', 'JavaScript runtime'],
      ['Backend', 'Express', '4.18.2', 'HTTP framework'],
      ['Backend', 'Mongoose', '9.2.1', 'MongoDB ODM'],
      ['Backend', 'Passport.js', 'Latest', 'OAuth authentication'],
      ['Backend', 'Zod', 'Latest', 'Request validation'],
      ['Database', 'MongoDB Atlas', 'M0 Free', 'Document database'],
      ['Hosting', 'Railway', 'Cloud', 'PaaS deployment'],
      ['CDN/DNS', 'Cloudflare', 'Free', 'DNS and CDN'],
    ],
    [1800, 2000, 1600, 3960]
  ),
  SPACE(),
  H2('4.3 Database Design'),
  SPACE(),
  H3('4.3.1 Collections Overview'),
  BODY('The MongoDB database contains eight collections organized around the core domain entities:'),
  SPACE(),
  simpleTable(
    ['Collection', 'Purpose', 'Key Indexes'],
    [
      ['users', 'Student and admin accounts', 'email (unique), provider+providerId (unique)'],
      ['labs', 'Lab definitions and topology', 'labId (unique)'],
      ['userlabs', 'Student progress per lab', 'userId+labId (unique compound)'],
      ['achievements', 'Achievement definitions', 'achievementId (unique)'],
      ['userachievements', 'Student achievement records', 'userId+achievementId (unique compound)'],
      ['leaderboardentries', 'Weekly/monthly rankings', 'userId+period+weekOf (unique compound)'],
      ['usersettings', 'UI preferences per user', 'userId (unique)'],
      ['servermetrics', 'Admin server monitoring', 'serverId (unique)'],
    ],
    [2400, 3500, 3460]
  ),
  SPACE(),
  H3('4.3.2 Entity Relationships'),
  BODY('The database follows a document-oriented design with the following relationships:'),
  BULLET('Users ↔ Labs: Many-to-Many via UserLabs junction collection (one record per student per lab).'),
  BULLET('Users ↔ Achievements: Many-to-Many via UserAchievements (one record per student per achievement).'),
  BULLET('Users → LeaderboardEntries: One-to-Many (one entry per student per period per week).'),
  BULLET('Users → UserSettings: One-to-One (settings created on registration).'),
  BULLET('ServerMetrics: Standalone collection for admin monitoring, no foreign keys.'),
  SPACE(),
  H2('4.4 API Design'),
  BODY('The backend exposes a RESTful API under the /api prefix. All responses follow a consistent envelope: { success: boolean, message?: string, data?: any }. Rate limiting is applied globally with stricter limits on authentication endpoints.'),
  SPACE(),
  simpleTable(
    ['Route Group', 'Base Path', 'Key Endpoints'],
    [
      ['Authentication', '/api/auth', 'register, login, logout, refresh-token, me, verify-email, forgot-password, reset-password, github/callback, google/callback'],
      ['Labs', '/api/labs', 'GET /, GET /:id, POST /:id/start, POST /:id/stop, POST /:id/save-progress, POST /:id/terminal'],
      ['Achievements', '/api/achievements', 'GET /, POST /:id/unlock'],
      ['Leaderboard', '/api/leaderboard', 'GET /?period=weekly|monthly'],
      ['Settings', '/api/settings', 'GET /, PATCH /, PATCH /profile, PATCH /password, PATCH /avatar, DELETE /account'],
      ['Admin Users', '/api/users', 'GET /, GET /:id, PATCH /:id, DELETE /:id, PATCH /:id/suspend'],
      ['Admin Analytics', '/api/admin', 'GET /stats, GET /servers, GET /activity'],
      ['Events (SSE)', '/api/events', 'GET /lab/:id?token= (real-time lab events)'],
      ['Health', '/api/health', 'GET / (returns uptime, status, version)'],
    ],
    [2000, 2000, 5360]
  ),
  SPACE(),
  H2('4.5 Security Design'),
  BODY('Security is a foundational concern in Smart IT Lab, implemented at multiple layers:'),
  SPACE(),
  H3('4.5.1 Authentication Security'),
  BULLET('Passwords hashed with bcrypt at cost factor 12.'),
  BULLET('JWT access tokens expire after 15 minutes; refresh tokens after 7 days.'),
  BULLET('Refresh tokens stored as httpOnly, Secure, SameSite=Strict cookies.'),
  BULLET('Email and password reset tokens stored as SHA-256 hashes in the database.'),
  BULLET('OAuth tokens verified against provider APIs before account creation.'),
  SPACE(),
  H3('4.5.2 API Security'),
  BULLET('Helmet.js sets security headers including HSTS, X-Frame-Options, and CSP.'),
  BULLET('CORS configured to accept only the production frontend domain.'),
  BULLET('Express rate limiter applied globally with stricter limits on /api/auth.'),
  BULLET('All request bodies validated with Zod schemas before processing.'),
  BULLET('trust proxy enabled for correct IP detection behind Railway\'s edge.'),
  BREAK(),
];
// ── Chapter 5: Implementation ─────────────────────────────────────────────────
const chapter5 = [
  H1('Chapter 5: System Implementation'),
  SPACE(),
  H2('5.1 Frontend Implementation'),
  SPACE(),
  H3('5.1.1 Application Structure'),
  BODY('The React frontend is organized as a feature-based SPA with the following structure:'),
  BULLET('src/app/App.tsx: Root component providing Theme, Language, Auth, and Labs context providers.'),
  BULLET('src/app/routes.tsx: Centralized route definitions using createBrowserRouter.'),
  BULLET('src/app/contexts/: Authentication, theme, language, and labs state management.'),
  BULLET('src/app/pages/: One component per route (Landing, Dashboard, Labs, LabInterface, Admin).'),
  BULLET('src/app/services/: Axios singleton with interceptors for token refresh.'),
  BULLET('src/app/hooks/useLabEvents.ts: EventSource hook for SSE lab events.'),
  SPACE(),
  H3('5.1.2 Key UI Screens'),
  BODY('The application provides the following primary screens:'),
  BULLET('Landing Page: Marketing page with features, team section, and CTA.'),
  BULLET('Dashboard: Student overview with active labs, completed labs, rank, and streak.'),
  BULLET('My Labs: Searchable lab catalog with progress indicators and filters.'),
  BULLET('Lab Interface: Three-panel layout with instructions, network topology, and CLI terminal.'),
  BULLET('Achievements: Gallery of earned and locked achievements with progress indicators.'),
  BULLET('Leaderboard: Weekly and monthly rankings with points and average scores.'),
  BULLET('Admin Dashboard: User management, platform statistics, and server metrics.'),
  SPACE(),
  H2('5.2 Backend Implementation'),
  SPACE(),
  H3('5.2.1 Server Architecture'),
  BODY('The Express server follows a modular architecture where each feature domain (auth, labs, users, admin, achievements, leaderboard, settings, events) is encapsulated in its own module with dedicated routes, controllers, and services.'),
  SPACE(),
  BODY('Middleware execution order in server.js:'),
  NUMBERED('helmet() — Security headers'),
  NUMBERED('CORS configuration — Origin validation'),
  NUMBERED('express.json() / urlencoded() — Body parsing'),
  NUMBERED('cookieParser() — Cookie access'),
  NUMBERED('passport() — OAuth initialization'),
  NUMBERED('Rate limiter — Request throttling on /api'),
  NUMBERED('Route registration — Feature module routes'),
  NUMBERED('404 handler — Unknown route fallback'),
  NUMBERED('Global error handler — Centralized error response'),
  SPACE(),
  H3('5.2.2 Cisco IOS Simulation Engine'),
  BODY('The core innovation of Smart IT Lab is its stateful Cisco IOS simulation engine (ios-engine.js). The engine maintains per-device state including:'),
  BULLET('Current CLI mode (user EXEC, privileged EXEC, global configuration, interface configuration, router configuration).'),
  BULLET('Interface configurations (IP addresses, descriptions, status).'),
  BULLET('Routing protocol configurations (OSPF, BGP, RIP, static routes).'),
  BULLET('VLAN database and spanning tree configurations.'),
  BULLET('ACL definitions and assignments.'),
  SPACE(),
  BODY('For each lab, the engine validates student commands against predefined objectives. When an objective is met, the system fires an SSE event to the browser, updating the lab interface in real-time without page reload.'),
  SPACE(),
  H3('5.2.3 Real-Time Events with SSE'),
  BODY('Server-Sent Events provide unidirectional real-time communication from server to browser. Each active lab session maintains a connection in the labConnections Map. When the terminal engine detects an objective completion, it emits an event to all SSE clients associated with that lab session.'),
  SPACE(),
  H2('5.3 Lab Content'),
  BODY('Smart IT Lab provides 46 labs across 6 categories:'),
  SPACE(),
  simpleTable(
    ['Category', 'Labs Count', 'Topics Covered'],
    [
      ['Routing Protocols', '12', 'OSPF, BGP, RIP, Static Routes, Route Redistribution'],
      ['Switching', '8', 'VLAN Configuration, Trunk Ports, STP, EtherChannel'],
      ['Security', '8', 'ACL (Standard & Extended), NAT, Port Security, DHCP Snooping'],
      ['CCNA Track', '10', 'Comprehensive CCNA exam preparation labs'],
      ['Network Fundamentals', '5', 'IPv4/IPv6 Addressing, Subnetting, Basic Configuration'],
      ['Advanced Topics', '3', 'BGP Multi-AS, MPLS, QoS'],
    ],
    [2800, 1800, 4760]
  ),
  SPACE(),
  H2('5.4 Screenshots'),
  SPACE(),
  H3('5.4.1 Landing Page'),
  BODY('Figure 5.1 shows the Smart IT Lab landing page, featuring the platform tagline "Master Enterprise Networking in a Virtual Lab", key feature highlights, and the team section.'),
  SPACE(),
  H3('5.4.2 Student Dashboard'),
  BODY('Figure 5.2 shows the student dashboard displaying labs solved (6), global rank (#1), hours spent (3h), achievements earned (2), active labs, and completed lab history with scores.'),
  SPACE(),
  H3('5.4.3 Lab Interface'),
  BODY('Figure 5.3 shows the three-panel lab interface for "IPv6 Addressing & Configuration": objectives panel (left), network topology diagram (center), and the Cisco IOS CLI terminal (bottom). The live validation panel (right) shows real-time objective completion.'),
  SPACE(),
  H3('5.4.4 Leaderboard'),
  BODY('Figure 5.4 shows the competitive leaderboard with weekly rankings, points, labs completed, average score, and current streak.'),
  BREAK(),
];
// ── Chapter 6: DevOps & DevSecOps ────────────────────────────────────────────
const chapter6 = [
  H1('Chapter 6: DevOps and DevSecOps Implementation'),
  SPACE(),
  BODY('A key objective of this project is to demonstrate proficiency in DevOps and DevSecOps practices. This chapter documents the complete pipeline, toolchain, and security measures applied to Smart IT Lab in production.'),
  SPACE(),
  H2('6.1 DevOps Philosophy and Approach'),
  BODY('DevOps is a set of practices that combines software development (Dev) and IT operations (Ops), aiming to shorten the development lifecycle while delivering high-quality software continuously. For Smart IT Lab, DevOps principles are applied from code commit to production deployment through automated pipelines.'),
  SPACE(),
  BODY('DevSecOps extends DevOps by integrating security practices at every stage of the development pipeline — shifting security "left" so vulnerabilities are detected and resolved before reaching production.'),
  SPACE(),
  H2('6.2 Version Control Strategy'),
  BODY('The project uses GitHub for version control with the following branching strategy:'),
  BULLET('main: Production-ready code; all merges trigger automated deployment to Railway.'),
  BULLET('develop: Integration branch for feature development.'),
  BULLET('feature/*: Individual feature branches merged via pull requests.'),
  SPACE(),
  BODY('Branch protection rules are configured on main to require passing CI checks before any merge, preventing broken code from reaching production.'),
  SPACE(),
  H2('6.3 Containerization with Docker'),
  BODY('Both the frontend and backend are containerized using multi-stage Docker builds:'),
  SPACE(),
  H3('6.3.1 Frontend Dockerfile'),
  BODY('Stage 1 (Builder): Uses node:20-alpine to install dependencies and build the React SPA with Vite. The VITE_API_URL build argument injects the production API URL at build time.'),
  BODY('Stage 2 (Runner): Uses nginx:1.28-alpine to serve the static dist/ directory. A custom nginx.conf handles SPA routing with try_files fallback and enables gzip compression.'),
  SPACE(),
  H3('6.3.2 Backend Dockerfile'),
  BODY('The backend uses a multi-stage build with node:20-alpine, installing only production dependencies (npm ci --only=production). The container runs as a non-root expressjs user with dumb-init as PID 1 for proper signal handling. A curl healthcheck on /api/health ensures Railway detects service readiness.'),
  SPACE(),
  H2('6.4 CI/CD Pipeline'),
  BODY('GitHub Actions provides the automation backbone for continuous integration and deployment. The pipeline triggers on every push to main and pull request creation.'),
  SPACE(),
  simpleTable(
    ['Workflow', 'Trigger', 'Jobs', 'Duration'],
    [
      ['CI/CD Pipeline', 'push to main, PR', 'Frontend build validation', '~35 seconds'],
      ['Security Scan (Trivy)', 'push to main, PR', 'Docker image vulnerability scan', '~50 seconds'],
      ['Gitleaks Secret Scan', 'push to main, PR', 'Git history secret detection', '~8 seconds'],
      ['Semgrep Security Scan', 'push to main, PR', 'Static code security analysis', '~2 minutes'],
      ['Load Testing (k6)', 'push to main', 'Performance test with 50 VUs', '~2 minutes'],
    ],
    [2800, 2200, 2760, 1600]
  ),
  SPACE(),
  BODY('Railway is configured for automatic deployment on every successful push to main, providing seamless continuous delivery with zero-downtime deployments.'),
  SPACE(),
  H2('6.5 Cloud Infrastructure'),
  SPACE(),
  H3('6.5.1 Railway Platform'),
  BODY('Railway hosts two independent services within the meticulous-flexibility project:'),
  BULLET('Backend Service (beautiful-encouragement): Node.js Express API, Port 5000, 1 replica.'),
  BULLET('Frontend Service (smart-it-lab): Nginx static server, Port 8080.'),
  SPACE(),
  BODY('Railway provides automatic TLS certificate provisioning, environment variable management, deployment logs, metrics (CPU, RAM), and a built-in console for one-off commands such as database seeding.'),
  SPACE(),
  H3('6.5.2 MongoDB Atlas'),
  BODY('The database is hosted on MongoDB Atlas M0 (free tier) in eu-west-1 (Ireland). Network access is configured to allow connections from Railway\'s egress IPs. The connection string uses retryWrites=true&w=majority for durability.'),
  SPACE(),
  H2('6.6 DevSecOps Toolchain'),
  SPACE(),
  H3('6.6.1 Trivy — Docker Image Scanning'),
  BODY('Trivy by Aqua Security scans Docker images for known CVEs in OS packages and application dependencies. On the initial scan, 33 vulnerabilities were detected in the nginx:1.27-alpine base image. After upgrading to nginx:1.28-alpine, the count reduced to 20, all in Alpine system libraries (openssl, libxml2, musl) — none in application code. Results are reported as HIGH or CRITICAL with fixed version recommendations.'),
  SPACE(),
  H3('6.6.2 Gitleaks — Secret Detection'),
  BODY('Gitleaks scans the entire git history for accidentally committed secrets including API keys, passwords, JWT tokens, and connection strings. The scan runs with fetch-depth: 0 to examine all commits since repository creation. The scan returned clean results, confirming no secrets were ever committed to version control.'),
  SPACE(),
  H3('6.6.3 Semgrep — Static Application Security Testing'),
  BODY('Semgrep performs deep static analysis of the application source code using 2,933 security rules. The scan identified:'),
  BULLET('1 Reachable Supply Chain Finding: multer CVE-2026-5079 (HIGH) — Denial of Service via deeply nested field names.'),
  BULLET('15 Undetermined Supply Chain Findings: Various package vulnerabilities including nodemailer, qs, and undici.'),
  BULLET('54 Non-blocking Code Findings: Potential NoSQL injection patterns in MongoDB queries and XSS in SSE endpoint — flagged for future remediation.'),
  SPACE(),
  H3('6.6.4 Dependabot — Dependency Vulnerability Management'),
  BODY('GitHub Dependabot continuously monitors npm packages in both the frontend and backend for known vulnerabilities. It automatically opens pull requests with version bumps to patched releases. 25 vulnerabilities were identified across both package.json files, distributed as 11 high, 10 moderate, and 4 low severity.'),
  SPACE(),
  H3('6.6.5 GitHub Secret Scanning'),
  BODY('GitHub\'s native secret scanning monitors all pushes to the repository for patterns matching known secret formats (API keys, tokens, credentials). This provides an additional layer of protection beyond Gitleaks.'),
  SPACE(),
  H2('6.7 Monitoring and Observability'),
  SPACE(),
  H3('6.7.1 UptimeRobot'),
  BODY('UptimeRobot monitors the frontend service every 5 minutes via HTTP check. Alerts are sent via email to the development team when downtime is detected. Since deployment, the platform has maintained 100% uptime.'),
  SPACE(),
  H3('6.7.2 Sentry Error Tracking'),
  BODY('Sentry is integrated into the React frontend via @sentry/react SDK. It captures runtime JavaScript exceptions with full stack traces, browser information, user context, and reproduction steps. The Sentry organization (sofcore) is connected to the GitHub repository for commit-level error attribution.'),
  SPACE(),
  H2('6.8 Complete DevOps Architecture'),
  BODY('The complete DevOps and DevSecOps pipeline can be summarized as follows:'),
  SPACE(),
  simpleTable(
    ['Stage', 'Tool', 'Purpose', 'Status'],
    [
      ['Source Control', 'GitHub', 'Version control, PRs, branch protection', '✓ Active'],
      ['CI/CD', 'GitHub Actions', 'Automated build, test, deploy pipeline', '✓ Active'],
      ['Containerization', 'Docker', 'Multi-stage builds for both services', '✓ Active'],
      ['Hosting', 'Railway', 'PaaS cloud hosting with auto-deploy', '✓ Active'],
      ['Database', 'MongoDB Atlas', 'Managed cloud database (Ireland)', '✓ Active'],
      ['Container Security', 'Trivy', 'Docker image CVE scanning', '✓ Active'],
      ['Secret Detection', 'Gitleaks', 'Git history secret scanning', '✓ Active'],
      ['Code Security', 'Semgrep', 'Static application security testing', '✓ Active'],
      ['Dependency Security', 'Dependabot', 'Automated dependency updates', '✓ Active'],
      ['Uptime Monitoring', 'UptimeRobot', 'Availability monitoring every 5 min', '✓ Active'],
      ['Error Tracking', 'Sentry', 'Runtime error capture and alerting', '✓ Active'],
      ['Load Testing', 'k6', 'Performance testing with 50 VUs', '✓ Active'],
    ],
    [2400, 2000, 3360, 1600]
  ),
  BREAK(),
];
// ── Chapter 7: Testing ────────────────────────────────────────────────────────
const chapter7 = [
  H1('Chapter 7: Testing and Evaluation'),
  SPACE(),
  H2('7.1 Testing Strategy'),
  BODY('Smart IT Lab employs a multi-level testing strategy covering unit tests, integration tests, load testing, and security testing. Tests are automated and integrated into the CI/CD pipeline, ensuring every code change is verified before deployment.'),
  SPACE(),
  H2('7.2 Unit and Integration Testing'),
  SPACE(),
  H3('7.2.1 Backend Testing (Jest)'),
  BODY('The backend uses Jest with Supertest for HTTP testing and mongodb-memory-server for in-memory database testing. Coverage thresholds are set at 80% lines. The rate limiter is disabled in test mode (NODE_ENV=test) to prevent interference.'),
  SPACE(),
  H3('7.2.2 Frontend Testing (Vitest)'),
  BODY('The React frontend uses Vitest with Testing Library and jsdom for component testing. Tests verify rendering, user interactions, and API service functions.'),
  SPACE(),
  H2('7.3 Load Testing with k6'),
  BODY('k6 load testing was conducted against the production backend API endpoint /api/health with the following test scenario:'),
  SPACE(),
  simpleTable(
    ['Stage', 'Duration', 'Virtual Users', 'Purpose'],
    [
      ['Ramp-up', '30 seconds', '0 → 10 VUs', 'Gradual load increase'],
      ['Sustained load', '1 minute', '10 → 50 VUs', 'Peak load simulation'],
      ['Ramp-down', '30 seconds', '50 → 0 VUs', 'Gradual load decrease'],
    ],
    [2000, 2000, 2360, 3000]
  ),
  SPACE(),
  H3('7.3.1 Load Test Results'),
  SPACE(),
  simpleTable(
    ['Metric', 'Result', 'Threshold', 'Status'],
    [
      ['p(95) Response Time', '20.65 ms', '< 2000 ms', '✓ PASSED'],
      ['Average Response Time', '19.34 ms', 'N/A', '✓ Excellent'],
      ['Minimum Response Time', '17.75 ms', 'N/A', '✓ Excellent'],
      ['Maximum Response Time', '277.46 ms', 'N/A', '✓ Acceptable'],
      ['Total Requests', '2,653', 'N/A', '✓ Complete'],
      ['Throughput', '22 req/sec', 'N/A', '✓ Good'],
    ],
    [3000, 2000, 2000, 2360]
  ),
  SPACE(),
  BODY('The backend demonstrated excellent performance characteristics with a 95th percentile response time of only 20.65 milliseconds — far below the 2-second threshold — under 50 concurrent virtual users. This confirms the platform can handle significant concurrent load without performance degradation.'),
  SPACE(),
  H2('7.4 Security Testing Results'),
  SPACE(),
  H3('7.4.1 Trivy Docker Scan Summary'),
  BODY('After upgrading the base image from nginx:1.27-alpine to nginx:1.28-alpine, vulnerability count decreased from 33 to 20. All remaining vulnerabilities are in Alpine system libraries (openssl, libxml2, musl, nghttp2) — not in application code. These are tracked as known issues pending upstream Alpine package updates.'),
  SPACE(),
  H3('7.4.2 Gitleaks Scan Result'),
  BODY('Gitleaks scan of complete git history returned zero findings, confirming that no secrets, credentials, or sensitive configuration values were ever committed to the repository.'),
  SPACE(),
  H3('7.4.3 Semgrep Code Analysis Summary'),
  simpleTable(
    ['Finding Type', 'Count', 'Severity', 'Action'],
    [
      ['Reachable Supply Chain', '1', 'HIGH', 'multer upgrade to 2.2.0 planned'],
      ['Undetermined Supply Chain', '15', 'MODERATE', 'Tracked in Dependabot'],
      ['Non-blocking Code Issues', '54', 'LOW-MODERATE', 'Queued for future sprint'],
    ],
    [3000, 1500, 2000, 2860]
  ),
  SPACE(),
  H2('7.5 Manual Acceptance Testing'),
  BODY('Manual end-to-end acceptance testing was performed across all major user journeys:'),
  SPACE(),
  simpleTable(
    ['Test Case', 'Expected Result', 'Status'],
    [
      ['User registration and email verification', 'Account created, verification email sent', '✓ Pass'],
      ['Login with email/password', 'JWT tokens issued, dashboard loaded', '✓ Pass'],
      ['GitHub OAuth login', 'Account created/linked, tokens issued', '✓ Pass'],
      ['Browse and filter labs', 'Labs displayed with correct filters', '✓ Pass'],
      ['Start a Cisco IOS lab', 'Terminal loads, topology displayed', '✓ Pass'],
      ['Execute valid Cisco commands', 'Commands processed, output displayed', '✓ Pass'],
      ['Complete lab objective', 'Objective marked complete, score updated', '✓ Pass'],
      ['Submit completed lab', 'Score calculated, points awarded', '✓ Pass'],
      ['Unlock achievement', 'Achievement notification, points added', '✓ Pass'],
      ['View leaderboard', 'Rankings displayed correctly', '✓ Pass'],
      ['Admin suspend user', 'User account suspended', '✓ Pass'],
      ['Password reset via email', 'Reset link sent, password updated', '✓ Pass'],
      ['Mobile device access', 'All pages render correctly on mobile', '✓ Pass'],
    ],
    [3800, 3000, 2560]
  ),
  BREAK(),
];
// ── Chapter 8: Conclusion ─────────────────────────────────────────────────────
const chapter8 = [
  H1('Chapter 8: Conclusion and Future Work'),
  SPACE(),
  H2('8.1 Project Summary'),
  BODY('Smart IT Lab successfully delivers a production-ready, browser-based networking simulation platform that addresses a real and pressing challenge in IT education. Students at Menoufia University and beyond can now practice authentic Cisco IOS networking labs from any device, without the need for expensive hardware or resource-intensive software installations.'),
  SPACE(),
  BODY('The platform has achieved all stated objectives:'),
  BULLET('A stateful Cisco IOS CLI engine with real-time command validation is fully operational.'),
  BULLET('46 structured labs across 6 categories cover the core CCNA curriculum and beyond.'),
  BULLET('A gamified learning experience with achievements, points, streaks, and leaderboards increases student engagement.'),
  BULLET('Full administrative control enables instructors to monitor and manage student progress.'),
  BULLET('A complete DevOps and DevSecOps pipeline ensures continuous delivery, automated security, and production monitoring.'),
  SPACE(),
  H2('8.2 Technical Achievements'),
  BODY('Beyond the educational functionality, this project demonstrates significant technical competency:'),
  SPACE(),
  simpleTable(
    ['Domain', 'Achievement'],
    [
      ['Full-Stack Development', 'React 18 SPA with TypeScript, Node.js ESM backend, MongoDB ODM'],
      ['Authentication Security', 'JWT rotation, bcrypt hashing, OAuth 2.0, httpOnly cookies, email verification'],
      ['Real-Time Communication', 'Server-Sent Events for live lab validation and objective tracking'],
      ['DevOps Engineering', 'Docker multi-stage builds, Railway PaaS deployment, GitHub Actions CI/CD'],
      ['DevSecOps', 'Trivy, Gitleaks, Semgrep, Dependabot, GitHub Secret Scanning'],
      ['Performance Testing', 'k6 load testing: p(95) = 20.65ms under 50 concurrent users'],
      ['Monitoring', 'UptimeRobot (100% uptime), Sentry error tracking, k6 performance baselines'],
      ['Responsive Design', 'Full functionality on mobile, tablet, and desktop via TailwindCSS'],
    ],
    [3000, 6360]
  ),
  SPACE(),
  H2('8.3 Limitations'),
  BODY('The current implementation has the following known limitations:'),
  BULLET('SSE connections are stored in an in-memory Map, limiting horizontal scaling to a single backend replica.'),
  BULLET('The admin revenue statistics use estimated values rather than real transaction data.'),
  BULLET('Student streak tracking requires further refinement for edge cases.'),
  BULLET('25 npm package vulnerabilities detected by Dependabot are pending resolution.'),
  SPACE(),
  H2('8.4 Future Work'),
  BODY('Planned enhancements for future development iterations include:'),
  SPACE(),
  H3('8.4.1 Short-Term'),
  BULLET('Upgrade vulnerable packages (multer 2.2.0, nodemailer 9.0.1, undici 7.28.0).'),
  BULLET('Migrate SSE registry to Redis Pub/Sub to enable horizontal backend scaling.'),
  BULLET('Add Prometheus metrics endpoint and Grafana dashboard for observability.'),
  BULLET('Implement OWASP ZAP dynamic application security testing in CI pipeline.'),
  SPACE(),
  H3('8.4.2 Medium-Term'),
  BULLET('Add instructor role with lab creation and student assignment capabilities.'),
  BULLET('Implement Terraform Infrastructure as Code for reproducible cloud deployment.'),
  BULLET('Add video walkthrough support for lab objectives.'),
  BULLET('Develop mobile native applications for iOS and Android.'),
  SPACE(),
  H3('8.4.3 Long-Term'),
  BULLET('Expand lab catalog to cover CCNP and AWS/Azure cloud networking certifications.'),
  BULLET('Implement AI-powered hints that analyze student command history.'),
  BULLET('Add collaborative labs enabling multiple students to work on shared topology.'),
  BULLET('Pursue university-level licensing to integrate with official CCNA curriculum.'),
  SPACE(),
  H2('8.5 Conclusion'),
  BODY('Smart IT Lab represents a comprehensive graduation project that bridges the gap between theoretical networking education and practical hands-on experience. By combining authentic Cisco IOS simulation, gamified learning, and production-grade DevOps infrastructure, the project demonstrates the team\'s readiness for professional software engineering roles.'),
  SPACE(),
  BODY('The application of DevOps and DevSecOps practices — from containerization and CI/CD pipelines to automated security scanning and continuous monitoring — reflects industry standards and validates the team\'s commitment to building software that is not just functional, but secure, reliable, and maintainable.'),
  SPACE(),
  BODY('We are proud to present Smart IT Lab as a contribution to educational technology in Egypt and the Arab world, and we look forward to its continued development and adoption.'),
  BREAK(),
];
// ── References ────────────────────────────────────────────────────────────────
const references = [
  H1('References'),
  SPACE(),
  NUMBERED('Cisco Systems. (2024). Cisco Packet Tracer User Guide. Cisco Networking Academy.'),
  NUMBERED('Fielding, R. T., & Taylor, R. N. (2002). Principled Design of the Modern Web Architecture. ACM Transactions on Internet Technology, 2(2), 115-150.'),
  NUMBERED('Humble, J., & Farley, D. (2010). Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation. Addison-Wesley.'),
  NUMBERED('Kim, G., Humble, J., Debois, P., & Willis, J. (2016). The DevOps Handbook. IT Revolution Press.'),
  NUMBERED('MongoDB, Inc. (2024). MongoDB Manual — Schema Design Best Practices. MongoDB Documentation.'),
  NUMBERED('OWASP Foundation. (2024). OWASP Top Ten Web Application Security Risks. https://owasp.org/Top10/'),
  NUMBERED('React Team. (2024). React 18 Documentation. https://react.dev'),
  NUMBERED('Shostack, A. (2014). Threat Modeling: Designing for Security. Wiley.'),
  NUMBERED('Turnbull, J. (2014). The Docker Book: Containerization is the New Virtualization. James Turnbull.'),
  NUMBERED('Vercel. (2024). Vite Documentation — Build Tool Guide. https://vitejs.dev'),
  NUMBERED('Aqua Security. (2024). Trivy Documentation — Container Security Scanner. https://trivy.dev'),
  NUMBERED('Grafana Labs. (2024). k6 Documentation — Load Testing for Engineering Teams. https://k6.io/docs'),
  BREAK(),
];
// ── Appendices ────────────────────────────────────────────────────────────────
const appendices = [
  H1('Appendix A: System API Reference'),
  SPACE(),
  BODY('This appendix provides a complete reference of all API endpoints exposed by the Smart IT Lab backend. The API is accessible at https://beautiful-encouragement-production.up.railway.app/api'),
  SPACE(),
  H2('A.1 Authentication Endpoints'),
  simpleTable(
    ['Method', 'Endpoint', 'Description', 'Auth Required'],
    [
      ['POST', '/api/auth/register', 'Create new student account', 'No'],
      ['POST', '/api/auth/login', 'Authenticate and receive tokens', 'No'],
      ['POST', '/api/auth/logout', 'Invalidate refresh token', 'Yes'],
      ['POST', '/api/auth/refresh-token', 'Exchange refresh token for new access token', 'Cookie'],
      ['GET', '/api/auth/me', 'Get authenticated user profile', 'Yes'],
      ['POST', '/api/auth/verify-email', 'Verify email with token', 'No'],
      ['POST', '/api/auth/forgot-password', 'Request password reset email', 'No'],
      ['POST', '/api/auth/reset-password', 'Reset password with token', 'No'],
      ['GET', '/api/auth/github', 'Initiate GitHub OAuth flow', 'No'],
      ['GET', '/api/auth/google', 'Initiate Google OAuth flow', 'No'],
    ],
    [1200, 2800, 3360, 1900]
  ),
  SPACE(),
  BREAK(),
  H1('Appendix B: Database Schema Details'),
  SPACE(),
  BODY('This appendix provides the complete MongoDB schema definitions for all collections in the Smart IT Lab database, including field types, constraints, and indexes.'),
  SPACE(),
  H2('B.1 Users Collection'),
  BODY('Primary collection storing all user accounts including students, instructors, and administrators.'),
  SPACE(),
  simpleTable(
    ['Field', 'Type', 'Constraint', 'Description'],
    [
      ['_id', 'ObjectId', 'PK, auto', 'MongoDB document identifier'],
      ['name', 'String', 'required, trim', 'Display name'],
      ['email', 'String', 'required, unique, lowercase', 'Login email address'],
      ['password', 'String', 'select: false', 'bcrypt hash (cost 12), not returned by default'],
      ['role', 'Enum', 'default: student', 'student | admin | instructor'],
      ['plan', 'Enum', 'default: free', 'free | pro | enterprise'],
      ['isActive', 'Boolean', 'default: true', 'Account enabled status'],
      ['emailVerified', 'Boolean', 'default: false', 'Email confirmation status'],
      ['provider', 'Enum', 'default: local', 'local | github | google'],
      ['totalPoints', 'Number', 'default: 0', 'Cumulative gamification points'],
      ['streak', 'Number', 'default: 0', 'Current consecutive day streak'],
    ],
    [1800, 1400, 2200, 3960]
  ),
  SPACE(),
  H2('B.2 UserLabs Collection'),
  BODY('Junction collection tracking each student\'s progress on each lab, including full command history and device state.'),
  SPACE(),
  simpleTable(
    ['Field', 'Type', 'Constraint', 'Description'],
    [
      ['userId', 'ObjectId', 'required, FK → Users', 'Reference to student'],
      ['labId', 'String', 'required, FK → Labs.labId', 'Reference to lab (string ID)'],
      ['status', 'Enum', 'required', 'not-started | running | stopped | completed'],
      ['progress', 'Number', 'min: 0, max: 100', 'Percentage of objectives completed'],
      ['score', 'Number', 'default: 0', 'Lab score out of 100'],
      ['completedObjectives', '[Number]', 'default: []', 'Array of completed objective indices'],
      ['commandHistory', '[Object]', 'max: 500 entries', 'Full CLI session history'],
      ['deviceStates', 'Mixed', 'default: {}', 'Current IOS state per device'],
    ],
    [2400, 1400, 2000, 3560]
  ),
  BREAK(),
  H1('Appendix C: DevOps Pipeline Configuration'),
  SPACE(),
  H2('C.1 GitHub Actions Workflow'),
  BODY('The following GitHub Actions workflows are configured in .github/workflows/:'),
  SPACE(),
  simpleTable(
    ['File', 'Workflow Name', 'Triggers', 'Jobs'],
    [
      ['ci-cd.yml', 'CI/CD Pipeline', 'push main, PR', 'frontend-test'],
      ['security.yml', 'Security Scan', 'push main, PR', 'trivy-scan'],
      ['gitleaks.yml', 'Gitleaks Secret Scan', 'push main, PR', 'gitleaks'],
      ['semgrep.yml', 'Semgrep Security Scan', 'push main, PR', 'semgrep'],
      ['load-test.yml', 'Load Testing', 'push main', 'k6-load-test'],
      ['dependabot.yml', 'Dependabot Updates', 'weekly schedule', 'auto-PRs'],
    ],
    [2000, 2400, 2200, 2760]
  ),
  SPACE(),
  H2('C.2 Environment Variables Reference'),
  simpleTable(
    ['Variable', 'Service', 'Required', 'Description'],
    [
      ['NODE_ENV', 'Backend', 'Yes', 'Runtime environment (production)'],
      ['PORT', 'Backend', 'Auto', 'Listen port (Railway injects)'],
      ['MONGO_URI', 'Backend', 'Yes', 'MongoDB Atlas connection string'],
      ['JWT_SECRET', 'Backend', 'Yes', 'Access token signing key (64 bytes, base64)'],
      ['JWT_REFRESH_SECRET', 'Backend', 'Yes', 'Refresh token signing key (different from above)'],
      ['JWT_ACCESS_EXPIRY', 'Backend', 'No', 'Access token TTL (default: 15m)'],
      ['JWT_REFRESH_EXPIRY', 'Backend', 'No', 'Refresh token TTL (default: 7d)'],
      ['FRONTEND_URL', 'Backend', 'Yes', 'Allowed CORS origin (production frontend URL)'],
      ['GITHUB_CLIENT_ID', 'Backend', 'Optional', 'GitHub OAuth application ID'],
      ['GITHUB_CLIENT_SECRET', 'Backend', 'Optional', 'GitHub OAuth application secret'],
      ['GOOGLE_CLIENT_ID', 'Backend', 'Optional', 'Google OAuth client ID'],
      ['CLOUDINARY_CLOUD_NAME', 'Backend', 'Optional', 'Cloudinary for avatar uploads'],
      ['SMTP_HOST', 'Backend', 'Optional', 'SMTP server (tokens logged to console if absent)'],
      ['VITE_API_URL', 'Frontend', 'Yes', 'Backend API base URL (build-time injection)'],
    ],
    [2600, 1400, 1400, 3960]
  ),
];
// ── Build Document ────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 100 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 100 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 24 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F4E79' },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },
          children: [
            new TextRun({ text: 'Smart Network Simulation Labs', bold: true, color: '1F4E79', size: 18 }),
            new TextRun({ text: '   |   Faculty of Computers and Information, Menoufia University', color: '666666', size: 18 }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Page ', size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '666666' }),
            new TextRun({ text: ' of ', size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '666666' }),
          ]
        })]
      })
    },
    children: [
      ...coverPage,
      // TOC
      H1('Table of Contents'),
      new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
      BREAK(),
      ...abstractSection,
      ...chapter1,
      ...chapter2,
      ...chapter3,
      ...chapter4,
      ...chapter5,
      ...chapter6,
      ...chapter7,
      ...chapter8,
      ...references,
      ...appendices,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:/Users/C-store/Desktop/Smart_IT_Lab_Graduation_Book.docx', buffer);
  console.log('✅ Book created successfully!');
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});