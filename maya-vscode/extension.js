/**
 * Maya VS Code Extension
 * Reports your coding activity to the Earn Your Scroll web app
 * so Maya knows you're working even when you're not in the browser.
 */

const vscode = require('vscode')
const https  = require('https')
const http   = require('http')

const EYS = 'http://localhost:3005'

let statusBarItem
let heartbeatTimer
let idleTimer
let lastActivity = Date.now()

function post(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body)
    const url  = new URL(path, EYS)
    const lib  = url.protocol === 'https:' ? https : http
    const req  = lib.request({
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let body = ''
      res.on('data', d => { body += d })
      res.on('end', () => resolve(JSON.parse(body)))
    })
    req.on('error', () => resolve(null))
    req.write(data)
    req.end()
  })
}

function getCurrentFile() {
  const editor = vscode.window.activeTextEditor
  if (!editor) return { file: null, language: null }
  const fileName = editor.document.fileName.split(/[\\/]/).pop()
  return { file: fileName, language: editor.document.languageId }
}

function reportStatus(status) {
  const { file, language } = getCurrentFile()
  post('/api/maya/context', { source: 'vscode', status, file, language })

  // Update status bar
  if (statusBarItem) {
    statusBarItem.text = status === 'active' || status === 'typing'
      ? '$(robot) Maya watching'
      : '$(robot) Maya idle'
    statusBarItem.tooltip = file ? `Maya sees: ${file}` : 'Maya is watching'
  }
}

function resetIdleTimer() {
  lastActivity = Date.now()
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => reportStatus('idle'), 3 * 60 * 1000) // idle after 3min
  reportStatus('active')
}

function activate(context) {
  // Status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.command = 'maya.status'
  statusBarItem.text = '$(robot) Maya'
  statusBarItem.tooltip = 'Maya is watching your coding'
  statusBarItem.show()

  // Report when VS Code window gains focus
  vscode.window.onDidChangeWindowState(state => {
    if (state.focused) resetIdleTimer()
    else reportStatus('idle')
  }, null, context.subscriptions)

  // Report when switching files
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) resetIdleTimer()
  }, null, context.subscriptions)

  // Report on every keystroke
  vscode.workspace.onDidChangeTextDocument(() => {
    lastActivity = Date.now()
    reportStatus('typing')
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => reportStatus('idle'), 3 * 60 * 1000)
  }, null, context.subscriptions)

  // Heartbeat every 20 seconds (so Maya knows you're still coding)
  heartbeatTimer = setInterval(() => {
    const idleMs = Date.now() - lastActivity
    if (idleMs < 3 * 60 * 1000) reportStatus('active')
  }, 20_000)

  // Show status command
  vscode.commands.registerCommand('maya.status', () => {
    const { file } = getCurrentFile()
    vscode.window.showInformationMessage(
      `Maya knows you're in VS Code${file ? ` → ${file}` : ''}`
    )
  })

  // Initial report
  reportStatus('active')

  context.subscriptions.push(statusBarItem, { dispose: () => {
    clearInterval(heartbeatTimer)
    if (idleTimer) clearTimeout(idleTimer)
    reportStatus('idle')
  }})
}

function deactivate() {
  clearInterval(heartbeatTimer)
  post('/api/maya/context', { source: 'vscode', status: 'idle', file: null, language: null })
}

module.exports = { activate, deactivate }
