chrome.storage.local.get(['sessionActive','sessionTask','balance','vscodeSrc'], (data) => {
  document.getElementById('subtitle').textContent =
    data.sessionActive ? `Working: "${data.sessionTask}"` : 'No active session'

  const dot = document.getElementById('session-dot')
  dot.className = 'dot ' + (data.sessionActive ? 'on' : 'off')

  document.getElementById('session-val').textContent =
    data.sessionActive ? 'Active' : 'Idle'

  document.getElementById('bank-val').textContent =
    `${data.balance || 0} min`

  const vs = data.vscodeSrc
  document.getElementById('vscode-val').textContent =
    (vs && !vs.stale && vs.status === 'active')
      ? (vs.file || 'Active')
      : 'Not detected'
})
