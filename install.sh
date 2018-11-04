#!/bin/bash

# Build native bridge
cd ./native_bridge
cargo clean
cargo build --release
cd ..

# Copy manifest & bridge files to chrome extension
cp ./com.walfud.git_clone.json /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
cp ./native_bridge/target/release/native_bridge /Users/$(whoami)/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/NativeBridge