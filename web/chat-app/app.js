(function(){
  const $ = (sel, el=document) => el.querySelector(sel)
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel))

  const state = {
    theme: localStorage.getItem('theme') || 'light',
    contacts: [],
    activeId: null,
    timers: new Map(),
    notificationsEnabled: false,
  }

  const names = ['Alex', 'Brenda', 'Chris', 'Dana', 'Evan', 'Fiona', 'Gabe', 'Harper', 'Ivan', 'Jules']
  const sampleTexts = [
    'Hey! How are you?', 'On my way 🚗', 'Let\'s meet at 3pm', 'Looks great!', 'Did you see this?',
    'Awesome idea', 'I\'ll send it over', 'Working on it now', 'Thanks!', 'Talk soon'
  ]

  function initContacts() {
    state.contacts = names.map((name, i) => ({
      id: `c${i+1}`,
      name,
      avatarHue: Math.floor(Math.random()*360),
      online: Math.random() > 0.3,
      messages: [
        { id: crypto.randomUUID(), from: 'them', text: `Hi, I'm ${name}!`, ts: Date.now()-1000*60*60*(i+1) },
      ],
      unread: 0,
    }))
  }

  function setTheme(theme) {
    state.theme = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  function toggleTheme() { setTheme(state.theme === 'light' ? 'dark' : 'light') }

  function renderContacts(filter='') {
    const ul = $('#contactList')
    ul.innerHTML = ''
    state.contacts
      .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach(c => {
        const li = document.createElement('li')
        li.className = 'contact'
        li.setAttribute('role', 'option')
        li.dataset.id = c.id
        li.innerHTML = `
          <div class="avatar" style="background:hsl(${c.avatarHue} 70% 45%)"></div>
          <div>
            <div class="contact__name">${c.name}</div>
            <div class="contact__preview">${c.messages[c.messages.length-1]?.text || ''}</div>
          </div>
          <div>
            ${c.unread>0 ? `<span class="badge" aria-label="${c.unread} unread messages">${c.unread}</span>` : ''}
          </div>
        `
        li.addEventListener('click', () => selectContact(c.id))
        ul.appendChild(li)
      })
  }

  function renderActive() {
    const contact = state.contacts.find(c => c.id === state.activeId)
    const headerName = $('#activeName')
    const status = $('#activeStatus')
    const avatar = $('#activeAvatar')
    const input = $('#messageInput')
    const button = $('#messageForm button')

    if (!contact) {
      headerName.textContent = 'Select a contact'
      status.textContent = '—'
      avatar.style.background = 'var(--accent)'
      input.disabled = true
      button.disabled = true
      $('#messageList').innerHTML = ''
      return
    }

    headerName.textContent = contact.name
    status.textContent = contact.online ? 'Online' : 'Offline'
    avatar.style.background = `hsl(${contact.avatarHue} 70% 45%)`
    input.disabled = false
    button.disabled = false

    const list = $('#messageList')
    list.innerHTML = ''
    contact.messages.forEach(m => {
      const row = document.createElement('div')
      row.className = `msg ${m.from==='me' ? 'msg--me' : ''}`
      row.innerHTML = `
        <div class="avatar" style="background:hsl(${contact.avatarHue} 70% 45%)"></div>
        <div>
          <div class="msg__bubble">${escapeHTML(m.text)}</div>
          <div class="msg__meta">${new Date(m.ts).toLocaleTimeString()}</div>
        </div>
      `
      if (m.from==='me') {
        row.children[0].remove() // align right: remove avatar on left
        const avatarRight = document.createElement('div')
        avatarRight.className = 'avatar'
        avatarRight.style.background = 'linear-gradient(135deg, var(--primary), #9333ea)'
        row.appendChild(avatarRight)
      }
      list.appendChild(row)
    })
    list.scrollTop = list.scrollHeight
  }

  function selectContact(id) {
    state.activeId = id
    const c = state.contacts.find(c => c.id === id)
    if (!c) return
    c.unread = 0
    renderContacts($('#search').value)
    renderActive()
  }

  function sendMessage(text) {
    text = text.trim()
    if (!text) return
    const c = state.contacts.find(c => c.id === state.activeId)
    if (!c) return
    c.messages.push({ id: crypto.randomUUID(), from:'me', text, ts: Date.now() })
    renderActive()
    // Simulate a reply after short delay
    setTimeout(()=> simulateIncoming(c.id), 600 + Math.random()*1200)
  }

  function simulateIncoming(contactId) {
    const c = state.contacts.find(x => x.id === contactId)
    if (!c) return
    const text = sampleTexts[Math.floor(Math.random()*sampleTexts.length)]
    c.messages.push({ id: crypto.randomUUID(), from:'them', text, ts: Date.now() })

    if (state.activeId !== c.id) {
      c.unread++
      showToast(`New message from ${c.name}: ${text}`)
      maybeNotify(`${c.name}`, { body: text })
    }
    renderContacts($('#search').value)
    if (state.activeId === c.id) renderActive()
  }

  function startRandomTraffic() {
    stopRandomTraffic()
    state.contacts.forEach(c => {
      const t = setInterval(() => simulateIncoming(c.id), 6000 + Math.random()*6000)
      state.timers.set(c.id, t)
    })
  }

  function stopRandomTraffic() {
    state.timers.forEach(t => clearInterval(t))
    state.timers.clear()
  }

  function showToast(text, type='info') {
    const cont = $('#toastContainer')
    const div = document.createElement('div')
    div.className = `toast ${type==='danger'?'toast--danger':''}`
    div.textContent = text
    cont.appendChild(div)
    setTimeout(()=> div.remove(), 4000)
  }

  function maybeNotify(title, options) {
    if (!state.notificationsEnabled) return
    if (!('Notification' in window)) return
    try {
      new Notification(title, options)
    } catch {}
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]))
  }

  // Event wiring
  $('#themeToggle').addEventListener('click', toggleTheme)
  $('#search').addEventListener('input', (e)=> renderContacts(e.target.value))
  $('#messageForm').addEventListener('submit', (e)=>{ e.preventDefault(); sendMessage($('#messageInput').value); $('#messageInput').value=''; })
  $('#enableNotifs').addEventListener('click', async ()=>{
    if (!('Notification' in window)) { showToast('Notifications not supported in this browser', 'danger'); return }
    const perm = await Notification.requestPermission()
    state.notificationsEnabled = perm === 'granted'
    showToast(state.notificationsEnabled ? 'Notifications enabled' : 'Notifications blocked')
  })

  // Boot
  initContacts()
  setTheme(state.theme)
  renderContacts()
  renderActive()
  startRandomTraffic()

  // Select first contact by default
  if (state.contacts[0]) selectContact(state.contacts[0].id)
})()
