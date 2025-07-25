#!/bin/bash
# vscode-extension/publish.sh

# Build extension
npm run compile

# Package extension
vsce package

# Publish to marketplace
vsce publish

# Also publish to Open VSX
ovsx publish -p $OVSX_TOKEN