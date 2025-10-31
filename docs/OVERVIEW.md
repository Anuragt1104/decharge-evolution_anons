# DeCharge Evolution: Project Overview

## What Is This Project?

DeCharge Evolution is a decentralized application built on Solana that connects real-world EV charging activity with blockchain-based rewards and engagement. It solves a fundamental problem in the Web3 space: most people can't participate in sustainable energy initiatives because they don't own charging stations or EVs.

Our platform creates a two-sided marketplace where EV drivers earn on-chain points for every kilowatt-hour they charge, and Web3 users can purchase these points at a discount to access real-world benefits. All of this is powered by Solana's fast, low-cost transactions.

## Why It Matters

### The Real-World Problem

Today's EV charging ecosystem has three major gaps:

1. **Limited Participation** - Only people near charging stations or with EVs can engage with the network
2. **No On-Chain Recognition** - Drivers who contribute to clean energy get no blockchain-based rewards
3. **Disconnected Communities** - Web3 users want to support sustainability but have no direct way to participate

### Our Solution

We bridge the physical and digital worlds by:

- Recording every charging session on Solana with verified telemetry
- Issuing points as SPL tokens that represent real energy delivered
- Creating a marketplace where anyone can purchase these points
- Building a virtual world that extends participation globally

The result is an economy where sustainability has real, tradeable value.

## Main Track: Real-World Charging Economy

### How It Works

**Step 1: Driver Charges Their EV**

When an EV driver plugs in at a DeCharge station, our oracle service authenticates the session and records it on Solana. The smart contract tracks:
- Energy delivered (kilowatt-hours)
- Time elapsed (seconds)
- Station location and capacity
- Driver's wallet address

**Step 2: Points Are Earned**

As energy flows, points accumulate in real-time based on a configurable rate (e.g., 100 points per kWh). These points are minted as SPL tokens directly to the driver's vault account.

**Step 3: Web3 Users Purchase Points**

In our marketplace, Web3 users browse available point packages at discounted rates (25-50% off cash equivalent). When they purchase:
- Payment flows through Solana Pay (SOL or USDC)
- Points transfer from driver's vault to buyer's wallet
- Revenue is credited to the driver
- Transaction is recorded on-chain for transparency

**Step 4: Points Are Redeemed**

Buyers use their points to redeem:
- Energy boosts at partner stations
- Ride credits for EV ride-sharing
- Physical rewards like solar upgrades
- VIP access and exclusive perks

### Key Features

**Live Charging Feed**

The dashboard displays a real-time stream of active charging sessions across the network. For each session, you can see:
- Driver name and vehicle model
- Current energy delivered and points earned
- Station location and capacity
- Session duration and status

This creates transparency and shows the network's real-world activity.

**Per-Watt Billing**

Unlike traditional flat-rate charging, we calculate rewards at a granular level:
- Points = kilowatt-hours × rate per kWh
- Updates happen every few seconds as energy flows
- Final settlement when session completes
- All calculations verified on-chain

This precision ensures drivers are fairly compensated for exactly the energy they consume.

**Points Economy**

The marketplace creates real demand for driver-earned points:
- Fixed discount rate (e.g., 50% off) makes points attractive
- Limited inventory creates scarcity and urgency
- Multiple redemption options provide utility
- On-chain trading ensures trust and transparency

**Solana Pay Integration**

We use Solana Pay for instant, low-fee transactions:
- QR code scanning for mobile purchases
- Sub-penny transaction fees
- Near-instant settlement
- Compatible with any Solana wallet

This makes microtransactions practical in a way traditional payments can't match.

### User Stories

**As an EV Driver (Sarah):**

Sarah drives a Tesla Model 3 and charges at DeCharge stations twice a week. Each time she plugs in:
1. Her wallet is automatically detected
2. Points accumulate as energy flows (e.g., 40 kWh = 4,000 points)
3. She sees her total earnings on the dashboard
4. She can list her points for sale or hold them for personal use

Over a month, Sarah earns 15,000 points worth about $150. She sells 10,000 points to Web3 users for $100 and keeps 5,000 for her own redemptions.

**As a Web3 User (Alex):**

Alex doesn't own an EV but wants to support clean energy. He browses the marketplace and sees:
- Ultra-fast Charge Booster: 480 points (worth $65, discounted from $65)
- Ride Credits Pack: 320 points (worth $48, discounted from $48)

Alex purchases the Charge Booster for 480 points by:
1. Scanning a Solana Pay QR code
2. Approving the transaction in his Phantom wallet
3. Receiving the boost token instantly
4. Gifting it to his friend who drives an EV

The transaction costs him $0.32 in fees (vs $3+ on Ethereum).

## Bonus Track: Virtual DeCharge World

### The Concept

The virtual world extends the DeCharge ecosystem beyond physical charging stations. It's a 3D environment where:
- Virtual plots represent scarce charging locations
- Users stake tokens to claim and upgrade plots
- Virtual charging sessions generate real revenue
- Plot owners earn passive income from network activity

Think of it as a gamified layer on top of the real network, where anyone can participate regardless of location.

### How It Works

**Plot Claiming**

The virtual world is divided into limited regions (e.g., 100 plots total). Users can:
1. Browse the 3D map to find unclaimed plots
2. Connect their wallet and claim a plot
3. Pay a small fee to register on-chain
4. Receive a World Plot NFT proving ownership

Each plot has unique coordinates and characteristics (eco, tech, or community vibe).

**Charger Installation**

Once you own a plot, you can deploy virtual chargers:
- Level 1: Basic charger (1x multiplier)
- Level 2: Fast charger (2.5x multiplier)
- Level 3: Ultra-fast charger (5x multiplier)

Higher levels cost more to install but generate better rewards. You can also add boosts:
- Solar Array: +15% efficiency
- Grid Sync: +10% capacity
- Community Boost: +20% during peak hours

**Virtual Charging Sessions**

The simulator routes virtual drivers through the world. When they charge at your plot:
- Energy is "delivered" and points are calculated
- Points are multiplied by your charger level
- You receive 10% of the points as revenue
- The session is recorded on-chain

This creates a passive income stream for plot owners.

**Revenue Model**

Here's a sample scenario:
- Virtual driver charges 10 kWh at your Level 2 plot
- Base points: 10 kWh × 80 points/kWh = 800 points
- Level 2 multiplier: 800 × 2.5 = 2,000 points
- Your revenue (10%): 200 points
- Worth approximately $2-3 depending on market rates

With multiple sessions per day, plot owners can earn meaningful returns while supporting the ecosystem.

### User Stories

**As a Plot Owner (Jamal):**

Jamal claims a prime plot in the "Quantum Docks" region and installs a Level 3 charger. He stakes 500 USDC to unlock the upgrade. Over the next month:
- 45 virtual sessions occur at his plot
- Average session: 12 kWh = 4,800 points (with 5x multiplier)
- His share: 480 points per session
- Total earnings: 21,600 points ≈ $200

After one month, Jamal has recouped 40% of his initial stake and continues earning passively.

**As a Virtual Driver (Maya):**

Maya doesn't own a plot but enjoys exploring the virtual world. Her avatar:
1. Drives to different regions looking for available chargers
2. Checks charger levels and boost combinations
3. Initiates a charging session at the best-rated plot
4. Earns bonus points for using community-upgraded chargers

This gamified experience keeps users engaged while generating real economic activity.

## Connection Between Tracks

The real-world and virtual tracks complement each other:

**Data Flow:**
- Real charging sessions provide baseline metrics (energy demand, peak hours)
- Virtual world uses this data to simulate realistic activity
- Both systems share the same point economy and smart contracts

**User Crossover:**
- Real EV drivers can invest earnings into virtual plots
- Plot owners can redeem rewards at real charging stations
- Web3 users engage with both marketplaces

**Network Effects:**
- More real drivers = more points supply = more marketplace liquidity
- More virtual plots = more engagement = more demand for points
- Combined ecosystem creates a flywheel of growth

## Addressing Hackathon Requirements

### Main Track Checklist

| Requirement | Implementation |
|-------------|----------------|
| Live charging feed | Real-time dashboard with WebSocket streaming |
| Per-watt billing | Points calculated per kWh with granular updates |
| Earn & trade points | SPL token minting for drivers, marketplace for buyers |
| On-chain transparency | All sessions recorded via Solana smart contracts |
| Solana Pay | Integrated for low-fee point purchases |

### Bonus Track Checklist

| Requirement | Implementation |
|-------------|----------------|
| Virtual world | 3D Three.js scene with interactive plots |
| Limited plots | Scarcity model with fixed number of claimable regions |
| Plot ownership | On-chain World Plot accounts with metadata |
| Virtual chargers | Upgrade levels with point multipliers |
| Community incentives | Revenue sharing and boost mechanisms |

### Innovation Points

1. **Real-World Bridge** - Actual charging telemetry flows on-chain, not just theoretical data
2. **Two-Sided Economy** - Creates supply (drivers) and demand (buyers) for points
3. **Solana Optimization** - Uses Solana's speed for real-time microtransactions
4. **Gamification Layer** - Virtual world extends participation beyond physical limitations
5. **Composability** - Modular architecture allows other apps to build on our infrastructure

## Technical Highlights

### Smart Contracts

We built a suite of Anchor programs on Solana:
- `ChargingNetwork`: Manages stations, drivers, and session lifecycle
- `PointsEconomy`: Issues and transfers DeCharge Points (SPL tokens)
- `WorldAssets`: Tracks plot ownership and virtual charger state

All state is stored on-chain with PDAs for deterministic account discovery.

### Real-Time Gateway

The gateway service sits between the simulator and web app:
- Ingests charging events via REST API
- Maintains in-memory state for fast reads
- Broadcasts updates over WebSockets
- Provides HTTP endpoints for initial data load

This architecture keeps the frontend responsive while reducing blockchain read costs.

### Charging Simulator

The simulator generates realistic charging patterns:
- 5 stations with varying capacity (80-140 kW)
- 6 driver profiles with different vehicles
- Session lifecycle: start → update → complete
- Marketplace and world events for diversity

This gives reviewers a working demo without needing physical hardware.

### 3D Virtual World

Built with React Three Fiber for declarative 3D:
- Interactive plot selection with hover effects
- Charger models that reflect upgrade levels
- Particle effects for active charging sessions
- Camera controls for exploring the environment

The world is more than decoration—it's a functional interface for plot management.

## Impact and Future Potential

### Immediate Impact

This project demonstrates how Solana can power real-world infrastructure:
- Fast enough for second-by-second telemetry
- Cheap enough for per-watt micropayments
- Transparent enough for community trust
- Composable enough for ecosystem growth

### Future Extensions

With more time and resources, we could:
- Integrate with real charging APIs (ChargePoint, EVgo)
- Add DAO governance for network parameters
- Create secondary markets for points trading
- Expand virtual world with more regions and activities
- Build mobile apps for drivers and buyers
- Partner with EV manufacturers for bundled rewards

### DePIN Vision

DeCharge Evolution is a proof-of-concept for decentralized physical infrastructure networks (DePIN). The patterns we've established—oracle attestations, point economies, virtual engagement layers—can apply to:
- Solar panel networks
- Bike sharing systems
- Community wifi networks
- Renewable energy grids

This project shows how Solana can coordinate physical resources at scale.

## Summary

DeCharge Evolution takes EV charging from a purely physical activity to a digital economy. We've built:
- A live system that tracks real charging sessions on-chain
- An economy where drivers earn and Web3 users participate
- A virtual world that extends the network globally
- All running on Solana for speed, cost, and transparency

The result is a platform that makes clean energy accessible, community-owned, and economically sustainable.

