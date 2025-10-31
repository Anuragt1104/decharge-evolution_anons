# Repository Structure

This document explains how the DeCharge Evolution codebase is organized and how different components work together.

## High-Level Overview

DeCharge Evolution is a monorepo managed with pnpm workspaces and Turbo. The project has four main layers:

1. **Smart Contracts** - Solana programs written in Rust using Anchor
2. **Backend Services** - Node.js services for real-time data and simulation
3. **Web Application** - Next.js dashboard with 3D visualization
4. **Shared Packages** - Reusable TypeScript libraries

## Directory Structure

```
decharge-evolution/
│
├── programs/              # Solana smart contracts
│   └── decharge/         # Main Anchor program
│
├── apps/                 # Frontend applications
│   └── web-app/         # Next.js dashboard
│
├── services/            # Backend services
│   └── gateway/        # Real-time event gateway
│
├── simulator/          # Charging session simulator
│
├── packages/          # Shared libraries
│   ├── sdk/          # Solana program client
│   ├── types/        # Shared TypeScript types
│   ├── ui/          # Reusable UI components
│   └── utils/       # Helper functions
│
├── docs/            # Documentation
├── tests/           # Integration tests
└── target/          # Compiled Solana programs
```

## Component Deep Dive

### 1. Smart Contracts (`programs/decharge/`)

The Solana program is the foundation of the entire system. It manages all on-chain state and enforces business logic.

**Key Files:**

- `src/lib.rs` - Main program entry point with instruction definitions
- `src/state.rs` - Account structures (PlatformConfig, ChargingSession, WorldPlot, etc.)
- `src/instructions/` - Instruction handlers for each program operation
- `src/errors.rs` - Custom error definitions
- `src/events.rs` - Event emissions for off-chain indexing
- `src/constants.rs` - Program-wide constants

**Account Types:**

| Account | Purpose | Seeds |
|---------|---------|-------|
| `PlatformConfig` | Global configuration and admin settings | `["config"]` |
| `ChargingStation` | Station metadata (location, capacity, pricing) | `["station", station_id]` |
| `DriverProfile` | Driver statistics and cumulative earnings | `["driver", driver_pubkey]` |
| `ChargingSession` | Individual session telemetry and status | `["session", station, session_counter]` |
| `PointsVault` | Escrow for driver-earned points | `["vault", driver_pubkey]` |
| `WorldPlot` | Virtual plot ownership and charger state | `["plot", region_key]` |

**Instructions:**

- `initialize_platform` - One-time setup for admin and treasuries
- `register_station` - Add a new charging station to the network
- `start_session` - Begin tracking a charging session
- `record_telemetry` - Update session with new energy/time data
- `close_session` - Finalize session and mint points to driver
- `purchase_points` - Transfer points from driver to buyer via Solana Pay
- `claim_world_plot` - Register ownership of a virtual plot

### 2. Web Application (`apps/web-app/`)

The Next.js dashboard is the primary user interface. It connects to the gateway service via WebSockets and displays real-time data.

**Structure:**

```
apps/web-app/
├── app/                    # Next.js 14 app router
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with wallet provider
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── metric-card.tsx           # Dashboard KPI cards
│   ├── live-session-table.tsx   # Active sessions table
│   ├── marketplace-grid.tsx     # Point redemption marketplace
│   ├── activity-feed.tsx        # Recent events feed
│   ├── wallet-provider.tsx      # Solana wallet adapter setup
│   ├── solana-pay-button.tsx   # Payment UI component
│   ├── use-gateway-data.ts     # WebSocket hook for live data
│   └── world/                   # Virtual world components
│       ├── world-scene-wrapper.tsx
│       ├── interactive-plot.tsx
│       ├── charger-models.tsx
│       ├── plot-details-panel.tsx
│       └── world-effects.tsx
│
├── hooks/                 # Custom React hooks
│   ├── use-claim-plot.ts      # Plot claiming logic
│   └── use-plot-selection.ts  # 3D selection state
│
└── lib/                   # Utility libraries
    ├── gateway-store.ts       # Zustand state for gateway data
    └── solana-pay.ts          # Solana Pay transaction building
```

**Key Components:**

**`page.tsx`** - Main dashboard that orchestrates all sections:
- Metric cards showing network stats (energy, utilization, points)
- Live session table with real-time updates
- Activity feed of recent events
- Marketplace grid with available rewards
- 3D virtual world viewport

**`use-gateway-data.ts`** - Custom hook that:
- Establishes WebSocket connection to gateway
- Handles bootstrap message with initial state
- Listens for real-time events (session updates, purchases, claims)
- Updates Zustand store with new data
- Provides clean API for components

**`world-scene-wrapper.tsx`** - Three.js scene that:
- Renders 3D plots with different vibes (eco, tech, community)
- Shows charger models based on upgrade level
- Handles click interactions for plot selection
- Displays particle effects for active sessions
- Integrates with plot details panel

### 3. Backend Services

#### Gateway Service (`services/gateway/`)

The gateway is a Fastify server that bridges the simulator and web app. It maintains in-memory state and broadcasts updates via WebSockets.

**Key Responsibilities:**

- Accept telemetry events from the simulator via POST /ingest
- Maintain maps of stations, sessions, marketplace items, and world plots
- Broadcast events to all connected WebSocket clients
- Provide REST APIs for initial data load
- Validate incoming events with Zod schemas

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| WS | `/stream` | WebSocket connection for real-time events |
| GET | `/api/dashboard` | Aggregated network metrics |
| GET | `/api/stations` | List all charging stations |
| GET | `/api/sessions` | Recent charging sessions |
| GET | `/api/marketplace` | Available point packages |
| GET | `/api/world` | Claimed virtual plots |
| GET | `/api/events` | Recent activity feed |
| POST | `/ingest` | Submit charging/marketplace/world events |

**Event Types:**

- `session_start` - New charging session initiated
- `session_update` - Telemetry update for active session
- `session_complete` - Session finalized
- `station_status` - Station health/capacity update
- `points_purchase` - Marketplace redemption
- `world_plot_claim` - Virtual plot claimed

**Data Flow:**

```
Simulator → POST /ingest → Gateway validates → Update in-memory state → Broadcast via WebSocket → Web app updates UI
```

#### Charging Simulator (`simulator/`)

The simulator generates realistic charging activity for demo and testing purposes.

**Features:**

- 5 pre-configured stations with different capacities
- 6 driver personas with various vehicle models
- Session lifecycle: start with low energy, periodic updates, eventual completion
- Marketplace purchases (20-40% trigger rate)
- Virtual plot claims (35% trigger rate)
- Virtual charging sessions once plots are claimed

**Timing:**

- New sessions start every 14 seconds
- Session updates every 6 seconds
- Station health checks every 18 seconds
- Marketplace events every 22 seconds
- Plot claims every 28 seconds
- Virtual sessions every 12 seconds

**Sample Output:**

```
[sim] Station stat-alpha initialized
[sim] Session a3f2c1... started at stat-bravo (2.3 kWh, 180 pts)
[sim] Session a3f2c1... completed (8.5 kWh, 740 pts)
[sim] Wallet 4Dx7... redeemed energy-boost for 480 pts
[sim] 4Dx7... claimed virtual plot aurora-basin with Level 2 charger
```

### 4. Shared Packages (`packages/`)

These packages are used across the monorepo to avoid duplication and ensure consistency.

#### SDK Package (`packages/sdk/`)

Wraps the Anchor-generated IDL into a convenient TypeScript client.

**Exports:**

- `DechargeProgram` - Typed program interface
- `getChargingSessionPDA` - Helper to derive session account address
- `getDriverProfilePDA` - Helper to derive driver profile address
- Type definitions for all accounts and instructions

**Usage Example:**

```typescript
import { DechargeProgram, getDriverProfilePDA } from '@decharge/sdk';

const [driverPDA] = getDriverProfilePDA(program.programId, driverWallet);
const profile = await program.account.driverProfile.fetch(driverPDA);
console.log(`Total sessions: ${profile.totalSessions}`);
```

#### Types Package (`packages/types/`)

Shared TypeScript types for gateway communication and UI rendering.

**Key Types:**

```typescript
// Gateway data structures
export interface GatewayStation {
  id: string;
  name: string;
  location: { city: string; latitude: number; longitude: number };
  status: 'online' | 'offline' | 'maintenance';
  livePowerKw: number;
  // ...
}

export interface GatewaySession {
  id: string;
  stationId: string;
  driver: string;
  vehicleModel: string;
  energyDeliveredKwh: number;
  pointsEarned: number;
  status: 'charging' | 'completed' | 'aborted';
  // ...
}

export interface GatewayWorldPlot {
  regionKey: string;
  coordinates: [number, number, number];
  owner: string;
  powerScore: number;
  vibe: 'eco' | 'tech' | 'community';
  boosts: Array<{ label: string; magnitude: number }>;
}

// Event types for WebSocket messages
export type GatewayLiveEvent =
  | { type: 'session_start'; payload: GatewaySession }
  | { type: 'session_update'; payload: GatewaySession }
  | { type: 'points_purchase'; payload: { itemId: string; wallet: string; points: number } }
  | { type: 'world_plot_claim'; payload: GatewayWorldPlot }
  // ...
```

#### UI Package (`packages/ui/`)

Reusable React components styled with TailwindCSS.

**Components:**

- Button variants (primary, secondary, ghost)
- Card containers with consistent styling
- Badge components for status indicators
- Loading spinners and skeletons

#### Utils Package (`packages/utils/`)

Helper functions used across the codebase.

**Utilities:**

- `formatEnergy` - Format kWh with appropriate precision
- `formatPoints` - Format large numbers with commas
- `truncateAddress` - Shorten Solana addresses for display
- `calculateSessionDuration` - Time formatting for session lengths

## How Components Interact

### Full System Flow

Let's trace a complete charging session from start to finish:

**1. Simulator Generates Session**

```typescript
// simulator/src/index.ts
const startSession = async () => {
  await postEvent({
    type: "session_start",
    stationId: "stat-alpha",
    driver: "Noah Singh",
    vehicleModel: "Tesla Model 3 Highland",
    energyDeliveredKwh: 2.3,
    pointsEarned: 180,
  });
};
```

**2. Gateway Receives and Processes**

```typescript
// services/gateway/src/index.ts
app.post("/ingest", (request) => {
  const event = validate(request.body);
  const session = createSession(event);
  state.sessions.set(session.id, session);
  broadcast({ type: "session_start", payload: session });
});
```

**3. Web App Receives Update**

```typescript
// apps/web-app/components/use-gateway-data.ts
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "session_start") {
    setSessions(prev => [...prev, message.payload]);
  }
};
```

**4. UI Renders New Session**

```typescript
// apps/web-app/components/live-session-table.tsx
<Table>
  {sessions.map(session => (
    <Row key={session.id}>
      <Cell>{session.driver}</Cell>
      <Cell>{session.energyDeliveredKwh} kWh</Cell>
      <Cell>{session.pointsEarned} pts</Cell>
    </Row>
  ))}
</Table>
```

### On-Chain Integration Points

While the current demo uses simulated data, the architecture supports real Solana integration:

**Session Recording:**

```typescript
// Hypothetical on-chain flow
const session = await program.methods
  .startSession({
    energyWh: 2300,
    stationId: "stat-alpha",
  })
  .accounts({
    station: stationPDA,
    driver: driverWallet.publicKey,
    session: sessionPDA,
    // ...
  })
  .rpc();
```

**Point Purchase:**

```typescript
const purchase = await program.methods
  .purchasePoints({
    pointAmount: 480,
  })
  .accounts({
    buyer: buyerWallet.publicKey,
    driverVault: vaultPDA,
    // ...
  })
  .rpc();
```

## Development Workflow

### Building the Project

```bash
# Install all dependencies
pnpm install

# Build Solana programs
anchor build

# Build all TypeScript packages
pnpm build

# Run type checking
pnpm typecheck
```

### Running in Development

**Terminal 1: Gateway**
```bash
cd services/gateway
pnpm dev
# Runs on http://localhost:8787
```

**Terminal 2: Simulator**
```bash
cd simulator
pnpm dev
# Sends events to gateway
```

**Terminal 3: Web App**
```bash
cd apps/web-app
pnpm dev
# Runs on http://localhost:3000
```

### Testing

```bash
# Test Solana programs
anchor test

# Test TypeScript packages
pnpm test

# Run integration tests
pnpm test:integration
```

## Configuration

### Environment Variables

**Gateway Service:**
- `PORT` - Server port (default: 8787)
- `HOST` - Bind address (default: 0.0.0.0)
- `LOG_LEVEL` - Logging verbosity (default: info)

**Simulator:**
- `GATEWAY_URL` - Gateway endpoint (default: http://localhost:8787)

**Web App:**
- `NEXT_PUBLIC_GATEWAY_WS` - WebSocket URL for gateway
- `NEXT_PUBLIC_RPC_URL` - Solana RPC endpoint
- `NEXT_PUBLIC_PROGRAM_ID` - Deployed program address

### Anchor Configuration

```toml
# Anchor.toml
[programs.localnet]
decharge = "DeChrg11111111111111111111111111111111111111"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"
```

## Key Design Decisions

### Why Monorepo?

Using a monorepo with pnpm workspaces provides:
- Shared type definitions across frontend and backend
- Atomic updates when changing interfaces
- Simplified dependency management
- Faster iteration during development

### Why In-Memory Gateway?

The gateway uses in-memory state rather than a database because:
- Demo data is ephemeral (resets on restart)
- Sub-second latency requirements
- Simplifies deployment (no DB setup needed)
- Production version would use Redis or similar

### Why WebSockets?

WebSocket streaming provides:
- True real-time updates without polling
- Efficient bandwidth usage
- Natural fit for live dashboard
- Easy to scale with pub/sub systems

### Why Three.js?

Three.js with React Three Fiber gives us:
- Declarative 3D rendering in React
- Rich ecosystem of helpers (drei)
- Good performance for interactive scenes
- Easy integration with React state

## Summary

The DeCharge Evolution codebase is organized into clear layers:

- **Smart contracts** define the on-chain source of truth
- **Gateway service** provides real-time data streaming
- **Simulator** generates realistic demo activity
- **Web app** presents an interactive dashboard
- **Shared packages** ensure consistency

This architecture makes the project easy to understand, extend, and deploy.

