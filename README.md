#Earn Your Scroll 🎯

**Earn Your Scroll** is a productivity application that gamifies focus time. Work first, earn minutes, then guilt-free enjoy your favorite sites. Stop procrastinating, start earning!
<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/2851b8f4-e2fc-4feb-afa4-f32e35709cba" />

## ✨ Features

### 🎮 Gamified Productivity
- **Earn minutes** by completing focused work sessions
- **Bank your time** to spend on entertainment sites
- **Level up** with XP points from consistent focus
- **Streak bonuses** - longer streaks = higher multipliers
- **Achievements system** - unlock rewards for milestones

### 🧠 Maya — Your AI Companion Everywhere

#### 🌐 In the Web App
- **Smart Session Planning** - Maya drafts task breakdowns
- **Content Summarization** - Queue articles to read later
- **Procrastination Coaching** - Personalized advice when you abandon sessions
- **Chat Interface** - Ask Maya anything about your progress

#### 💻 VS Code Extension
Maya watches your VS Code window to keep you focused:

- **Detects when you're stuck** - Same file open for 10+ minutes? Maya asks if you need help
- **Motivation nudges** - "You've been crushing it! 15 more minutes and you level up"
- **Quick questions** - Ask Maya without leaving your editor
- **Session syncing** - Your VS Code focus counts toward your streak
- **Custom notifications** - Encouraging messages when you complete tasks

### 📊 Analytics & Stats
- **Focus heatmaps** - Track your most productive hours
- **Activity calendar** - 90-day visual history
- **Peak performance insights** - When you work best
- **Completion rates** - Track your consistency

### 🚫 Site Blocking
- **Block distracting sites** during focus sessions
- **Whitelist management** - Control what you can access
- **Chrome extension support** - Automatic blocking
- **Quick-add suggestions** for popular sites

### 📁 Project Management
- **Organize tasks** by projects
- **Track progress** with visual indicators
- **Task completion** - Check off what you've done
- **Time tracking** per project and task

## 🎨 Design System

### Color Palette
- **Primary Green**: `#1D5D3D` - Deep forest green for primary actions
- **Secondary Green**: `#4CAF50`, `#8BB5A4` - Accent gradients
- **Neutrals**: `#F5F7F6` (background), `#FFFFFF` (cards), `#E8EDEB` (borders)
- **Text**: `#1A2E26` (dark), `#6B7A74` (light), `#94A6A0` (subtle)
- **Accents**: `#D4A500` (warnings/streaks), `#C4DDD2` (success states)

### Typography
- **Font Family**: Inter / Plus Jakarta Sans (Geometric Sans-Serif)
- **Hierarchy**: Clear visual distinction between headings, body text, and labels

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome browser (for extension)
- VS Code (for Maya companion extension)

### Installation

# 1. Clone and install
git clone https://github.com/salmaRahim04/hackathon_project_anti_procrastination.git
cd hackathon_project_anti_procrastination
npm install

# 2. Create .env.local with your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env.local
echo "DATABASE_URL=file:./dev.db" >> .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3005" >> .env.local

# 3. Setup database
npm run db:migrate

# 4. Run the app
npm run dev

# 5. Open http://localhost:3005
