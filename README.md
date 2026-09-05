# CreatorOS

CreatorOS is a comprehensive platform designed for creators, featuring a robust end-user application and a powerful administrative console. The project is structured as a monorepo containing two Next.js web applications.

## 🏗️ Project Architecture & Features

The project consists of two main applications, each tailored for different user roles and workflows.

### 1. CreatorOS Web (`/creatoros-web`)
The primary user-facing application for creators, providing a full suite of tools to manage and generate content.

#### 🌐 Public Pages
Accessible to all visitors, these pages serve as the landing and marketing front for CreatorOS:
- **Home**: The main landing page showcasing the platform.
- **About**: Information about the CreatorOS mission and team.
- **Features**: Detailed breakdown of the platform's capabilities.
- **How It Works**: A guide on getting started and using the tools.
- **Pricing**: Subscription tiers and pricing information.
- **Contact**: Get in touch with support or sales.
- **Login / Register**: Secure authentication portals for users.

#### 📊 Creator Dashboard
The core workspace for authenticated creators:
- **Dashboard Home**: Overview of recent activity, quick actions, and metrics.
- **Analytics**: Detailed performance metrics and insights for creator content.
- **Media**: Asset management and media library.
- **Avatar Studio**: Tools for creating and managing custom AI avatars.
- **Voice Studio**: AI voice generation and voice cloning management.
- **Thumbnail Generator**: AI-powered tool for generating high-converting video thumbnails.
- **Lesson Generator**: Course and educational content creation assistant.
- **Captions**: Auto-caption generation and subtitle editing.
- **Calendar & Scheduler**: Content planning, scheduling, and calendar views.
- **Settings**: Account, billing, and workspace preferences.

### 2. CreatorOS Admin (`/creatoros-admin`)
The administrative console for platform operators to monitor and manage the ecosystem.

#### 🛡️ Admin Pages & Content
- **Admin Dashboard**: High-level overview of platform health, user signups, and system status.
- **Users**: Complete user management, including roles, permissions, and account statuses.
- **API Management**: Creation, revocation, and management of API keys for integrations.
- **API Usage**: Analytics and tracking of API request volumes, quotas, and limits.
- **Jobs**: Monitoring and management of background tasks, queues, and AI processing jobs.
- **Logs**: System and audit logs for security, debugging, and compliance.
- **System**: Overall system health checks, environment status, and configuration.
- **Login / Auth**: Secure authentication portal specifically for administrators.
- **Unauthorized**: Fallback page for handling missing permissions.

## 🛠️ Tech Stack

Both applications are built with a modern, high-performance tech stack:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/) & PostgreSQL
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Forms & Validation**: React Hook Form & Zod
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- A Supabase project or local Supabase instance
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies for both projects:

```bash
# Install Web dependencies
cd creatoros-web
npm install

# Install Admin dependencies
cd ../creatoros-admin
npm install
```

### Environment Variables

You will need to set up your `.env.local` files in both the `creatoros-web` and `creatoros-admin` directories. Reference the `.env.example` files provided in each directory.

Key variables usually include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `POSTGRES_URL` (for database setup scripts)

### Database Setup

The web application includes database setup scripts. From the `creatoros-web` directory:
```bash
node setup_db.js
```

### Running the Development Servers

You can run both applications concurrently in separate terminal windows.

**For CreatorOS Web:**
```bash
cd creatoros-web
npm run dev
```
The web app will be available at [http://localhost:3000](http://localhost:3000) (or the assigned port).

**For CreatorOS Admin:**
```bash
cd creatoros-admin
npm run dev
```
The admin app will be available at [http://localhost:3001](http://localhost:3001) (or the assigned port).

## 📄 License
*Specify license here*
