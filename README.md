# Tauri Demo

A minimal Tauri v2 demo with automatic release after merging to main branch and automatic in-app
update check.

## Install on macOS

1. Download the app from the [releases page](https://github.com/sitek94/tauri-demo/releases)
2. Open the app
3. If you get a warning saying that "the app is damaged":

   ```
   xattr -d com.apple.quarantine /Applications/tauri-demo.app
   ```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) +
  [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) +
  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
