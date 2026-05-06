// ─── Streak ───────────────────────────────────────────────────────────────────

export function getStreakMultiplier(currentStreak) {
  if (currentStreak >= 7) return 2.0
  if (currentStreak >= 5) return 1.5
  if (currentStreak >= 3) return 1.25
  return 1.0
}

export function calculateEarnedMinutes(plannedMinutes, actualMinutes, multiplier = 1.0) {
  const ratio = Math.min(actualMinutes / plannedMinutes, 1)
  const base  = Math.round(plannedMinutes * ratio)
  return Math.round(base * multiplier)
}

export function incrementStreak(lastActiveDate, currentStreak) {
  if (!lastActiveDate) return 1
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last  = new Date(lastActiveDate); last.setHours(0, 0, 0, 0)
  const diff  = Math.round((today - last) / 86400000)
  if (diff === 0) return currentStreak
  if (diff === 1) return currentStreak + 1
  return 1
}

export function checkStreakExpiry(lastActiveDate, currentStreak) {
  if (!lastActiveDate || currentStreak === 0) return 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last  = new Date(lastActiveDate); last.setHours(0, 0, 0, 0)
  const diff  = Math.round((today - last) / 86400000)
  return diff <= 1 ? currentStreak : 0
}

// ─── XP & Levels ──────────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3300, 4300, 5500]
export const LEVEL_NAMES = [
  'Beginner', 'Focused', 'Dedicated', 'Consistent', 'Deep Worker',
  'Flow Seeker', 'Flow Master', 'Focus Pro', 'Elite', 'Legend', '⚡ Transcendent',
]

export function xpToLevel(xp) {
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp < LEVEL_THRESHOLDS[i]) return i
  }
  return LEVEL_THRESHOLDS.length
}

export function xpProgressInLevel(xp) {
  const level = xpToLevel(xp)
  const lo = LEVEL_THRESHOLDS[level - 1] ?? 0
  const hi = LEVEL_THRESHOLDS[level]    ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000
  return { current: xp - lo, needed: hi - lo, pct: Math.round(((xp - lo) / (hi - lo)) * 100) }
}

export function calculateSessionXP(earnedMinutes, completed, isFirstEver) {
  let xp = earnedMinutes                    // 1 XP per minute
  if (completed) xp += 10                  // completion bonus
  if (isFirstEver) xp += 25               // first session ever
  return xp
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  { id: 'first_session', name: 'First Session',   icon: '🎯', desc: 'Complete your first focus session',         xp: 25 },
  { id: 'hour_power',    name: 'Hour Power',       icon: '⚡', desc: 'Earn 60 minutes in a single day',           xp: 30 },
  { id: 'streak_3',      name: 'Habit Forming',    icon: '🔥', desc: '3-day focus streak',                        xp: 40 },
  { id: 'streak_7',      name: 'One Week Strong',  icon: '🏆', desc: '7-day focus streak',                        xp: 100 },
  { id: 'streak_30',     name: 'Unstoppable',      icon: '💎', desc: '30-day focus streak',                       xp: 500 },
  { id: 'marathon',      name: 'Marathon',         icon: '🏃', desc: 'Complete a 50-minute session',              xp: 50 },
  { id: 'century',       name: 'Century Club',     icon: '💯', desc: 'Earn 100 minutes in a day',                 xp: 75 },
  { id: 'night_owl',     name: 'Night Owl',        icon: '🦉', desc: 'Complete a session after 10 PM',            xp: 20 },
  { id: 'early_bird',    name: 'Early Bird',       icon: '🐦', desc: 'Complete a session before 7 AM',            xp: 20 },
  { id: 'flow_state',    name: 'Flow State',       icon: '🌊', desc: 'Rate a session 5 / 5 focus',               xp: 15 },
  { id: 'iron_will',     name: 'Iron Will',        icon: '💪', desc: '10 sessions without abandoning',            xp: 80 },
  { id: 'time_investor', name: 'Time Investor',    icon: '⏰', desc: 'Earn 300 total minutes',                    xp: 50 },
  { id: 'deep_worker',   name: 'Deep Worker',      icon: '🧠', desc: 'Earn 600 total minutes',                    xp: 150 },
  { id: 'x5_day',        name: 'On a Roll',        icon: '🎰', desc: '5 sessions in a single day',               xp: 60 },
  { id: 'project_3',     name: 'Juggler',          icon: '🤹', desc: 'Work across 3 different projects',          xp: 35 },
]

export function checkAchievements({ session, allSessions, currentStreak, gamif }) {
  const earned = new Set(JSON.parse(gamif.achievementsEarned || '[]'))
  const unlocked = []

  const unlock = (id) => {
    if (earned.has(id)) return
    const ach = ACHIEVEMENTS.find(a => a.id === id)
    if (ach) { earned.add(id); unlocked.push(ach) }
  }

  if (allSessions.length === 1) unlock('first_session')

  if (session.completed) {
    if (session.plannedMinutes >= 50) unlock('marathon')

    const hour = new Date(session.createdAt).getHours()
    if (hour >= 22) unlock('night_owl')
    if (hour < 7)  unlock('early_bird')

    if (currentStreak >= 3)  unlock('streak_3')
    if (currentStreak >= 7)  unlock('streak_7')
    if (currentStreak >= 30) unlock('streak_30')

    const today = new Date().toISOString().split('T')[0]
    const todaySess = allSessions.filter(s => s.createdAt?.toString().startsWith(today))
    if (todaySess.length >= 5) unlock('x5_day')

    const todayMins = todaySess.reduce((a, s) => a + (s.earnedMinutes || 0), 0)
    if (todayMins >= 60)  unlock('hour_power')
    if (todayMins >= 100) unlock('century')

    const totalMins = allSessions.reduce((a, s) => a + (s.earnedMinutes || 0), 0)
    if (totalMins >= 300) unlock('time_investor')
    if (totalMins >= 600) unlock('deep_worker')

    const consecutiveCompletions = (gamif.consecutiveCompletions || 0) + 1
    if (consecutiveCompletions >= 10) unlock('iron_will')

    const projects = new Set(allSessions.map(s => s.projectId).filter(Boolean))
    if (projects.size >= 3) unlock('project_3')
  }

  return { unlocked, newEarnedJson: JSON.stringify([...earned]) }
}
