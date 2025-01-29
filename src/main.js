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
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`,
    )

    const alert = createUpdateAlert(update.version, updateApp)
    document.body.prepend(alert)
  }
}

async function updateApp() {
  let downloaded = 0
  let contentLength = 0

  await update.downloadAndInstall(event => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength
        console.log(`started downloading ${event.data.contentLength} bytes`)
        break
      case 'Progress':
        downloaded += event.data.chunkLength
        console.log(`downloaded ${downloaded} from ${contentLength}`)
        break
      case 'Finished':
        console.log('download finished')
        break
    }
  })

  console.log('update installed')
  await relaunch()
}

function createUpdateAlert(version, onUpdateClick) {
  const alert = document.createElement('div')
  alert.classList.add('alert')

  const p = document.createElement('p')
  p.textContent = `New version available: ${version}`
  alert.appendChild(p)

  const button = document.createElement('button')
  button.textContent = 'Update'
  button.addEventListener('click', onUpdateClick)
  alert.appendChild(button)

  return alert
}

async function updateAppTitle() {
  const version = await getVersion()
  const versionEl = document.querySelector('#version')
  versionEl.textContent = version
}
