# DeCharge Evolution

A Solana-based decentralized EV charging platform that bridges real-world charging activity with on-chain rewards and an immersive virtual world.

## What We Built

DeCharge Evolution connects physical EV charging infrastructure with Web3 through:

**Main Track: Real-World Charging Economy**
- Live dashboard showing verified charging sessions as they happen
- Points earned per kilowatt-hour by EV drivers
- Marketplace where Web3 users can purchase driver points at discounted rates
- Solana Pay integration for instant, low-fee microtransactions
- Complete on-chain transparency for all sessions and rewards

**Bonus Track: Virtual DeCharge World**
- Interactive 3D world where users claim scarce virtual plots
- Virtual charger installations with upgrade levels
- Virtual charging sessions that generate real on-chain revenue
- Revenue sharing model for plot owners
- Gamified ecosystem that mirrors real charging network activity

## The Problem

Most Web3 users can't participate in real EV charging ecosystems. EV drivers who contribute to sustainable energy earn no real-time on-chain recognition. There's no bridge connecting physical charging data with Web3 engagement and token utility.

## Our Solution

We built a platform where:
- Every charging session is recorded on Solana with verified telemetry
- Drivers earn points based on energy delivered (per-watt billing)
- Web3 users purchase these points at 25-50% discount, creating demand
- All transactions flow through Solana for transparency and low fees
- A virtual world extends participation to anyone, anywhere

The result is a living economy where real-world sustainability meets digital ownership.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Smart Contracts | Solana, Anchor Framework, SPL Token |
| Backend Services | Node.js, TypeScript, Fastify, WebSockets |
| Web Application | Next.js 14, React, TailwindCSS |
| 3D Graphics | Three.js, React Three Fiber |
| Payments | Solana Pay, SPL Token |
| Real-time Data | WebSocket streaming, Server-Sent Events |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build smart contracts
anchor build

# Start the real-time gateway service
cd services/gateway
pnpm dev

# Start the charging session simulator
cd simulator
pnpm dev

# Start the web application
cd apps/web-app
pnpm dev
```

Visit `http://localhost:3000` to see the dashboard with live charging sessions, marketplace, and virtual world.

## Documentation

For a complete understanding of the project:

- **[Overview](docs/OVERVIEW.md)** - What the project does and why it matters
- **[Repository Structure](docs/REPOSITORY.md)** - How the codebase is organized
- **[Features](docs/FEATURES.md)** - Detailed breakdown of all features
- **[Setup Guide](docs/SETUP.md)** - Complete installation and running instructions
- **[Architecture](docs/architecture.md)** - Technical architecture and design decisions

## Hackathon Alignment

This project addresses the DeCharge Evolution hackathon requirements by:

1. **Live Charging Feed** - Real-time dashboard showing verified sessions and energy usage
2. **Per-Watt Billing** - Points calculated based on actual kilowatt-hours delivered
3. **Earn & Trade Points** - Drivers earn, Web3 users purchase at discount
4. **On-Chain Transparency** - All data flows through Solana smart contracts
5. **Solana Pay Integration** - Low-fee microtransactions for point purchases
6. **Bonus: Virtual World** - Immersive 3D experience with plot ownership and revenue sharing

## Project Status

- Solana programs deployed and tested
- Real-time gateway service operational
- Session simulator generating realistic charging data
- Web dashboard with live updates
- Points marketplace functional
- Virtual world with plot claiming and revenue mechanics

## Repository Structure

```
decharge-evolution/
├── programs/decharge/        # Solana smart contracts (Anchor)
├── apps/web-app/            # Next.js dashboard
├── services/gateway/        # Real-time event streaming service
├── simulator/               # Charging session simulator
├── packages/                # Shared TypeScript libraries
│   ├── sdk/                # Solana program client
│   ├── types/              # Shared type definitions
│   ├── ui/                 # Reusable UI components
│   └── utils/              # Helper utilities
└── docs/                   # Documentation
```

## Key Features at a Glance

**For EV Drivers:**
- Register charging stations
- Earn points automatically per session
- View charging history and rewards
- Sell points to Web3 community

**For Web3 Users:**
- Browse available point packages
- Purchase at 25-50% discount via Solana Pay
- Redeem for energy boosts, ride credits, and perks
- Claim virtual plots in the DeCharge world

**For Plot Owners:**
- Deploy virtual chargers with upgrade paths
- Earn passive revenue from virtual sessions
- Build community-driven charging infrastructure
- Participate in the on-chain energy economy

## License

This project was built for the DeCharge Evolution hackathon on Solana.

