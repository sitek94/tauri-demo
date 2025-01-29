const {invoke} = window.__TAURI__.core
const {check} = window.__TAURI_PLUGIN_UPDATER__
const {relaunch} = window.__TAURI_PLUGIN_PROCESS__

let greetInputEl
let greetMsgEl

async function greet() {
  greetMsgEl.textContent = await core.invoke('greet', {
    name: greetInputEl.value,
  })
}

window.addEventListener('DOMContentLoaded', () => {
  greetInputEl = document.querySelector('#greet-input')
  greetMsgEl = document.querySelector('#greet-msg')
  document.querySelector('#greet-form').addEventListener('submit', e => {
    e.preventDefault()
    greet()
  })

  checkForUpdates()
})

async function checkForUpdates() {
  const update = await check()
  if (update) {
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`,
    )
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
}
