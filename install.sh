#!/bin/sh

# Webpack chrome extension JS
cd ./chrome-extension && npm run clean && npm run build && cd -

# Build native bridge
cd ./native_bridge && cargo clean && cargo build --release && cd -

# Copy manifest & bridge files to chrome extension
cd ./native_bridge && cp ./com.walfud.git_clone.json /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/ && cd -
cd ./native_bridge && cp ./target/release/native_bridge /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/NativeBridge && cd -
