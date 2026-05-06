'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderKanban, Plus, X, CheckCircle, Circle, 
  Trash2, Edit2, MoreHorizontal, Star, Clock,
  TrendingUp, Award, Calendar, Filter, Search
} from 'lucide-react'

const EMOJIS = ['💼','📚','🎨','💻','🎯','🏃','🎵','🌱','🔬','🏗️','✍️','📊','🚀','🎮','🎬']
const COLORS  = ['#00E5FF','#00FF88','#a29bfe','#fd79a8','#fdcb6e','#e17055','#45b7d1','#2ecc71']
function timeStr(mins) {
  if (!mins) return '0m'
  return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins}m`
}

export default function ProjectsPage() {
  const [projects, setProjects]   = useState([])
  const [tasks, setTasks]         = useState([])
  const [selected, setSelected]   = useState(null)
  const [showNew, setShowNew]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newEmoji, setNewEmoji]   = useState('💼')
  const [newColor, setNewColor]   = useState('#1D5D3D')
  const [newTaskTitle, setNewTask] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    const res = await fetch('/api/projects')
    const d   = await res.json()
    setProjects(d.projects ?? [])
  }

  async function loadTasks(projectId) {
    const res = await fetch(`/api/tasks?projectId=${projectId}`)
    const d   = await res.json()
    setTasks(d.tasks ?? [])
  }

  async function selectProject(p) {
    setSelected(p)
    await loadTasks(p.id)
  }

  async function createProject() {
    if (!newName.trim()) return
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), emoji: newEmoji, color: newColor }),
    })
    setShowNew(false); setNewName('')
    await loadProjects()
  }

  async function deleteProject(id) {
    if (!confirm('Delete project and all its tasks?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (selected?.id === id) setSelected(null)
    await loadProjects()
  }

  async function addTask() {
    if (!newTaskTitle.trim() || !selected) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle.trim(), projectId: selected.id }),
    })
    setNewTask(''); setAddingTask(false)
    await loadTasks(selected.id)
    await loadProjects()
  }

  async function toggleTask(id) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle: true }),
    })
    if (selected) await loadTasks(selected.id)
  }

  async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (selected) await loadTasks(selected.id)
    await loadProjects()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2E26]">Projects</h1>
            <p className="text-[#6B7A74] mt-1">Organize your work and track progress</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D5D3D] text-white rounded-xl font-semibold hover:bg-[#154d31] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8EDEB]">
            <div className="w-20 h-20 bg-[#E8F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-10 h-10 text-[#1D5D3D]" />
            </div>
            <p className="text-[#1A2E26] font-medium mb-2">No projects yet</p>
            <p className="text-[#6B7A74] text-sm">Create your first project to organize your work</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-6 px-6 py-2 bg-[#1D5D3D] text-white rounded-lg font-medium hover:bg-[#154d31] transition-all"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {projects.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => selectProject(p)}
                className={`group bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg border-2 ${
                  selected?.id === p.id 
                    ? 'border-[#1D5D3D] shadow-md' 
                    : 'border-[#E8EDEB] hover:border-[#C4DDD2]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${p.color}15` }}
                  >
                    {p.emoji}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                
                <h3 className="text-[#1A2E26] font-bold text-lg mb-1">{p.name}</h3>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6B7A74]" />
                    <span className="text-xs text-[#6B7A74]">{timeStr(p.totalMinutes)}</span>
                  </div>
                  <div className="w-px h-3 bg-[#E8EDEB]" />
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#6B7A74]" />
                    <span className="text-xs text-[#6B7A74]">{p.doneCount}/{p.taskCount} done</span>
                  </div>
                </div>

                {p.taskCount > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-[#E8EDEB] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(p.doneCount / p.taskCount) * 100}%`,
                          backgroundColor: p.color 
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Tasks Panel - Sidebar Style when project selected */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl border border-[#E8EDEB] shadow-sm overflow-hidden"
            >
              {/* Task Header */}
              <div className="bg-gradient-to-r from-[#E8F5F0] to-white px-6 py-4 border-b border-[#E8EDEB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selected.emoji}</span>
                    <div>
                      <h2 className="text-xl font-bold text-[#1A2E26]">{selected.name}</h2>
                      <p className="text-xs text-[#6B7A74]">{tasks.filter(t => !t.done).length} remaining · {tasks.length} total</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-[#F5F7F6] rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-[#6B7A74]" />
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="p-6">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F5F7F6] rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-[#C4DDD2]" />
                    </div>
                    <p className="text-[#6B7A74] text-sm">No tasks yet</p>
                    <p className="text-[#94A6A0] text-xs mt-1">Add your first task to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t, idx) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                          t.done ? 'bg-[#F5F7F6]' : 'hover:bg-[#F5F7F6]'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(t.id)}
                          className="flex-shrink-0"
                        >
                          {t.done ? (
                            <CheckCircle className="w-5 h-5 text-[#1D5D3D]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#C4DDD2] hover:text-[#1D5D3D] transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${t.done ? 'line-through text-[#94A6A0]' : 'text-[#1A2E26]'}`}>
                            {t.title}
                          </p>
                          {(t.sessions > 0) && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-[#94A6A0]" />
                              <span className="text-xs text-[#94A6A0]">{t.sessions} sessions · {t.minutesSpent} min</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add Task Input */}
                {addingTask ? (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#E8EDEB]">
                    <input
                      autoFocus
                      value={newTaskTitle}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => { 
                        if (e.key === 'Enter') addTask(); 
                        if (e.key === 'Escape') { setAddingTask(false); setNewTask('') }
                      }}
                      placeholder="Task title..."
                      className="flex-1 bg-[#F5F7F6] border border-[#E8EDEB] rounded-xl px-4 py-2.5 text-[#1A2E26] text-sm focus:outline-none focus:border-[#1D5D3D] focus:ring-2 focus:ring-[#1D5D3D]/20"
                    />
                    <button 
                      onClick={addTask} 
                      className="px-5 py-2.5 bg-[#1D5D3D] text-white rounded-xl font-medium text-sm hover:bg-[#154d31] transition-all"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => { setAddingTask(false); setNewTask('') }} 
                      className="px-4 py-2.5 text-[#6B7A74] hover:bg-[#F5F7F6] rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTask(true)}
                    className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-[#E8EDEB] text-[#6B7A74] text-sm font-medium hover:border-[#1D5D3D] hover:text-[#1D5D3D] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Project Modal - Desktop Centered */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowNew(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E8EDEB]"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-[#1A2E26]">Create New Project</h3>
                  <button onClick={() => setShowNew(false)} className="p-1 hover:bg-[#F5F7F6] rounded-lg">
                    <X className="w-5 h-5 text-[#6B7A74]" />
                  </button>
                </div>

                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Project name"
                  className="w-full bg-[#F5F7F6] border border-[#E8EDEB] rounded-xl px-4 py-3 text-[#1A2E26] placeholder-[#94A6A0] focus:outline-none focus:border-[#1D5D3D] focus:ring-2 focus:ring-[#1D5D3D]/20 mb-5"
                />

                <p className="text-[#6B7A74] text-sm font-medium mb-2">Choose Emoji</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`text-xl p-2 rounded-xl transition-all ${
                        newEmoji === e 
                          ? 'bg-[#E8F5F0] ring-2 ring-[#1D5D3D]' 
                          : 'bg-[#F5F7F6] hover:bg-[#E8EDEB]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <p className="text-[#6B7A74] text-sm font-medium mb-2">Choose Color</p>
                <div className="flex gap-2 mb-6">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newColor === c ? 'ring-2 ring-[#1A2E26] ring-offset-2 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createProject}
                    className="flex-1 py-3 bg-[#1D5D3D] text-white rounded-xl font-semibold hover:bg-[#154d31] transition-all"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setShowNew(false)}
                    className="flex-1 py-3 border border-[#E8EDEB] text-[#6B7A74] rounded-xl font-semibold hover:bg-[#F5F7F6] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}