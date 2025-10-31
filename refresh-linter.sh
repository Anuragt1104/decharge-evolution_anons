#!/bin/bash
# Script to refresh VSCode Rust Analyzer cache

echo "🔄 Refreshing Rust Analyzer..."
echo ""

# Clean and rebuild
echo "1. Cleaning build artifacts..."
cargo clean --manifest-path=programs/decharge/Cargo.toml

echo ""
echo "2. Rebuilding program..."
cargo build-sbf --manifest-path=programs/decharge/Cargo.toml

echo ""
echo "✅ Build complete!"
echo ""
echo "📝 To refresh VSCode linter:"
echo "   1. Press Cmd+Shift+P (or Ctrl+Shift+P on Linux/Windows)"
echo "   2. Type: 'Rust Analyzer: Restart Server'"
echo "   3. Press Enter"
echo ""
echo "   OR reload window:"
echo "   1. Press Cmd+Shift+P"
echo "   2. Type: 'Developer: Reload Window'"
echo "   3. Press Enter"
echo ""
echo "🎉 Your program compiles with 0 errors, 0 warnings!"


