const {getVersion} = window.__TAURI__.app
const {check} = window.__TAURI_PLUGIN_UPDATER__
const {relaunch} = window.__TAURI_PLUGIN_PROCESS__

window.addEventListener('DOMContentLoaded', () => {
  updateAppTitle()
  checkForUpdates()
})

async function checkForUpdates() {
  const update = await check()
  if (update) {
    console.log(`Found update ${update.version}`)

    const alert = createUpdateAlert(update.version, () => updateApp(update))
    document.body.prepend(alert)
  }
}

async function updateApp(update) {
  let downloaded = 0
  let contentLength = 0
  const progressBar = document.querySelector('#update-progress')
  const updateButton = document.querySelector('#update-button')

  await update.downloadAndInstall(event => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength
        progressBar.parentElement.style.display = 'block'
        break
      case 'Progress':
        downloaded += event.data.chunkLength
        const progress = (downloaded / contentLength) * 100
        progressBar.style.width = `${progress}%`
        break
      case 'Finished':
        progressBar.parentElement.style.display = 'none'
        updateButton.textContent = 'Restart to Apply'
        updateButton.disabled = false
        updateButton.addEventListener('click', () => {
          relaunch()
        })
        break
    }
  })
}

function createUpdateAlert(version, onUpdateClick) {
  const alert = document.createElement('div')
  alert.classList.add('alert')

  const p = document.createElement('p')
  p.textContent = `New version available: ${version}`
  alert.appendChild(p)

  // Add progress bar container
  const progressContainer = document.createElement('div')
  progressContainer.className = 'progress-container'
  progressContainer.style.display = 'none'

  const progressBar = document.createElement('div')
  progressBar.id = 'update-progress'
  progressBar.className = 'progress-bar'
  progressContainer.appendChild(progressBar)
  alert.appendChild(progressContainer)

  const button = document.createElement('button')
  button.id = 'update-button'
  button.textContent = 'Update'
  button.addEventListener('click', () => {
    button.disabled = true
    button.textContent = 'Updating...'
    onUpdateClick()
  })
  alert.appendChild(button)

  return alert
}

async function updateAppTitle() {
  const version = await getVersion()
  const versionEl = document.querySelector('#version')
  versionEl.textContent = version
}

// Mock implementation
async function mockCheck() {
  return {
    version: '1.1.0',
    date: '2024-03-20',
    body: 'Mock update for testing',
    downloadAndInstall: callback => {
      // Simulate download progress
      let downloaded = 0
      const contentLength = 1024 * 1024 * 10 // 10MB

      callback({event: 'Started', data: {contentLength}})

      const interval = setInterval(() => {
        downloaded += 1024 * 1024 // 1MB chunks
        if (downloaded >= contentLength) {
          clearInterval(interval)
          callback({event: 'Finished'})
        } else {
          callback({event: 'Progress', data: {chunkLength: 1024 * 1024}})
        }
      }, 200)

      return Promise.resolve()
    },
  }
}
