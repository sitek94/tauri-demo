# Tauri Updater

In-app updates for Tauri applications. Automatically update your Tauri app with an update server or a static JSON.

## Setup

Install the Tauri updater plugin to get started.

<Tabs>
  <TabItem label="Automatic">

    Use your project's package manager to add the dependency:

    <CommandTabs
      npm="npm run tauri add updater"
      yarn="yarn run tauri add updater"
      pnpm="pnpm tauri add updater"
      deno="deno task tauri add updater"
      bun="bun tauri add updater"
      cargo="cargo tauri add updater"
    />

  </TabItem>
    <TabItem label="Manual">
      <Steps>

        1. Run the following command in the `src-tauri` folder to add the plugin to the project's dependencies in `Cargo.toml`:

            ```sh frame=none
            cargo add tauri-plugin-updater --target 'cfg(any(target_os = "macos", windows, target_os = "linux"))'
            ```

        2.  Modify `lib.rs` to initialize the plugin:

            ```rust title="lib.rs" ins={5-6}
            #[cfg_attr(mobile, tauri::mobile_entry_point)]
            pub fn run() {
                tauri::Builder::default()
                    .setup(|app| {
                        #[cfg(desktop)]
                        app.handle().plugin(tauri_plugin_updater::Builder::new().build());
                        Ok(())
                    })
                    .run(tauri::generate_context!())
                    .expect("error while running tauri application");
            }
            ```

        3.  You can install the JavaScript Guest bindings using your preferred JavaScript package manager:

            <CommandTabs
                npm="npm install @tauri-apps/plugin-updater"
                yarn="yarn add @tauri-apps/plugin-updater"
                pnpm="pnpm add @tauri-apps/plugin-updater"
                deno="deno add npm:@tauri-apps/plugin-updater"
                bun="bun add @tauri-apps/plugin-updater"
            />

      </Steps>
    </TabItem>

</Tabs>

## Signing updates

Tauri's updater needs a signature to verify that the update is from a trusted source. This cannot be disabled.

To sign your updates you need two keys:

1. The public key, which will be set in the `tauri.conf.json` to validate the artifacts before the installation. This
   public key can be uploaded and shared safely as long as your private key is secure.
2. The private key, which is used to sign your installer files. You should NEVER share this key with anyone. Also, if
   you lose this key you will NOT be able to publish new updates to the users that have the app already installed. It is
   important to store this key in a safe place!

To generate the keys the Tauri CLI provides the `signer generate` command. You can run this to create the keys in the
home folder:

<Tabs>
  <CommandTabs
    npm="npm run tauri signer generate -- -w ~/.tauri/myapp.key"
    yarn="yarn tauri signer generate -w ~/.tauri/myapp.key"
    pnpm="pnpm tauri signer generate -w ~/.tauri/myapp.key"
    deno="deno task tauri signer generate -w ~/.tauri/myapp.key"
    bun="bunx tauri signer generate -w ~/.tauri/myapp.key"
    cargo="cargo tauri signer generate -w ~/.tauri/myapp.key"
  />
</Tabs>

### Building

While building your update artifacts, you need to have the private key you generated above in your environment
variables. `.env` files do _not_ work!

<Tabs>
  <TabItem label="Mac/Linux">
  ```sh frame=none
  export TAURI_SIGNING_PRIVATE_KEY="Path or content of your private key"
  # optionally also add a password
  export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
  ```
  </TabItem>
  <TabItem label="Windows">
  Run this in `PowerShell`:
  ```ps frame=none
  $env:TAURI_SIGNING_PRIVATE_KEY="Path or content of your private key"
  <# optionally also add a password #>
  $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
  ```
  </TabItem>
</Tabs>

After that, you can run Tauri build as usual and Tauri will generate the update bundles and their signatures. The
generated files depend on the [`createUpdaterArtifacts`] configuration value configured below.

<Tabs>
  <TabItem label="v2">

```json
{
  "bundle": {
    "createUpdaterArtifacts": true
  }
}
```

On Linux, Tauri will create the normal AppImage inside the `target/release/bundle/appimage/` folder:

- `myapp.AppImage` - The standard app bundle. It will be re-used by the updater.
- `myapp.AppImage.sig` - The signature of the updater bundle.

On macOS, Tauri will create a .tar.gz archive from the application bundle inside the target/release/bundle/macos/
folder:

- `myapp.app` - The standard app bundle.
- `myapp.app.tar.gz` - The updater bundle.
- `myapp.app.tar.gz.sig` - The signature of the update bundle.

On Windows, Tauri will create the normal MSI and NSIS installers inside the target/release/bundle/msi/ and
target/release/bundle/nsis folders:

- `myapp-setup.exe` - The standard app bundle. It will be re-used by the updater.
- `myapp-setup.exe.sig` - The signature of the update bundle.
- `myapp.msi` - The standard app bundle. It will be re-used by the updater.
- `myapp.msi.sig` - The signature of the update bundle.

{''}

</TabItem>
<TabItem label="v1 compatible">

```json
{
  "bundle": {
    "createUpdaterArtifacts": "v1Compatible"
  }
}
```

On Linux, Tauri will create a .tar.gz archive from the AppImage inside the `target/release/bundle/appimage/` folder:

- `myapp.AppImage` - The standard app bundle.
- `myapp.AppImage.tar.gz` - The updater bundle.
- `myapp.AppImage.tar.gz.sig` - The signature of the update bundle.

On macOS, Tauri will create a .tar.gz archive from the application bundle inside the target/release/bundle/macos/
folder:

- `myapp.app` - The standard app bundle.
- `myapp.app.tar.gz` - The updater bundle.
- `myapp.app.tar.gz.sig` - The signature of the update bundle.

On Windows, Tauri will create .zip archives from the MSI and NSIS installers inside the target/release/bundle/msi/ and
target/release/bundle/nsis folders:

- `myapp-setup.exe` - The standard app bundle.
- `myapp-setup.nsis.zip` - The updater bundle.
- `myapp-setup.nsis.zip.sig` - The signature of the update bundle.
- `myapp.msi` - The standard app bundle.
- `myapp.msi.zip` - The updater bundle.
- `myapp.msi.zip.sig` - The signature of the update bundle.

{''}

  </TabItem>
</Tabs>

## Tauri Configuration

Set up the `tauri.conf.json` in this format for the updater to start working.

| Keys                                 | Description                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createUpdaterArtifacts`             | Setting this to `true` tells Tauri's app bundler to create updater artifacts. If you're migrating your app from an older Tauri version, set it to `"v1Compatible"` instead. **This setting will be removed in v3** so make sure to change it to `true` once all your users are migrated to v2. |
| `pubkey`                             | This has to be the public key generated from the Tauri CLI in the step above. It **cannot** be a file path!                                                                                                                                                                                    |
| `endpoints`                          | This must be an array of endpoint URLs as strings. TLS is enforced in production mode. Tauri will only continue to the next url if a non-2XX status code is returned!                                                                                                                          |
| `dangerousInsecureTransportProtocol` | Setting this to `true` allows the updater to accept non-HTTPS endpoints. Use this configuration with caution!                                                                                                                                                                                  |

Each updater URL can contain the following dynamic variables, allowing you to determine server-side if an update is
available.

- `{{current_version}}`: The version of the app that is requesting the update.
- `{{target}}`: The operating system name (one of `linux`, `windows` or `darwin`).
- `{{arch}}`: The architecture of the machine (one of `x86_64`, `i686`, `aarch64` or `armv7`).

```json title=tauri.conf.json
{
  "bundle": {
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "pubkey": "CONTENT FROM PUBLICKEY.PEM",
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}",
        // or a static github json file
        "https://github.com/user/repo/releases/latest/download/latest.json"
      ]
    }
  }
}
```

:::tip Custom variables are not supported, but you can define a [custom `{{target}}`](#custom-target). :::

### `installMode` on Windows

On Windows there is an additional optional `"installMode"` config to change how the update is installed.

```json title=tauri.conf.json
{
  "plugins": {
    "updater": {
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

- `"passive"`: There will be a small window with a progress bar. The update will be installed without requiring any user
  interaction. Generally recommended and the default mode.
- `"basicUi"`: There will be a basic user interface shown which requires user interaction to finish the installation.
- `"quiet"`: There will be no progress feedback to the user. With this mode the installer cannot request admin
  privileges by itself so it only works in user-wide installations or when your app itself already runs with admin
  privileges. Generally not recommended.

## Server Support

The updater plugin can be used in two ways. Either with a dynamic update server or a static JSON file (to use on
services like S3 or GitHub gists).

### Static JSON File

When using static, you just need to return a JSON containing the required information.

| Keys        | Description                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`   | Must be a valid [SemVer](https://semver.org/), with or without a leading `v`, meaning that both `1.0.0` and `v1.0.0` are valid.                                 |
| `notes`     | Notes about the update.                                                                                                                                         |
| `pub_date`  | The date must be formatted according to [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) if present.                                                   |
| `platforms` | Each platform key is in the `OS-ARCH` format, where `OS` is one of `linux`, `darwin` or `windows`, and `ARCH` is one of `x86_64`, `aarch64`, `i686` or `armv7`. |
| `signature` | The content of the generated `.sig` file, which may change with each build. A path or URL does not work!                                                        |

:::info When using [custom targets](#custom-target) the provided target string is matched against the `platforms` key
instead of the default `OS-ARCH` value. :::

The required keys are `"version"`, `"platforms.[target].url"` and `"platforms.[target].signature"`; the others are
optional.

```json
{
  "version": "",
  "notes": "",
  "pub_date": "",
  "platforms": {
    "linux-x86_64": {
      "signature": "",
      "url": ""
    },
    "windows-x86_64": {
      "signature": "",
      "url": ""
    },
    "darwin-x86_64": {
      "signature": "",
      "url": ""
    }
  }
}
```

Note that Tauri will validate the whole file before checking the version field, so make sure all existing platform
configurations are valid and complete.

:::tip [Tauri Action](https://github.com/tauri-apps/tauri-action) generates a static JSON file for you to use on CDNs
such as GitHub Releases. :::

### Dynamic Update Server

When using a dynamic update server, Tauri will follow the server's instructions. To disable the internal version check
you can overwrite the
[plugin's version comparison](https://docs.rs/tauri-plugin-updater/latest/tauri_plugin_updater/struct.UpdaterBuilder.html#method.version_comparator),
this will install the version sent by the server (useful if you need to roll back your app).

Your server can use variables defined in the `endpoint` URL above to determine if an update is required. If you need
more data, you can include additional
[request headers in Rust](https://docs.rs/tauri-plugin-updater/latest/tauri_plugin_updater/struct.UpdaterBuilder.html#method.header)
to your liking.

Your server should respond with a status code of
[`204 No Content`](https://datatracker.ietf.org/doc/html/rfc2616#section-10.2.5) if there is no update available.

If an update is required, your server should respond with a status code of
[`200 OK`](http://tools.ietf.org/html/rfc2616#section-10.2.1) and a JSON response in this format:

| Keys        | Description                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `version`   | This Must be a valid [SemVer](https://semver.org/), with or without a leading `v`, meaning that both `1.0.0` and `v1.0.0` are valid. |
| `notes`     | Notes about the update.                                                                                                              |
| `pub_date`  | The date must be formatted according to [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) if present.                        |
| `url`       | This Must be a valid URL to the update bundle.                                                                                       |
| `signature` | The content of the generated `.sig` file, which may change with each build. A path or URL does not work!                             |

The required keys are `"url"`, `"version"` and `"signature"`; the others are optional.

```json
{
  "version": "",
  "pub_date": "",
  "url": "",
  "signature": "",
  "notes": ""
}
```

:::tip CrabNebula, an official Tauri partner, offers a dynamic update server. For more information, see the
[Distributing with CrabNebula Cloud] documentation. :::

## Checking for Updates

The default API for checking updates and installing them leverages the configured endpoints and can be accessed by both
JavaScript and Rust code.

<Tabs syncKey="lang">
  <TabItem label="JavaScript">

```js
import {check} from '@tauri-apps/plugin-updater'
import {relaunch} from '@tauri-apps/plugin-process'

const update = await check()
if (update) {
  console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`)
  let downloaded = 0
  let contentLength = 0
  // alternatively we could also call update.download() and update.install() separately
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
```

For more information see the [JavaScript API documentation].

</TabItem>

<TabItem label="Rust">

```rust title="src-tauri/src/lib.rs"
use tauri_plugin_updater::UpdaterExt;

pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        update(handle).await.unwrap();
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .unwrap();
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
  if let Some(update) = app.updater()?.check().await? {
    let mut downloaded = 0;

    // alternatively we could also call update.download() and update.install() separately
    update
      .download_and_install(
        |chunk_length, content_length| {
          downloaded += chunk_length;
          println!("downloaded {downloaded} from {content_length:?}");
        },
        || {
          println!("download finished");
        },
      )
      .await?;

    println!("update installed");
    app.restart();
  }

  Ok(())
}
```

:::tip To notify the frontend of the download progress consider using a command with a [channel].

<details>
  <summary>Updater command</summary>

```rust
#[cfg(desktop)]
mod app_updates {
    use std::sync::Mutex;
    use serde::Serialize;
    use tauri::{ipc::Channel, AppHandle, State};
    use tauri_plugin_updater::{Update, UpdaterExt};

    #[derive(Debug, thiserror::Error)]
    pub enum Error {
        #[error(transparent)]
        Updater(#[from] tauri_plugin_updater::Error),
        #[error("there is no pending update")]
        NoPendingUpdate,
    }

    impl Serialize for Error {
        fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
        where
            S: serde::Serializer,
        {
            serializer.serialize_str(self.to_string().as_str())
        }
    }

    type Result<T> = std::result::Result<T, Error>;

    #[derive(Clone, Serialize)]
    #[serde(tag = "event", content = "data")]
    pub enum DownloadEvent {
        #[serde(rename_all = "camelCase")]
        Started {
            content_length: Option<u64>,
        },
        #[serde(rename_all = "camelCase")]
        Progress {
            chunk_length: usize,
        },
        Finished,
    }

    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct UpdateMetadata {
        version: String,
        current_version: String,
    }

    #[tauri::command]
    pub async fn fetch_update(
        app: AppHandle,
        pending_update: State<'_, PendingUpdate>,
    ) -> Result<Option<UpdateMetadata>> {
        let channel = "stable";
        let url = url::Url::parse(&format!(
            "https://cdn.myupdater.com/{{{{target}}}}-{{{{arch}}}}/{{{{current_version}}}}?channel={channel}",
        )).expect("invalid URL");

      let update = app
          .updater_builder()
          .endpoints(vec![url])?
          .build()?
          .check()
          .await?;

      let update_metadata = update.as_ref().map(|update| UpdateMetadata {
          version: update.version.clone(),
          current_version: update.current_version.clone(),
      });

      *pending_update.0.lock().unwrap() = update;

      Ok(update_metadata)
    }

    #[tauri::command]
    pub async fn install_update(pending_update: State<'_, PendingUpdate>, on_event: Channel<DownloadEvent>) -> Result<()> {
        let Some(update) = pending_update.0.lock().unwrap().take() else {
            return Err(Error::NoPendingUpdate);
        };

        let started = false;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    if !started {
                        let _ = on_event.send(DownloadEvent::Started { content_length });
                        started = true;
                    }

                    let _ = on_event.send(DownloadEvent::Progress { chunk_length });
                },
                || {
                    let _ = on_event.send(DownloadEvent::Finished);
                },
            )
            .await?;

        Ok(())
    }

    struct PendingUpdate(Mutex<Option<Update>>);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build());
                app.manage(app_updates::PendingUpdate(Mutex::new(None)));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            #[cfg(desktop)]
            app_updates::fetch_update,
            #[cfg(desktop)]
            app_updates::install_update
        ])
}
```

</details>
:::

For more information see the [Rust API documentation].

</TabItem>
</Tabs>

Note that restarting your app immediately after installing an update is not required and you can choose how to handle
the update by either waiting until the user manually restarts the app, or prompting him to select when to do so.

:::note On Windows the application is automatically exited when the install step is executed due to a limitation of
Windows installers. :::

When checking and downloading updates it is possible to define a custom request timeout, a proxy and request headers.

<Tabs syncKey="lang">
<TabItem label="JavaScript">

```js
import {check} from '@tauri-apps/plugin-updater'

const update = await check({
  proxy: '<proxy url>',
  timeout: 30000 /* milliseconds */,
  headers: {
    Authorization: 'Bearer <token>',
  },
})
```

  </TabItem>

  <TabItem label="Rust">

```rust
use tauri_plugin_updater::UpdaterExt;
let update = app
  .updater_builder()
  .timeout(std::time::Duration::from_secs(30))
  .proxy("<proxy-url>".parse().expect("invalid URL"))
  .header("Authorization", "Bearer <token>")
  .build()?
  .check()
  .await?;
```

  </TabItem>
</Tabs>

### Runtime Configuration

The updater APIs also allows the updater to be configured at runtime for more flexibility. For security reasons some
APIs are only available for Rust.

#### Endpoints

Setting the URLs that should be requested to check updates at runtime allows more dynamic updates such as separate
release channels:

```rust
use tauri_plugin_updater::UpdaterExt;
let channel = if beta { "beta" } else { "stable" };
let update_url = format!("https://{channel}.myserver.com/{{{{target}}}}-{{{{arch}}}}/{{{{current_version}}}}");

let update = app
  .updater_builder()
  .endpoints(vec![update_url])?
  .build()?
  .check()
  .await?;
```

:::tip Note that when using format!() to interpolate the update URL you need double escapes for the variables e.g.
`{{{{target}}}}`. :::

#### Public key

Setting the public key at runtime can be useful to implement a key rotation logic. It can be set by either the plugin
builder or updater builder:

```rust
tauri_plugin_updater::Builder::new().pubkey("<your public key>").build()
```

```rust
use tauri_plugin_updater::UpdaterExt;

let update = app
  .updater_builder()
  .pubkey("<your public key>")
  .build()?
  .check()
  .await?;
```

#### Custom target

By default the updater lets you use the `{{target}}` and `{{arch}}` variables to determine which update asset must be
delivered. If you need more information on your updates (e.g. when distributing a Universal macOS binary option or
having more build flavors) you can set a custom target.

<Tabs syncKey="lang">
<TabItem label="JavaScript">

```js
import {check} from '@tauri-apps/plugin-updater'

const update = await check({
  target: 'macos-universal',
})
```

  </TabItem>

  <TabItem label="Rust">

Custom targets can be set by either the plugin builder or updater builder:

```rust
tauri_plugin_updater::Builder::new().target("macos-universal").build()
```

```rust
use tauri_plugin_updater::UpdaterExt;
let update = app
  .updater_builder()
  .target("macos-universal")
  .build()?
  .check()
  .await?;
```

:::tip The default `$target-$arch` key can be retrieved using `tauri_plugin_updater::target()` which returns an
`Option<String>` that is `None` when the updater is not supported on the current platform. :::

  </TabItem>
</Tabs>

:::note

- When using a custom target it might be easier to use it exclusively to determine the update platform, so you could
  remove the `{{arch}}` variable.
- The value provided as target is the key that is matched against the platform key when using a
  [Static JSON file](#static-json-file).

:::

#### Allowing downgrades

By default Tauri checks if the update version is greater than the current app version to verify if it should update or
not. To allow downgrades, you must use the updater builder's `version_comparator` API:

```rust
use tauri_plugin_updater::UpdaterExt;

let update = app
  .updater_builder()
  .version_comparator(|current, update| {
    // default comparison: `update.version > current`
    update.version != current
  })
  .build()?
  .check()
  .await?;
```

#### Windows before exit hook

Due to a limitation of Windows installers, Tauri will automatically quit your application before installing updates on
Windows. To perform an action before that happens, use the `on_before_exit` function:

```rust
use tauri_plugin_updater::UpdaterExt;

let update = app
  .updater_builder()
  .on_before_exit(|| {
    println!("app is about to exit on Windows!");
  })
  .build()?
  .check()
  .await?;
```

:::note The values from the [configuration](#tauri-configuration) are used as fallback if any of the builder values are
not set. :::

[`createUpdaterArtifacts`]: /reference/config/#createupdaterartifacts
[Distributing with CrabNebula Cloud]: /distribute/crabnebula-cloud/
[channel]: /develop/calling-frontend/#channels
[JavaScript API Documentation]: /reference/javascript/updater/
[Rust API Documentation]: https://docs.rs/tauri-plugin-updater

## Permissions

By default all potentially dangerous plugin commands and scopes are blocked and cannot be accessed. You must modify the
permissions in your `capabilities` configuration to enable these.

See the [Capabilities Overview](/security/capabilities/) for more information and the
[step by step guide](/learn/security/using-plugin-permissions/) to use plugin permissions.

```json title="src-tauri/capabilities/default.json" ins={4}
{
  "permissions": [
    ...,
    "updater:default",
  ]
}
```

<PluginPermissions plugin={frontmatter.plugin} />
