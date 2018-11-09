#!/usr/bin/env node

const fs = require('fs')
const { spawnSync } = require('child_process')

// Webpack chrome extension JS
spawnSync('sh', ['-c', 'npm run clean && npm run build'], {
    cwd: './chrome-extension',
})

// Build native bridge
spawnSync('sh', ['-c', 'cargo clean && cargo build --release'], {
    cwd: './native_bridge',
})

// # Copy manifest & bridge files to chrome extension
// cp ./com.walfud.git_clone.json /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
// cp ./native_bridge/target/release/native_bridge /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/NativeBridge