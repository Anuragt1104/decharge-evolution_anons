# Features Documentation

This document provides a detailed breakdown of all features in DeCharge Evolution, organized by the main track and bonus track.

## Main Track: Real-World Charging Economy

### Feature 1: Live Charging Feed

**What It Does:**

Displays a real-time stream of charging sessions happening across the DeCharge network. Each session shows:
- Driver name and vehicle model
- Station location
- Current energy delivered (kWh)
- Points earned so far
- Session duration
- Status (charging, completed)

**How It Works:**

1. When a driver starts charging, the simulator sends a `session_start` event to the gateway
2. The gateway creates a session record with initial values
3. The gateway broadcasts the event via WebSocket to all connected clients
4. The web app receives the event and adds the session to the live table
5. As charging continues, `session_update` events flow through the same pipeline
6. When the session completes, a `session_complete` event marks it as finished

**Technical Implementation:**

- **Backend:** Fastify WebSocket server broadcasting events in real-time
- **Frontend:** SWR + Zustand for state management, React component with auto-scrolling table
- **Data Structure:** `GatewaySession` type with id, driver, energy, points, timestamps
- **Update Frequency:** Every 6 seconds during active charging

**User Value:**

- Transparency: See actual network activity in real-time
- Trust: Verify that sessions are being tracked fairly
- Engagement: Watch the network grow as more drivers participate

**Code References:**

- Session table component: `apps/web-app/components/live-session-table.tsx`
- Gateway event handler: `services/gateway/src/index.ts` (POST /ingest)
- WebSocket hook: `apps/web-app/components/use-gateway-data.ts`

### Feature 2: Per-Watt Billing

**What It Does:**

Calculates rewards at a granular level based on actual energy delivered. Instead of flat rates, drivers earn points proportional to kilowatt-hours consumed.

**Formula:**

```
Points Earned = Energy Delivered (kWh) × Rate per kWh
```

Default rate: 100 points per kWh (configurable in platform config)

**How It Works:**

1. Session starts with 0 energy and 0 points
2. Every update, the new energy amount is sent (cumulative, not incremental)
3. Points are recalculated: `new_points = new_energy_kwh * rate`
4. When session completes, final energy and points are locked
5. Points are minted as SPL tokens to the driver's vault (in production)

**Technical Implementation:**

- **Smart Contract:** `point_rate_microunits` field in `PlatformConfig` account
- **Gateway:** Stores cumulative values per session, updates on each telemetry event
- **Precision:** Uses microunits (1 million = 1 whole unit) to avoid floating point errors

**Example:**

```
Session Start: 0 kWh, 0 points
Update 1: 2.3 kWh, 230 points
Update 2: 5.7 kWh, 570 points
Update 3: 9.1 kWh, 910 points
Session End: 12.8 kWh, 1,280 points
```

**User Value:**

- Fairness: Pay exactly for what you use
- Precision: No rounding errors or approximations
- Incentive: Bigger charges = more rewards

**Code References:**

- Point calculation: `simulator/src/index.ts` (points = energy * rate)
- Smart contract rate: `programs/decharge/src/state.rs` (PlatformConfig)
- Display formatting: `packages/utils/src/index.ts`

### Feature 3: Points Economy

**What It Does:**

Creates a two-sided marketplace where drivers earn points and Web3 users purchase them at discounted rates.

**Marketplace Items:**

| Item | Points Cost | Cash Value | Discount | Inventory |
|------|------------|------------|----------|-----------|
| Ultra-fast Charge Booster | 480 | $65 | 32% | 250 |
| Heliox Mobility Ride Pack | 320 | $48 | 40% | 400 |
| Solar Canopy Upgrade | 1,200 | $210 | 25% | 25 |
| DeCharge VIP Pass | 950 | $130 | 41% | 150 |

**How It Works:**

**For Drivers (Earning):**
1. Complete charging sessions to accumulate points
2. Points are stored in an on-chain vault account
3. Choose to list points for sale at marketplace rate
4. Receive payment when Web3 users purchase

**For Buyers (Purchasing):**
1. Browse marketplace to see available items
2. Click "Purchase" and scan Solana Pay QR code
3. Approve transaction in wallet (transfer points from driver vault)
4. Receive redemption token instantly
5. Use token for energy boosts, rides, or perks

**Technical Implementation:**

- **Smart Contract:** `purchase_points` instruction transfers SPL tokens and SOL/USDC
- **Gateway:** Tracks inventory levels and decrements on purchase
- **Frontend:** Marketplace grid with Solana Pay integration
- **Payment Flow:** Solana Pay creates transaction, wallet signs, program executes

**Economic Model:**

The discount creates demand:
- Driver earns 1,000 points from 10 kWh session
- Points have cash value of ~$10 (at $1 per 100 points)
- Buyer purchases for 500 points (50% discount)
- Buyer pays $5 worth of SOL/USDC
- Driver receives $5 revenue
- Buyer gets $10 value for $5 spent

This 2x value proposition drives adoption on both sides.

**User Value:**

- Drivers: Monetize their charging activity
- Buyers: Access premium perks at discount
- Platform: Creates organic demand for points
- Ecosystem: Sustainable economic loop

**Code References:**

- Marketplace component: `apps/web-app/components/marketplace-grid.tsx`
- Purchase instruction: `programs/decharge/src/instructions/mod.rs`
- Solana Pay integration: `apps/web-app/lib/solana-pay.ts`

### Feature 4: On-Chain Transparency

**What It Does:**

Records all charging sessions, point transfers, and ownership changes on Solana for complete auditability.

**What's On-Chain:**

**Station Registry:**
- Location (latitude/longitude as microunits)
- Capacity (max kW)
- Pricing rates (energy + time components)
- Operator wallet
- Active status

**Session Records:**
- Station reference
- Driver wallet
- Energy delivered (in watt-hours)
- Time elapsed (seconds)
- Points earned
- Telemetry hash (for audit trail)
- Timestamps (opened, closed)

**Driver Profiles:**
- Total sessions completed
- Total energy consumed (lifetime)
- Total points earned
- Outstanding points balance

**Point Transfers:**
- From: Driver vault
- To: Buyer wallet
- Amount: Point quantity
- Timestamp: Block time

**How It Works:**

1. Off-chain oracle (gateway) collects telemetry from stations
2. Oracle signs attestations with private key
3. Oracle submits transactions to Solana program
4. Program validates oracle signature against registered oracle pubkey
5. Program updates account state
6. Emits events for indexing

**Technical Implementation:**

- **Account Structure:** PDAs with deterministic seeds (e.g., `["session", station, counter]`)
- **Events:** Anchor event macros emit structured logs
- **Indexing:** Events can be indexed by Helius, TheGraph, or custom indexer
- **Verification:** Anyone can read accounts to verify session history

**Example Query:**

```typescript
// Get all sessions for a driver
const driverPDA = getDriverProfilePDA(program.programId, driverWallet);
const profile = await program.account.driverProfile.fetch(driverPDA);

console.log(`Total sessions: ${profile.totalSessions}`);
console.log(`Lifetime energy: ${profile.totalEnergyWh / 1000} kWh`);
console.log(`Points earned: ${profile.totalPointsEarned}`);
```

**User Value:**

- Trust: All data is verifiable and immutable
- Transparency: No hidden calculations or manipulation
- Composability: Other apps can build on this data
- Auditability: Disputes can be resolved with on-chain proof

**Code References:**

- Account definitions: `programs/decharge/src/state.rs`
- Event emissions: `programs/decharge/src/events.rs`
- SDK queries: `packages/sdk/src/index.ts`

### Feature 5: Solana Pay Integration

**What It Does:**

Enables instant, low-fee payments for point purchases using Solana Pay QR codes and mobile wallets.

**How It Works:**

1. User clicks "Purchase" on marketplace item
2. Frontend creates Solana Pay transaction request
3. Transaction includes:
   - Transfer of SOL/USDC from buyer to treasury
   - Transfer of points from driver vault to buyer
   - Update of marketplace inventory
4. QR code is generated with transaction details
5. User scans with Phantom, Solflare, or other compatible wallet
6. Wallet displays transaction preview
7. User approves and transaction executes
8. Confirmation appears in dashboard within 1-2 seconds

**Transaction Structure:**

```typescript
const transaction = new Transaction().add(
  // Transfer payment
  SystemProgram.transfer({
    fromPubkey: buyer,
    toPubkey: treasury,
    lamports: priceInLamports,
  }),
  
  // Transfer points
  await program.methods
    .purchasePoints({ pointAmount: 480 })
    .accounts({
      buyer,
      driverVault,
      buyerAccount,
      // ...
    })
    .instruction(),
);
```

**Cost Comparison:**

| Network | Transaction Fee | Time to Confirm |
|---------|----------------|-----------------|
| Solana | $0.00025 | 400ms |
| Ethereum | $15-50 | 15 seconds |
| Polygon | $0.01-0.10 | 2 seconds |

Solana's speed and cost make microtransactions practical.

**Technical Implementation:**

- **Protocol:** Solana Pay specification v1.0
- **Libraries:** `@solana/pay` npm package
- **QR Format:** `solana:<transaction_request_url>`
- **Security:** All transactions signed by user wallet (non-custodial)

**User Value:**

- Speed: Instant transactions without waiting
- Cost: Sub-penny fees don't eat into rewards
- Convenience: Scan QR from mobile wallet
- Security: Non-custodial, user controls funds

**Code References:**

- Solana Pay button: `apps/web-app/components/solana-pay-button.tsx`
- Transaction builder: `apps/web-app/lib/solana-pay.ts`
- Purchase instruction: `programs/decharge/src/instructions/mod.rs`

### Feature 6: Network Metrics Dashboard

**What It Does:**

Displays aggregated statistics about the DeCharge network in three key metric cards.

**Metrics:**

**Energy Delivered:**
- Total kilowatt-hours flowing through network since midnight UTC
- Trend: Carbon offset (kg CO₂ saved)
- Calculation: Energy × emission factor (0.4 kg CO₂/kWh average)

**Network Utilization:**
- Composite demand index combining live sessions, capacity, and loyalty boosts
- Percentage representation of network load
- Trend: Online stations / total stations

**Points Minted:**
- Total points issued to drivers across all sessions
- Represents real value generated by the network
- Trend: Available inventory in marketplace

**How It Works:**

Gateway service aggregates data from all sessions and stations:

```typescript
const totalEnergy = sessions.reduce((sum, s) => sum + s.energyDeliveredKwh, 0);
const totalPoints = sessions.reduce((sum, s) => sum + s.pointsEarned, 0);
const avgUtilization = stations.reduce((sum, s) => sum + s.utilizationPercent, 0) / stations.length;
```

Web app fetches these metrics via REST API and displays in metric cards.

**Technical Implementation:**

- **Backend:** GET /api/dashboard endpoint calculates aggregates
- **Frontend:** `MetricCard` component with animated counter
- **Updates:** Refresh every 10 seconds or on WebSocket event
- **Formatting:** Human-readable numbers with units (kWh, %, pts)

**User Value:**

- Overview: Quick snapshot of network health
- Growth: Watch metrics increase as network scales
- Impact: See real-world environmental benefits

**Code References:**

- Metric cards: `apps/web-app/components/metric-card.tsx`
- Dashboard API: `services/gateway/src/index.ts` (GET /api/dashboard)
- Animated counter: `apps/web-app/components/animated-counter.tsx`

## Bonus Track: Virtual DeCharge World

### Feature 7: 3D Virtual World

**What It Does:**

Renders an interactive 3D environment where users can explore, claim, and manage virtual charging plots.

**Visual Elements:**

- Ground plane with grid texture
- Fog effect for depth perception
- Ambient and directional lighting
- Plot meshes with glow effects
- Charger 3D models (different levels)
- Particle systems for active sessions
- Camera controls (orbit, pan, zoom)

**How It Works:**

1. Web app loads Three.js scene using React Three Fiber
2. Gateway provides list of claimed plots with coordinates
3. Scene renders each plot as a 3D object at specified position
4. Different vibes (eco, tech, community) have different colors:
   - Eco: Green gradient
   - Tech: Blue gradient
   - Community: Purple gradient
5. User can click plots to see details in side panel
6. Active charging sessions show particle effects

**Technical Implementation:**

- **Engine:** Three.js 0.161 with React Three Fiber
- **Components:** `@react-three/drei` for helpers (OrbitControls, Effects)
- **State:** Zustand store for selected plot and interaction mode
- **Rendering:** WebGL with post-processing effects (bloom, vignette)

**Scene Structure:**

```
<Canvas>
  <Lighting />
  <Grid />
  <Fog />
  {plots.map(plot => (
    <InteractivePlot
      key={plot.regionKey}
      position={plot.coordinates}
      vibe={plot.vibe}
      owner={plot.owner}
      onClick={handleSelect}
    />
  ))}
  <OrbitControls />
  <PostProcessing />
</Canvas>
```

**User Value:**

- Immersion: Engaging 3D experience beyond flat dashboards
- Discovery: Explore the network spatially
- Ownership: Visual representation of claimed plots
- Gamification: Makes participation fun and rewarding

**Code References:**

- Scene wrapper: `apps/web-app/components/world/world-scene-wrapper.tsx`
- Interactive plots: `apps/web-app/components/world/interactive-plot.tsx`
- Charger models: `apps/web-app/components/world/charger-models.tsx`
- Effects: `apps/web-app/components/world/world-effects.tsx`

### Feature 8: Plot Claiming System

**What It Does:**

Allows users to claim ownership of scarce virtual plots in the DeCharge world.

**Plot Properties:**

- **Region Key:** Unique identifier (e.g., "aurora-basin", "quantum-docks")
- **Coordinates:** 3D position [x, y, z] in the virtual world
- **Owner:** Solana wallet address
- **Power Score:** Arbitrary rating (0-100) indicating plot desirability
- **Vibe:** Aesthetic category (eco, tech, community)
- **Boosts:** Array of multipliers (Solar Array +15%, Grid Sync +10%, etc.)

**How It Works:**

1. User explores the 3D world and finds an unclaimed plot
2. Click on the plot to see details panel
3. Click "Claim Plot" button
4. Transaction is sent to Solana program:
   ```rust
   pub fn claim_world_plot(
     ctx: Context<ClaimWorldPlot>,
     region_key: [u8; 64],
   ) -> Result<()>
   ```
5. Program creates `WorldPlot` account with PDA seed `["plot", region_key]`
6. Plot ownership is recorded on-chain
7. Gateway receives claim event and broadcasts to all clients
8. 3D scene updates to show plot as claimed with owner's wallet

**Scarcity Model:**

Only a fixed number of plots exist (e.g., 100 total). This creates:
- Competition for prime locations
- Value appreciation for early claimers
- Natural supply constraint
- Secondary market potential

**Technical Implementation:**

- **Smart Contract:** `WorldPlot` account stores ownership and metadata
- **Gateway:** Maintains map of claimed plots, rejects duplicate claims
- **Frontend:** `use-claim-plot.ts` hook handles wallet interaction
- **UI:** Plot details panel with claim button and owner display

**Cost:**

- Small claim fee (e.g., 0.1 SOL) to prevent spam
- One-time cost per plot
- Revenue goes to platform treasury

**User Value:**

- Ownership: Possess scarce digital real estate
- Revenue: Earn from virtual charging sessions
- Status: Display wallet address in 3D world
- Investment: Potential appreciation over time

**Code References:**

- Claim hook: `apps/web-app/hooks/use-claim-plot.ts`
- Smart contract: `programs/decharge/src/instructions/mod.rs` (claim_world_plot)
- Plot details: `apps/web-app/components/world/plot-details-panel.tsx`

### Feature 9: Virtual Charger Installation

**What It Does:**

Enables plot owners to deploy and upgrade virtual charging infrastructure on their claimed plots.

**Charger Levels:**

| Level | Multiplier | Installation Cost | 3D Model |
|-------|-----------|-------------------|----------|
| 1 (Basic) | 1x | 100 USDC | Small pedestal |
| 2 (Fast) | 2.5x | 300 USDC | Medium tower |
| 3 (Ultra) | 5x | 500 USDC | Large structure with panels |

**How It Works:**

1. Owner claims a plot (initially no charger)
2. Navigate to plot in 3D world or plot details panel
3. Select desired charger level
4. Pay installation cost via Solana Pay
5. Transaction updates `WorldPlot.upgrade_level` on-chain
6. 3D scene renders appropriate charger model at plot location
7. Future virtual sessions use the multiplier for points calculation

**Upgrade Path:**

```
Unclaimed → Level 1 → Level 2 → Level 3
```

Owners can progressively upgrade by paying the difference in cost.

**Boost System:**

In addition to level upgrades, owners can add boosts:
- **Solar Array:** +15% points per session
- **Grid Sync:** +10% capacity (more sessions)
- **Community Boost:** +20% during peak hours

Boosts stack with level multipliers for maximum earnings.

**Technical Implementation:**

- **Smart Contract:** `upgrade_level` u8 field in `WorldPlot` account
- **3D Models:** Separate GLB files for each level, loaded dynamically
- **Payment:** Staking USDC to treasury, recorded in plot metadata
- **Rendering:** Conditional model selection based on upgrade level

**Example Calculation:**

```
Base session: 10 kWh × 80 pts/kWh = 800 points
Level 3 multiplier: 800 × 5 = 4,000 points
Solar Array boost: 4,000 × 1.15 = 4,600 points
Owner revenue (10%): 460 points
```

**User Value:**

- Customization: Build the charger network you want
- ROI: Higher levels = faster payback period
- Progression: Clear upgrade path incentivizes engagement
- Strategy: Choose boosts based on goals (capacity vs efficiency)

**Code References:**

- Charger models: `apps/web-app/components/world/charger-models.tsx`
- Installer UI: `apps/web-app/components/world/charger-installer.tsx`
- Upgrade instruction: `programs/decharge/src/instructions/mod.rs`

### Feature 10: Virtual Charging Sessions

**What It Does:**

Simulates charging activity at virtual plots, generating on-chain revenue for plot owners.

**How It Works:**

1. Simulator picks a random claimed plot from the world
2. Generates a virtual driver with vehicle and energy need
3. Calculates base points: `energy_kwh × rate_per_kwh`
4. Applies plot's charger level multiplier
5. Calculates owner revenue (10% of total points)
6. Sends `virtual_session_complete` event to gateway
7. Gateway broadcasts to all clients
8. Owner's earnings counter increments in UI

**Virtual Driver Flow:**

```typescript
// Simulator logic
const claimedPlots = getClaimedPlots();
const selectedPlot = random(claimedPlots);
const driver = random(drivers); // "Maya Okafor", "Rivian R1S"
const energyKwh = 5 + Math.random() * 15; // 5-20 kWh
const basePoints = energyKwh * 80;
const multiplier = selectedPlot.chargerLevel === 1 ? 1 : 
                   selectedPlot.chargerLevel === 2 ? 2.5 : 5;
const totalPoints = basePoints * multiplier;
const ownerRevenue = totalPoints * 0.1; // 10% revenue share
```

**Session Data:**

```typescript
{
  type: "virtual_session_complete",
  regionKey: "quantum-docks",
  owner: "4Dx7...B3qR",
  driver: "Maya Okafor",
  vehicleModel: "Rivian R1S",
  energyDeliveredKwh: 12.3,
  pointsEarned: 6150, // with Level 3 multiplier
  ownerRevenue: 615,
  chargerLevel: 3
}
```

**Frequency:**

- One virtual session every 12 seconds (when plots exist)
- Only claimed plots receive sessions
- Weighted distribution (higher level = more likely to be selected)

**Technical Implementation:**

- **Simulator:** `simulateVirtualSession()` function runs on interval
- **Gateway:** Validates plot ownership, broadcasts event
- **Frontend:** Earnings tracker component shows cumulative revenue
- **Smart Contract:** (Future) Would record session on-chain and distribute tokens

**Revenue Example:**

```
Day 1: 5 sessions × 500 pts avg = 2,500 points
Week 1: 35 sessions × 500 pts avg = 17,500 points
Month 1: 150 sessions × 500 pts avg = 75,000 points

At $1 per 100 points = $750 monthly revenue
Initial investment: 500 USDC (Level 3)
Payback period: ~1 month
ROI: Positive after month 2
```

**User Value:**

- Passive income: Earn without active participation
- Scalability: Own multiple plots for higher revenue
- Real rewards: Points can be sold or redeemed
- Engagement: Incentive to upgrade and optimize plots

**Code References:**

- Virtual session logic: `simulator/src/index.ts` (simulateVirtualSession)
- Earnings tracker: `apps/web-app/components/world/earnings-tracker.tsx`
- Session event type: `packages/types/src/index.ts`

### Feature 11: Activity Feed

**What It Does:**

Displays a scrolling feed of recent events across both real and virtual networks.

**Event Types Shown:**

1. **Session Start** - "Noah Singh started charging at Station Bravo"
2. **Session Complete** - "Alya Chen completed session: 12.3 kWh, 1,230 pts"
3. **Points Purchase** - "Wallet 4Dx7... redeemed Energy Boost for 480 pts"
4. **Plot Claim** - "Wallet 7Kp2... claimed plot Solstice Grove"
5. **Virtual Session** - "Maya Okafor charged at Quantum Docks: 615 pts to owner"

**How It Works:**

1. Gateway maintains a circular buffer of recent events (last 200)
2. Each event type has a formatted message template
3. Events are sent via WebSocket with timestamps
4. Frontend renders events in reverse chronological order (newest first)
5. Auto-scrolls when new events arrive
6. Click event to see details (future feature)

**Event Structure:**

```typescript
type GatewayLiveEvent = {
  type: 'session_start' | 'session_complete' | 'points_purchase' | 'world_plot_claim';
  payload: { /* event-specific data */ };
  timestamp: number;
};
```

**UI Design:**

- Compact list with icon per event type
- Relative timestamps ("2 minutes ago")
- Color coding: green (energy), amber (points), blue (world)
- Smooth animations on new event arrival

**Technical Implementation:**

- **Backend:** `state.recentEvents` array in gateway
- **Frontend:** `ActivityFeed` component with virtualized list
- **Styling:** TailwindCSS with custom animations
- **State:** Zustand store appends new events

**User Value:**

- Awareness: See what's happening network-wide
- Engagement: Feel connected to community activity
- Transparency: Verify events are being recorded
- Discovery: Learn about features by seeing others use them

**Code References:**

- Activity feed: `apps/web-app/components/activity-feed.tsx`
- Event buffer: `services/gateway/src/index.ts` (state.recentEvents)

## Innovation Highlights

### 1. Real-World Data Bridge

Unlike most blockchain projects that simulate everything, we've built an architecture that can integrate actual charging station APIs. The oracle pattern allows verified telemetry to flow on-chain while maintaining performance.

### 2. Economic Sustainability

The two-sided marketplace creates organic demand for driver-earned points. Web3 users aren't just speculating—they're getting real value (energy boosts, rides, perks) at a discount. This sustainable model doesn't rely on token inflation or artificial incentives.

### 3. Solana-First Design

We chose Solana specifically for its advantages:
- Sub-second confirmation for real-time updates
- Sub-penny fees for per-watt micropayments
- SPL Token standard for composable point economy
- Parallel transaction processing for high throughput

The experience wouldn't be possible on slower, more expensive chains.

### 4. Gamification Without Gimmicks

The virtual world isn't just decoration—it's a functional revenue-generating system. Plot ownership, charger upgrades, and passive income create engaging gameplay while supporting the real network's economy.

### 5. Modular Architecture

The separation of concerns (smart contracts, gateway, simulator, web app) makes the project:
- Easy to understand and review
- Simple to extend with new features
- Possible to integrate with external systems
- Testable at each layer independently

## How Features Map to Judging Criteria

### Innovation

- Oracle pattern for real-world data verification
- Two-sided marketplace creating organic demand
- Virtual world extending participation globally
- Modular architecture enabling composability

### Technical Implementation

- Clean Anchor program with proper account structure
- Real-time WebSocket streaming with sub-second latency
- Modern React with Three.js 3D rendering
- Type-safe monorepo with shared packages

### Impact

- Solves real problem: Web3 participation in sustainability
- Creates economic value for both sides of marketplace
- Demonstrates DePIN feasibility on Solana
- Provides blueprint for other physical infrastructure networks

### Clarity

- Comprehensive documentation with examples
- Clear code structure and naming
- Visual dashboard showing live activity
- Intuitive user flows for all features

## Summary

DeCharge Evolution delivers on both tracks:

**Main Track:**
- Live feed, per-watt billing, points economy, transparency, Solana Pay

**Bonus Track:**
- 3D world, plot claiming, charger upgrades, virtual sessions, revenue sharing

All features work together to create a cohesive experience where real-world sustainability meets digital ownership on Solana.

