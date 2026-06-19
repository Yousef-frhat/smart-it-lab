# Smart IT Lab Platform - Full Stack B2B SaaS EdTech Application

## 🎓 Project Overview

Smart IT Lab is a comprehensive B2B SaaS EdTech platform designed for enterprise networking education. Built with React, TypeScript, and modern web technologies, it provides interactive lab environments for students to master networking concepts through hands-on practice.

## ✨ Key Features

### 1. **Complete Authentication System**
- Email/password authentication
- Social login (GitHub, Google)
- Protected routes with role-based access control
- Persistent sessions using localStorage
- Admin and Student roles

**Demo Credentials:**
- **Admin**: admin@smartitlab.com / admin123
- **Student**: Any email/password combination

### 2. **Six Main Pages**

#### Landing Page (`/`)
- Professional hero section with CTA
- Feature highlights
- Interactive team grid
- Responsive design

#### Pricing Page (`/pricing`)
- Three-tier pricing (Free, Pro, Enterprise)
- Stripe-style checkout flow
- Plan comparison
- Feature breakdown per tier

#### Authentication Page (`/auth`)
- Login/Register tabs
- Social OAuth integration
- Password validation
- Forgot password flow

#### Student Dashboard (`/dashboard`)
- **Dashboard Overview**: Stats, progress tracking, active labs
- **My Labs** (`/dashboard/labs`): Complete lab management with filters
- **Achievements** (`/dashboard/achievements`): Gamification system with 12+ achievements
- **Leaderboard** (`/dashboard/leaderboard`): Global rankings with weekly/monthly views
- **Settings** (`/dashboard/settings`): Profile, notifications, appearance, privacy

#### Lab Interface (`/lab/:id`)
- Split-screen design
- Interactive network topology visualization
- Live CLI terminal with command execution
- Real-time feedback system
- Progress tracking

#### Admin Dashboard (`/admin`)
- User management with CRUD operations
- Server monitoring with live metrics
- Platform analytics
- Advanced filtering and search

### 3. **Interactive Lab System**

Four fully-configured labs:

1. **OSPF Troubleshooting** (Advanced)
   - Multi-router OSPF configuration
   - Neighbor relationship troubleshooting
   - Area configuration

2. **VLAN Configuration** (Intermediate)
   - VLAN creation and management
   - Trunk port configuration
   - Inter-VLAN routing

3. **ACL Security Setup** (Intermediate)
   - Standard and Extended ACLs
   - Traffic filtering
   - Security policy implementation

4. **BGP Routing Protocol** (Advanced)
   - eBGP and iBGP configuration
   - AS path manipulation
   - Route filtering

### 4. **Complete Data Persistence**

All data persists in `localStorage`:
- User profiles and authentication state
- Lab progress and scores
- Achievement unlocks
- Settings preferences
- Terminal command history
- Admin management data

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Routing**: React Router 7 (Data mode with nested routes)
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Radix UI primitives
- **Charts**: Recharts for data visualization
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Design System
- **Background**: Deep charcoal (#0F172A)
- **Primary**: Cyber blue (#3B82F6)
- **Success/Terminal**: Neon green (#00FF41)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Typography**: 
  - UI: Inter/Roboto
  - Code: JetBrains Mono/Fira Code (monospace)

### State Management
- React Context API for global state (Authentication)
- Local state with React hooks
- Service layer pattern for business logic

### Key Services

#### `auth-context.tsx`
```typescript
- User authentication and session management
- Login, register, social OAuth
- Role-based access control (Student/Admin)
- Persistent authentication state
```

#### `lab-service.ts`
```typescript
- Lab instance management
- Terminal command execution
- Progress tracking
- Mock network device responses
- Objective completion tracking
```

#### `admin-service.ts`
```typescript
- User CRUD operations
- Server metrics monitoring
- Platform statistics
- User activity tracking
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                    # 40+ Radix UI components
│   │   ├── dashboard-layout.tsx   # Shared dashboard layout
│   │   ├── protected-route.tsx    # Route protection HOC
│   │   └── figma/                 # Figma-specific components
│   ├── contexts/
│   │   └── auth-context.tsx       # Authentication context
│   ├── pages/
│   │   ├── landing.tsx            # Public landing page
│   │   ├── pricing.tsx            # Pricing tiers
│   │   ├── auth.tsx               # Login/Register
│   │   ├── student-dashboard.tsx  # Dashboard overview
│   │   ├── my-labs.tsx            # Lab management
│   │   ├── achievements.tsx       # Achievement system
│   │   ├── leaderboard.tsx        # Competitive rankings
│   │   ├── settings.tsx           # User settings
│   │   ├── lab-interface.tsx      # Interactive lab
│   │   └── admin-dashboard.tsx    # Admin panel
│   ├── services/
│   │   ├── lab-service.ts         # Lab business logic
│   │   └── admin-service.ts       # Admin operations
│   ├── routes.tsx                 # React Router configuration
│   └── App.tsx                    # Root component
├── styles/
│   ├── theme.css                  # Design tokens
│   └── fonts.css                  # Font imports
└── main.tsx                       # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Quick Start Guide

1. **Access the Application**
   - Open browser to `http://localhost:3000`
   - Navigate to landing page

2. **Login as Student**
   - Click "Get Started" or navigate to `/auth`
   - Register with any email/password
   - Or use social login buttons

3. **Explore Dashboard**
   - View stats and progress on main dashboard
   - Navigate through sidebar tabs:
     - Dashboard: Overview and quick actions
     - My Labs: Browse and filter all labs
     - Achievements: Track your progress
     - Leaderboard: See global rankings
     - Settings: Customize your experience

4. **Start a Lab**
   - Click on any lab card
   - Lab interface opens with topology and terminal
   - Execute commands in the CLI
   - Complete objectives to progress

5. **Admin Access**
   - Login with: admin@smartitlab.com / admin123
   - Access admin panel at `/admin`
   - Manage users and monitor servers

## 🎯 Features by Page

### Student Dashboard Features
✅ Real-time stats (labs completed, rank, hours, achievements)  
✅ Progress tracking with visual indicators  
✅ Current streak counter  
✅ Quick access to active labs  
✅ Responsive grid layout  

### My Labs Features
✅ Advanced filtering (status, difficulty, category)  
✅ Real-time search  
✅ Progress visualization  
✅ Detailed lab cards  
✅ Quick action buttons  

### Achievements Features
✅ 12+ unique achievements across 6 categories  
✅ Tier system (Bronze, Silver, Gold, Platinum)  
✅ Progress tracking per achievement  
✅ Points system  
✅ Recently unlocked section  

### Leaderboard Features
✅ Global rankings  
✅ Weekly/Monthly views  
✅ Trend indicators (up/down/same)  
✅ User highlighting  
✅ Multiple stat columns  
✅ Streak tracking  

### Settings Features
✅ Profile management  
✅ Avatar upload placeholder  
✅ Notification preferences  
✅ Theme selection (Dark/Light/Auto)  
✅ Language selection (6 languages)  
✅ Privacy controls  
✅ Account deletion  

### Lab Interface Features
✅ Interactive network topology  
✅ Real-time CLI terminal  
✅ Command autocomplete  
✅ Multi-device support  
✅ Objective tracking  
✅ Progress percentage  
✅ Score calculation  
✅ Save/Resume functionality  

### Admin Dashboard Features
✅ User management (view, edit, suspend, delete)  
✅ Real-time server monitoring  
✅ Platform analytics  
✅ Advanced search and filters  
✅ User activity tracking  
✅ Server health metrics  

## 📊 Data Models

### User
```typescript
{
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  avatar?: string
  plan?: 'free' | 'pro' | 'enterprise'
  createdAt: string
}
```

### Lab
```typescript
{
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  estimatedTime: string
  status: 'not-started' | 'running' | 'stopped' | 'completed'
  progress: number
  score: number
  topology: TopologyNode[]
  objectives: string[]
}
```

### Achievement
```typescript
{
  id: string
  name: string
  description: string
  points: number
  unlocked: boolean
  category: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  progress?: number
  maxProgress?: number
}
```

## 🔐 Security & Authentication

- **Client-side authentication** with localStorage persistence
- **Protected routes** using HOC pattern
- **Role-based access control** (RBAC)
- **Session management** with automatic logout
- **Password validation** on registration
- **OAuth integration** placeholders for GitHub/Google

## 🎨 Design System

### Color Palette
```css
--background: #0F172A     /* Deep charcoal */
--surface: #1E293B        /* Elevated surface */
--border: #334155         /* Subtle borders */
--primary: #3B82F6        /* Cyber blue */
--success: #00FF41        /* Neon green */
--warning: #F59E0B        /* Amber */
--error: #EF4444          /* Red */
--muted: #94A3B8          /* Text secondary */
```

### Typography
- **Headings**: System font stack (Inter, -apple-system, sans-serif)
- **Code/Terminal**: Monospace (JetBrains Mono, Consolas, monospace)
- **Body**: System sans-serif

### Components
40+ pre-built UI components including:
- Buttons, Cards, Badges
- Forms (Input, Select, Switch, Checkbox)
- Overlays (Dialog, Alert, Sheet, Popover)
- Data (Table, Tabs, Accordion)
- Feedback (Toast, Progress, Skeleton)
- Navigation (Sidebar, Breadcrumbs, Pagination)

## 🔄 State Management Flow

```
Authentication:
AuthContext → localStorage → Protected Routes → Page Components

Lab Management:
labService → localStorage → Lab Interface → Terminal Commands

Admin Operations:
adminService → localStorage → Admin Dashboard → User Actions

Settings:
Settings Page → localStorage → Application State
```

## 📱 Responsive Design

- **Mobile First**: Optimized for small screens
- **Breakpoints**: 
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- **Adaptive Layout**: Grid systems adjust automatically
- **Touch Friendly**: Large tap targets on mobile

## 🧪 Testing the Platform

### Test Scenarios

1. **Student Workflow**
   ```
   Register → Login → View Dashboard → Start Lab → 
   Execute Commands → Complete Objectives → View Progress → 
   Check Achievements → View Leaderboard
   ```

2. **Admin Workflow**
   ```
   Login as Admin → View Users → Suspend User → 
   Monitor Servers → View Analytics → Manage Platform
   ```

3. **Lab Interaction**
   ```
   Select Lab → View Topology → Open Terminal → 
   Execute Commands → See Output → Complete Objectives → 
   Get Score → Resume Later
   ```

## 🚧 Future Enhancements

### Backend Integration (Supabase Ready)
- Real-time database synchronization
- User authentication with Supabase Auth
- File storage for lab configurations
- Real-time collaboration features
- Analytics and monitoring

### Additional Features
- Video tutorials integration
- Live chat/help system
- Certificate generation
- Team/classroom management
- Progress export (PDF reports)
- Mobile app (React Native)

## 📝 Environment Variables

```env
# For future backend integration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=your_api_endpoint
```

## 🤝 Contributing

This is a graduation project showcasing modern web development practices:
- Clean code architecture
- Component-based design
- Service layer pattern
- Responsive design
- Accessibility considerations
- Type safety with TypeScript

## 📄 License

This project is part of a graduation project and is provided for educational purposes.

## 👥 Credits

Developed as a comprehensive demonstration of:
- React 18 best practices
- TypeScript type safety
- Modern UI/UX patterns
- Full-stack architecture (frontend-ready)
- B2B SaaS design patterns

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
