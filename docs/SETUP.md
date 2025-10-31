# Setup and Installation Guide

This guide walks you through setting up and running DeCharge Evolution on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| Node.js | v18.0.0 or higher | JavaScript runtime |
| pnpm | v9.0.0 or higher | Package manager |
| Rust | Latest stable | Compile Solana programs |
| Solana CLI | v1.18.0 or higher | Deploy and test programs |
| Anchor | v0.29.0 or higher | Solana development framework |

### Installation Instructions

**Node.js and pnpm:**

```bash
# Install Node.js from nodejs.org or using nvm
nvm install 18
nvm use 18

# Install pnpm globally
npm install -g pnpm@9
```

**Rust:**

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add to PATH (if not already done)
source $HOME/.cargo/env
```

**Solana CLI:**

```bash
# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH (usually automatic, but verify)
export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
```

**Anchor Framework:**

```bash
# Install Anchor using avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installation
anchor --version
```

### Optional Tools

- **VS Code** with Rust Analyzer extension for better IDE support
- **Phantom Wallet** browser extension for testing Solana Pay
- **Docker** if you prefer containerized development

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repo (replace with actual URL)
git clone https://github.com/your-username/decharge-evolution.git
cd decharge-evolution
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This will install:
# - Root workspace dependencies
# - All packages/* dependencies
# - Web app dependencies
# - Service dependencies
# - Simulator dependencies
```

Expected output:

```
Packages: +2847
Progress: resolved 2847, reused 2847, downloaded 0, added 2847, done
```

### 3. Build Solana Programs

```bash
# Configure Solana for local development
solana config set --url localhost

# Generate a new keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Build the Anchor program
anchor build

# This generates:
# - target/deploy/decharge.so (compiled program)
# - target/idl/decharge.json (interface definition)
```

Expected output:

```
Building decharge...
Build successful. Deployable program saved at: target/deploy/decharge.so
```

### 4. Build TypeScript Packages

```bash
# Build all shared packages
pnpm build

# This builds:
# - packages/sdk
# - packages/types
# - packages/ui
# - packages/utils
```

Expected output:

```
@decharge/types:build: Build successful
@decharge/sdk:build: Build successful
@decharge/ui:build: Build successful
@decharge/utils:build: Build successful
```

### 5. Configure Environment Variables

Create a `.env` file in the project root (optional, defaults work for local development):

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` with your preferences:

```bash
# Gateway service
PORT=8787
HOST=0.0.0.0
LOG_LEVEL=info

# Simulator
GATEWAY_URL=http://localhost:8787

# Web app (create apps/web-app/.env.local)
NEXT_PUBLIC_GATEWAY_WS=ws://localhost:8787/stream
NEXT_PUBLIC_GATEWAY_HTTP=http://localhost:8787
NEXT_PUBLIC_RPC_URL=http://localhost:8899
NEXT_PUBLIC_PROGRAM_ID=DeChrg11111111111111111111111111111111111111
```

## Running the Application

The application consists of three services that should run simultaneously. Open three terminal windows.

### Terminal 1: Gateway Service

The gateway service handles real-time event streaming and data aggregation.

```bash
# Navigate to gateway directory
cd services/gateway

# Start in development mode
pnpm dev
```

Expected output:

```
[info] Gateway running on http://0.0.0.0:8787
```

The gateway will:
- Listen for incoming events on POST /ingest
- Broadcast events via WebSocket at /stream
- Serve REST APIs at /api/*
- Maintain in-memory state

### Terminal 2: Charging Simulator

The simulator generates realistic charging session data for demonstration.

```bash
# Navigate to simulator directory
cd simulator

# Start the simulator
pnpm dev
```

Expected output:

```
🔌 DeCharge simulator booting up
Gateway endpoint: http://localhost:8787/ingest
[sim] Station stat-alpha initialized
[sim] Station stat-bravo initialized
[sim] Station stat-charlie initialized
[sim] Station stat-delta initialized
[sim] Station stat-echo initialized
✅ Simulator is streaming telemetry. Leave this process running.
[sim] Session a3f2c1... started at stat-bravo (2.3 kWh, 180 pts)
```

The simulator will:
- Initialize 5 charging stations
- Generate new sessions every 14 seconds
- Update active sessions every 6 seconds
- Simulate marketplace purchases every 22 seconds
- Simulate virtual plot claims every 28 seconds
- Simulate virtual charging sessions every 12 seconds

### Terminal 3: Web Application

The Next.js dashboard provides the user interface.

```bash
# Navigate to web app directory
cd apps/web-app

# Start in development mode
pnpm dev
```

Expected output:

```
  ▲ Next.js 14.2.10
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.3s
```

The web app will:
- Connect to gateway via WebSocket
- Display live charging sessions
- Render 3D virtual world
- Show marketplace and activity feed
- Hot-reload on code changes

### Access the Dashboard

Open your browser and navigate to:

```
http://localhost:3000
```

You should see:
- Three metric cards at the top (Energy, Utilization, Points)
- Live session table with active charging sessions
- Activity feed on the right side
- Marketplace grid with point packages
- 3D virtual world at the bottom

The data will update in real-time as the simulator generates events.

## Testing the Application

### Manual Testing

**Watch Live Sessions:**
1. Observe the live session table
2. Sessions should appear every 14 seconds
3. Energy and points should increase with each update
4. Sessions should complete after a few updates

**Explore Virtual World:**
1. Scroll down to the 3D scene
2. Click and drag to rotate the camera
3. Scroll to zoom in/out
4. Click on plots to see details (when claimed)
5. Watch for new plot claims (every 28 seconds)

**Check Activity Feed:**
1. Look at the activity feed on the right
2. Events should appear as they happen
3. Feed should show session starts, completions, purchases, claims

**Browse Marketplace:**
1. View the marketplace grid
2. Each item shows points cost and discount
3. Inventory should decrease when purchases occur (simulated)

### Automated Tests

**Run Anchor Tests:**

```bash
# Start local validator (in a new terminal)
solana-test-validator

# In another terminal, run tests
anchor test --skip-local-validator
```

This tests the Solana program instructions.

**Run TypeScript Tests:**

```bash
# Run all package tests
pnpm test
```

This tests utility functions and type definitions.

### Health Checks

**Gateway Health:**

```bash
curl http://localhost:8787/api/health
# Expected: {"status":"ok","time":1699123456789}
```

**Dashboard API:**

```bash
curl http://localhost:8787/api/dashboard
# Expected: JSON with network stats
```

**Stations List:**

```bash
curl http://localhost:8787/api/stations
# Expected: Array of 5 stations
```

## Deployment

### Local Network Deployment

To deploy the Solana program to your local validator:

```bash
# Start local validator (if not running)
solana-test-validator --reset

# Deploy the program
anchor deploy

# Note the program ID from the output
# Update Anchor.toml and .env files with new ID if needed
```

### Production Deployment

**Solana Program to Devnet:**

```bash
# Configure for devnet
solana config set --url devnet

# Airdrop SOL for deployment (if needed)
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Update frontend environment variables
# NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
# NEXT_PUBLIC_PROGRAM_ID=<deployed_program_id>
```

**Gateway Service:**

Deploy to any Node.js hosting platform:

```bash
# Example: Deploy to Render, Railway, or Fly.io
cd services/gateway
pnpm build

# Set environment variables on hosting platform
# PORT=8787
# LOG_LEVEL=info

# Start command: node dist/index.js
```

**Web Application:**

Deploy to Vercel (recommended for Next.js):

```bash
cd apps/web-app

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link project
# Set environment variables in Vercel dashboard
```

**Simulator (Optional for Demo):**

Run on a server to provide continuous demo data:

```bash
cd simulator
pnpm build

# Run with PM2 or similar process manager
pm2 start dist/index.js --name decharge-simulator
```

## Troubleshooting

### Common Issues

**Issue: `anchor: command not found`**

Solution:
```bash
# Make sure avm is installed
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Add to PATH if needed
export PATH="$HOME/.cargo/bin:$PATH"
```

**Issue: `Error: unable to confirm transaction`**

Solution:
```bash
# Check if local validator is running
ps aux | grep solana-test-validator

# If not, start it
solana-test-validator

# Check Solana config
solana config get
# Should show URL: http://localhost:8899
```

**Issue: `WebSocket connection failed`**

Solution:
```bash
# Make sure gateway is running
curl http://localhost:8787/api/health

# Check browser console for error details
# Verify NEXT_PUBLIC_GATEWAY_WS is set correctly
# Should be: ws://localhost:8787/stream
```

**Issue: `pnpm install fails with peer dependency errors`**

Solution:
```bash
# Use --force flag
pnpm install --force

# Or update pnpm
npm install -g pnpm@latest
```

**Issue: `Three.js scene is black or not rendering`**

Solution:
- Check browser console for WebGL errors
- Ensure browser supports WebGL 2.0
- Try disabling browser extensions (ad blockers)
- Check GPU drivers are up to date

**Issue: `Module not found: Can't resolve '@decharge/types'`**

Solution:
```bash
# Rebuild shared packages
pnpm build

# If still failing, clean and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
pnpm build
```

**Issue: `Anchor build fails with Rust errors`**

Solution:
```bash
# Update Rust toolchain
rustup update

# Clean build artifacts
anchor clean

# Rebuild
anchor build

# If still failing, check Cargo.toml dependencies
```

### Performance Issues

**Slow WebSocket updates:**
- Check network tab in browser dev tools
- Verify gateway is not overloaded (check CPU usage)
- Reduce simulator event frequency by increasing intervals

**High memory usage:**
- Restart gateway service (in-memory state grows over time)
- Limit event buffer size in gateway config
- Close unused browser tabs

**3D scene lag:**
- Reduce number of plots rendered
- Disable post-processing effects
- Lower screen resolution
- Use a device with better GPU

## Development Tips

### Hot Reload

All services support hot reload:
- **Gateway:** Changes to `services/gateway/src/*` restart server automatically
- **Simulator:** Changes to `simulator/src/*` restart simulator automatically
- **Web App:** Changes to `apps/web-app/*` hot reload in browser
- **Packages:** Changes require manual rebuild (`pnpm build`)

### Debugging

**Backend (Gateway/Simulator):**
```bash
# Use Node.js debugger
node --inspect dist/index.js

# Or VS Code launch config
{
  "type": "node",
  "request": "launch",
  "name": "Debug Gateway",
  "program": "${workspaceFolder}/services/gateway/src/index.ts",
  "runtimeArgs": ["-r", "ts-node/register"]
}
```

**Frontend (Web App):**
- Use React DevTools extension
- Check browser console for errors
- Use Network tab for WebSocket debugging
- Use React Three Fiber DevTools for 3D scene inspection

**Smart Contracts:**
```bash
# View program logs
solana logs <program_id>

# Use anchor test with console logs
anchor test --skip-build
```

### Code Quality

**Linting:**
```bash
# Run Biome formatter
pnpm format

# Run Next.js linter
cd apps/web-app
pnpm lint
```

**Type Checking:**
```bash
# Check all TypeScript
pnpm typecheck
```

## Summary

You should now have:
1. All dependencies installed
2. Solana programs built
3. Three services running (gateway, simulator, web app)
4. A working dashboard at http://localhost:3000
5. Real-time data flowing through the system

If you encounter any issues not covered here, check:
- The [Repository Structure](REPOSITORY.md) for code organization
- The [Features](FEATURES.md) for detailed feature explanations
- The [Architecture](architecture.md) for technical design decisions

For hackathon reviewers: The entire demo should work out of the box with just `pnpm install` and starting the three services. The simulator provides realistic data without requiring physical hardware or external APIs.

