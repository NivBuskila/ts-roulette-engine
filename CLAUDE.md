# CLAUDE.md - AI Assistant Guide for Roulette Game

> **Purpose**: This document provides comprehensive guidance for AI assistants working on this European Roulette game codebase. It explains the structure, conventions, architecture, and workflows to enable effective collaboration.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Type System](#type-system)
5. [Development Workflow](#development-workflow)
6. [Testing Strategy](#testing-strategy)
7. [API Contracts](#api-contracts)
8. [Key Files Reference](#key-files-reference)
9. [Code Conventions](#code-conventions)
10. [Common Tasks](#common-tasks)
11. [Important Patterns](#important-patterns)
12. [Gotchas & Warnings](#gotchas--warnings)

---

## Project Overview

### What is This?

A full-stack **European Roulette** game (single zero: 0-36) designed as a **technical showcase** to demonstrate advanced proficiency in:

- **Full-stack Architecture**: Clean separation of concerns and RESTful design.
- **TypeScript Mastery**: Advanced type patterns and shared schemas.
- **Game Development**: Complex state management with Phaser 3.
- **System Design**: Provably fair RNG and robust validation logic.

### Tech Stack

| Component    | Technology                         | Purpose                          |
| ------------ | ---------------------------------- | -------------------------------- |
| **Frontend** | Phaser 3 + TypeScript + Vite       | Game rendering, UI, animations   |
| **Backend**  | Express + TypeScript               | Game logic, API, RNG, validation |
| **Types**    | Shared TypeScript interfaces       | Type safety across stack         |
| **Testing**  | Jest (backend) + Vitest (frontend) | Unit & integration tests         |

### Key Statistics

- **Languages**: 100% TypeScript (zero `any` types in production code)
- **Test Coverage**: 199 total tests (87 backend + 112 frontend)
- **Bet Types**: All 13 standard roulette bet types supported
- **Architecture**: Stateful backend, stateless frontend communication

---

## Repository Structure

```
roulette/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── app.ts             # Express app configuration
│   │   ├── types/             # TypeScript interfaces (re-exports shared/)
│   │   ├── constants/         # Game constants & validation logic
│   │   ├── services/          # Core game services
│   │   │   ├── game.service.ts        # Game orchestration
│   │   │   ├── rng.service.ts         # Provably fair RNG
│   │   │   ├── payout.service.ts      # Payout calculations
│   │   │   ├── validation.service.ts  # Bet validation orchestrator
│   │   │   └── validators/            # Specialized validators
│   │   │       ├── inside-bets.validator.ts
│   │   │       └── outside-bets.validator.ts
│   │   ├── controllers/       # Request handlers
│   │   └── routes/            # API route definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/                  # Phaser 3 game client
│   ├── src/
│   │   ├── main.ts           # Entry point (creates Phaser game)
│   │   ├── config/           # Game configuration
│   │   ├── scenes/           # Phaser scenes
│   │   │   ├── BootScene.ts  # Asset loading
│   │   │   └── GameScene.ts  # Main game scene
│   │   ├── components/       # Game UI components
│   │   │   ├── Wheel.ts              # Roulette wheel
│   │   │   ├── BettingTable.ts       # Betting interface
│   │   │   ├── ChipSelector.ts       # Chip picker
│   │   │   ├── BalanceDisplay.ts     # Balance UI
│   │   │   └── HistoryDisplay.ts     # History UI
│   │   ├── managers/         # Game state managers (Phaser-dependent)
│   │   │   ├── BettingManager.ts     # Bet placement logic
│   │   │   ├── UIManager.ts          # UI state management
│   │   │   └── EffectsManager.ts     # Visual effects
│   │   ├── services/         # Stateless services (Phaser-independent)
│   │   │   └── api.service.ts        # Backend communication
│   │   ├── types/            # TypeScript interfaces (re-exports shared/)
│   │   └── constants/        # Game constants
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── shared/                    # Shared TypeScript types
│   └── types.ts              # Single source of truth for interfaces
│
├── README.md                 # User-facing documentation
├── roulette-spec.md          # Technical specification
└── CLAUDE.md                 # This file (AI assistant guide)
```

### Directory Purpose

| Directory              | Purpose           | Key Principle                                   |
| ---------------------- | ----------------- | ----------------------------------------------- |
| `backend/services/`    | Core game logic   | Server authority - all outcomes calculated here |
| `frontend/services/`   | API communication | Stateless, no Phaser dependency                 |
| `frontend/managers/`   | Game state & UI   | Stateful, Phaser-dependent, scene lifecycle     |
| `frontend/components/` | Visual elements   | Encapsulated Phaser objects                     |
| `shared/`              | Type definitions  | Single source of truth                          |

---

## Architecture & Design Patterns

### High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                    FRONTEND (Phaser 3)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GameScene (main orchestrator)                   │  │
│  │  ├── Components (Wheel, Table, UI)               │  │
│  │  ├── Managers (Betting, UI, Effects)             │  │
│  │  └── Services (API)                              │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP/REST
                        │ (JSON)
┌───────────────────────▼────────────────────────────────┐
│                    BACKEND (Express)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services                 │  │
│  │                                                   │  │
│  │  Services:                                        │  │
│  │  ├── game.service.ts (orchestrator)              │  │
│  │  ├── rng.service.ts (provably fair)              │  │
│  │  ├── validation.service.ts (bet validation)      │  │
│  │  └── payout.service.ts (win calculation)         │  │
│  │                                                   │  │
│  │  State: In-memory (balance, history)             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Server Authority**: All game logic and RNG happens on backend
2. **Type Safety**: Shared types ensure frontend/backend consistency
3. **Separation of Concerns**: Clear boundaries between layers
4. **Modular Services**: Each service has a single responsibility
5. **Zero `any` Types**: Full type coverage in production code

### Key Architectural Decisions

#### 1. Shared Type System

**Location**: `shared/types.ts`

**Pattern**: Both frontend and backend re-export shared types:

```typescript
// frontend/src/types/index.ts
export * from "../../../shared/types";

// backend/src/types/index.ts
export * from "../../../shared/types";
```

**Benefit**: API contracts are enforced at compile time. Impossible to have type drift.

#### 2. Frontend: `managers/` vs `services/` Separation

| Directory   | Characteristics                                 | Examples                      |
| ----------- | ----------------------------------------------- | ----------------------------- |
| `services/` | Stateless, no Phaser dependency, pure functions | `api.service.ts`              |
| `managers/` | Stateful, Phaser-dependent, scene lifecycle     | `BettingManager`, `UIManager` |

**Why**: `api.service.ts` can be tested in isolation or used in CLI. Managers require Phaser scene context.

#### 3. Backend: Layered Service Architecture

```
Controller
    ↓
game.service (orchestration)
    ↓         ↓           ↓
validation  payout      rng
    ↓
inside-bets.validator
outside-bets.validator
```

**Pattern**: Each service has a single responsibility and can be tested independently.

#### 4. Provably Fair RNG

**Implementation**: HMAC-SHA256 with modulo bias correction

**Why**: Industry standard for online gaming. Results are mathematically verifiable.

**Location**: `backend/src/services/rng.service.ts`

---

## Type System

### Core Type Definitions

All types are defined in `shared/types.ts`. Key interfaces:

#### Bet Types

```typescript
type BetType =
  | "straight"
  | "split"
  | "street"
  | "corner"
  | "line" // Inside
  | "column"
  | "dozen" // 2:1
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"; // 1:1

interface Bet {
  type: BetType;
  numbers: number[]; // Numbers covered by this bet
  amount: number; // Bet amount
}

interface BetResult extends Bet {
  won: boolean;
  payout: number; // Amount won (includes original bet if won)
}
```

#### Game Results

```typescript
interface GameResult {
  winningNumber: number;
  winningColor: "red" | "black" | "green";
  totalBetAmount: number;
  totalWinAmount: number;
  netProfit: number;
  newBalance: number;
  bets: BetResult[];
}

interface GameHistoryEntry {
  timestamp: string;
  winningNumber: number;
  winningColor: RouletteColor;
  totalBetAmount: number;
  totalWinAmount: number;
  netProfit: number;
}
```

#### API Responses

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

type ErrorCode =
  | "INSUFFICIENT_BALANCE"
  | "INVALID_BET"
  | "INVALID_BET_TYPE"
  | "SERVER_ERROR";
```

### Type Safety Rules

1. **NO `any` types** in production code
2. Use `ReturnType<typeof fn>` for test mocks instead of `any`
3. All API responses must match shared types
4. Constants use `as const` for literal types

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/NivBuskila/roulette.git
cd roulette

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Running Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Frontend proxy**: `vite.config.ts` proxies `/api` requests to backend (port 3001).

### Running Tests

**Backend tests (Jest):**

```bash
cd backend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test payout       # Run specific test file
```

**Frontend tests (Vitest):**

```bash
cd frontend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test Wheel        # Run specific test file
```

### Building for Production

**Backend:**

```bash
cd backend
npm run build     # Compiles TypeScript to dist/
npm start         # Run production build
```

**Frontend:**

```bash
cd frontend
npm run build     # Builds to dist/
npm run preview   # Preview production build
```

### Environment Variables

**Backend:**

| Variable | Default | Description         |
| -------- | ------- | ------------------- |
| `PORT`   | `3001`  | Backend server port |

**Setting port (if 3001 is in use):**

```bash
# Linux/Mac
PORT=3002 npm run dev

# Windows PowerShell
$env:PORT=3002; npm run dev
```

**Important**: If you change backend port, update `frontend/vite.config.ts` proxy target.

---

## Testing Strategy

### Backend Tests (Jest)

**Location**: `backend/src/**/*.test.ts`

**Coverage**: 87 tests

**Test Structure**:

```typescript
describe("Service Name", () => {
  describe("function name", () => {
    it("should handle specific case", () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

**Key Test Files**:

- `payout.service.test.ts` - All payout multipliers
- `validation.service.test.ts` - All bet types & edge cases
- `services/tests/game.integration.*.test.ts` - Full game flows

### Frontend Tests (Vitest)

**Location**: `frontend/src/**/*.test.ts`

**Coverage**: 112 tests across 10 test suites

**Test Structure**:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Component Name", () => {
  let component: ComponentType;

  beforeEach(() => {
    component = new ComponentType(mockScene);
  });

  it("should behave correctly", () => {
    // Test implementation
  });
});
```

**Key Test Files**:

- `api.service.*.test.ts` - API integration (14 tests)
- `BettingTable.test.ts` - Betting logic (40 tests)
- `Wheel.test.ts` - Wheel angles & logic (26 tests)
- `BettingZoneFactory.test.ts` - Bet zone calculations (7 tests)

### Test Guidelines

1. **Test behavior, not implementation**
2. **Use descriptive test names**: `it('should reject bet when balance insufficient')`
3. **Mock external dependencies**: Mock API calls, Phaser objects
4. **Test edge cases**: Zero balance, invalid bets, boundary conditions
5. **Keep tests independent**: No shared state between tests

---

## API Contracts

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### GET `/balance`

Get current player balance.

**Response:**

```json
{
  "balance": 1000
}
```

#### POST `/game/spin`

Place bets and spin the wheel.

**Request:**

```json
{
  "bets": [
    {
      "type": "straight",
      "numbers": [17],
      "amount": 10
    },
    {
      "type": "red",
      "numbers": [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
      ],
      "amount": 20
    }
  ]
}
```

**Response (Success):**

```json
{
  "success": true,
  "result": {
    "winningNumber": 17,
    "winningColor": "red",
    "totalBetAmount": 30,
    "totalWinAmount": 370,
    "netProfit": 340,
    "newBalance": 1340,
    "bets": [
      {
        "type": "straight",
        "numbers": [17],
        "amount": 10,
        "won": true,
        "payout": 360
      },
      {
        "type": "red",
        "numbers": [1,3,5,...],
        "amount": 20,
        "won": true,
        "payout": 40
      }
    ]
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Total bet amount (100) exceeds balance (50)"
  }
}
```

#### GET `/game/history?limit=10`

Get recent game history.

**Response:**

```json
{
  "history": [
    {
      "timestamp": "2025-12-01T10:30:00Z",
      "winningNumber": 17,
      "winningColor": "red",
      "totalBetAmount": 30,
      "totalWinAmount": 370,
      "netProfit": 340
    }
  ]
}
```

#### POST `/game/reset`

Reset game state (balance, history) to initial values.

**Response:**

```json
{
  "success": true,
  "balance": 1000
}
```

#### GET `/game/seed-hash`

Get server seed hash for next spin (provably fair preview).

**Response:**

```json
{
  "serverSeedHash": "a3f5c9..."
}
```

#### GET `/game/verify`

Get verification data for last spin.

**Response:**

```json
{
  "serverSeed": "...",
  "serverSeedHash": "...",
  "clientSeed": "...",
  "nonce": 5,
  "winningNumber": 17
}
```

### Error Codes

| Code                   | Description                   | HTTP Status |
| ---------------------- | ----------------------------- | ----------- |
| `INSUFFICIENT_BALANCE` | Total bet > available balance | 400         |
| `INVALID_BET`          | Bet structure invalid         | 400         |
| `INVALID_BET_TYPE`     | Unknown bet type              | 400         |
| `SERVER_ERROR`         | Internal server error         | 500         |

---

## Key Files Reference

### Backend

#### `backend/src/index.ts`

Server entry point. Starts Express server on specified port.

**Responsibility**: Server initialization only.

#### `backend/src/app.ts`

Express application configuration.

**Responsibilities**:

- Middleware setup (CORS, JSON parsing)
- Route registration
- Error handling
- Request logging

#### `backend/src/services/game.service.ts`

**Core game orchestrator.**

**Responsibilities**:

- Balance management (`getBalance`, `resetGame`)
- Game history tracking
- Spin execution (`executeSpin`)
- Coordinates validation, RNG, and payout services

**State**: Maintains in-memory `balance`, `gameHistory`, `lastSpinData`.

**Key Functions**:

- `executeSpin(bets)` - Validates, spins, calculates payouts, updates balance
- `getBalance()` - Returns current balance
- `getHistory(limit)` - Returns recent game history
- `resetGame()` - Resets to initial state

#### `backend/src/services/rng.service.ts`

**Provably fair random number generator.**

**Algorithm**: HMAC-SHA256 with modulo bias correction

**Formula**:

```
hash = HMAC_SHA256(serverSeed, clientSeed + ":" + nonce)
result = parseInt(hash.substring(0, 8), 16) % 37
```

**Key Functions**:

- `spin()` - Generates winning number (0-36)
- `getServerSeedHash()` - Returns SHA-256 hash of server seed (for preview)
- `reset()` - Generates new server seed

#### `backend/src/services/validation.service.ts`

**Bet validation orchestrator.**

**Responsibilities**:

- Validates bet structure (type, numbers, amount)
- Checks balance sufficiency
- Delegates to specialized validators

**Key Function**:

- `validateBets(bets, balance)` - Returns `ValidationResult`

#### `backend/src/services/validators/inside-bets.validator.ts`

**Inside bet validation (geometric).**

**Bet Types**: straight, split, street, corner, line

**Strategy**: Mathematical validation instead of lookup tables.

Example (split validation):

```typescript
// Horizontal: same row, adjacent columns
if (b - a === 1 && Math.ceil(a / 3) === Math.ceil(b / 3))

// Vertical: same column, adjacent rows
if (b - a === 3)
```

#### `backend/src/services/validators/outside-bets.validator.ts`

**Outside bet validation (set comparison).**

**Bet Types**: column, dozen, red, black, odd, even, low, high

**Strategy**: Compare provided numbers against defined sets.

#### `backend/src/services/payout.service.ts`

**Payout calculation.**

**Key Functions**:

- `calculatePayouts(bets, winningNumber)` - Returns `BetResult[]`
- `calculateTotals(betResults)` - Returns `{ totalWinAmount, netProfit }`

**Formula**:

```
payout = bet.amount * multiplier + bet.amount  // (if won)
payout = 0  // (if lost)
```

#### `backend/src/constants/roulette.ts`

**Game constants and validation helpers.**

**Exports**:

- `RED_NUMBERS`, `BLACK_NUMBERS`, `GREEN_NUMBERS`
- `WHEEL_ORDER` - European wheel arrangement
- `PAYOUT_MULTIPLIERS` - Payout map for all bet types
- `COLUMNS`, `DOZENS` - Number groupings
- `INITIAL_BALANCE`, `MIN_BET`, `MAX_BET`
- Validation functions: `isValidSplit`, `isValidStreet`, `isValidCorner`, `isValidLine`

### Frontend

#### `frontend/src/main.ts`

**Application entry point.**

**Responsibility**: Creates Phaser game instance with config.

#### `frontend/src/config/game.config.ts`

**Phaser game configuration.**

**Settings**: Canvas size, renderer, scenes, physics, etc.

#### `frontend/src/scenes/GameScene.ts`

**Main game scene (orchestrator).**

**Responsibilities**:

- Creates and coordinates all components
- Manages game state (balance, isSpinning)
- Handles spin flow
- Loads initial data from API

**Key Components**:

- `Wheel` - Roulette wheel
- `BettingTable` - Betting interface
- `ChipSelector` - Chip picker
- `BalanceDisplay` - Balance UI
- `HistoryDisplay` - History UI

**Managers**:

- `UIManager` - UI state & buttons
- `EffectsManager` - Visual effects (particles, etc.)
- `BettingManager` - Bet placement logic

#### `frontend/src/components/Wheel.ts`

**Roulette wheel component.**

**Responsibilities**:

- Renders wheel graphics
- Animates spin to winning number
- Calculates rotation angles based on `WHEEL_ORDER`

**Key Method**:

- `spin(winningNumber, duration)` - Animates wheel to number

#### `frontend/src/components/BettingTable.ts`

**Betting table component.**

**Responsibilities**:

- Renders betting table layout
- Handles click detection for bet placement
- Manages chip display on table

**Sub-components**:

- `BettingZoneFactory` - Calculates clickable zones (pure logic)
- `TableRenderer` - Renders static table graphics
- `ChipRenderer` - Renders dynamic chip graphics

#### `frontend/src/components/ChipSelector.ts`

**Chip denomination selector.**

**Chip Values**: 1, 5, 10, 25, 100

**Responsibility**: UI for selecting current chip value.

#### `frontend/src/components/BalanceDisplay.ts`

**Balance display component.**

**Responsibility**: Shows current balance with formatting.

#### `frontend/src/components/HistoryDisplay.ts`

**Game history component.**

**Responsibility**: Displays recent winning numbers.

#### `frontend/src/managers/BettingManager.ts`

**Bet placement logic manager.**

**Responsibilities**:

- Manages current bets (add, clear, repeat)
- Validates bet placement against balance
- Updates UI after bet changes

**Key Methods**:

- `placeBet(bet)` - Adds bet to current bets
- `clearBets()` - Removes all bets
- `repeatLastBet()` - Places last bets again
- `getCurrentBets()` - Returns current bets
- `getTotalBetAmount()` - Returns sum of all bets

#### `frontend/src/managers/UIManager.ts`

**UI state manager.**

**Responsibilities**:

- Creates and manages buttons (SPIN, CLEAR, REPEAT)
- Updates button states (enabled/disabled)
- Shows messages to player

**Key Methods**:

- `createButtons(onSpin, onClear, onRepeat)`
- `setButtonsEnabled(enabled)`
- `showMessage(text, color)`

#### `frontend/src/managers/EffectsManager.ts`

**Visual effects manager.**

**Responsibilities**:

- Particle effects (win/lose)
- Confetti animations
- Visual feedback

**Key Methods**:

- `createParticleTextures()` - Creates particle graphics
- `showWinEffect(x, y)` - Displays win animation
- `showLoseEffect()` - Displays lose animation

#### `frontend/src/services/api.service.ts`

**Backend API communication (stateless).**

**No Phaser dependency** - Can be used in CLI, tests, etc.

**Key Functions**:

- `getBalance()` - Fetches balance
- `placeBetsAndSpin(bets)` - Sends spin request
- `getGameHistory(limit)` - Fetches history
- `resetGame()` - Resets game state

**Error Handling**: Throws on network errors or API errors.

---

## Code Conventions

### TypeScript

1. **No `any` types** in production code

   - Use `unknown` and type guards if type is truly unknown
   - Use generics for flexible but type-safe code

2. **Explicit return types** for public functions

   ```typescript
   export function calculatePayout(bet: Bet): number {
     // ...
   }
   ```

3. **Use `const` assertions** for literal types

   ```typescript
   export const RED_NUMBERS = [1, 3, 5, ...] as const;
   ```

4. **Prefer `readonly`** for arrays/objects that shouldn't mutate
   ```typescript
   export const WHEEL_ORDER: readonly number[] = [...] as const;
   ```

### Naming Conventions

| Type       | Convention       | Example                               |
| ---------- | ---------------- | ------------------------------------- |
| Files      | kebab-case       | `game.service.ts`, `betting-table.ts` |
| Classes    | PascalCase       | `GameScene`, `BettingTable`           |
| Interfaces | PascalCase       | `Bet`, `GameResult`                   |
| Functions  | camelCase        | `executeSpin`, `calculatePayout`      |
| Constants  | UPPER_SNAKE_CASE | `INITIAL_BALANCE`, `RED_NUMBERS`      |
| Types      | PascalCase       | `BetType`, `RouletteColor`            |

### File Organization

**Each file should have**:

1. File-level JSDoc comment describing purpose
2. Imports grouped by type (external, internal, types)
3. Constants before functions
4. Public functions before private
5. Clear separation of concerns

**Example**:

```typescript
/**
 * Game Service
 * Core game logic orchestration
 */

// External imports
import express from "express";

// Internal imports
import { rngService } from "./rng.service";
import { Bet, GameResult } from "../types";

// Constants
const INITIAL_BALANCE = 1000;

// Public functions
export function executeSpin(bets: Bet[]): GameResult {
  // ...
}

// Private functions
function updateBalance(amount: number): void {
  // ...
}
```

### Comments

1. **Use JSDoc** for public APIs

   ```typescript
   /**
    * Calculate payout for a winning bet
    * @param bet - The bet that won
    * @param multiplier - Payout multiplier
    * @returns Total payout including original bet
    */
   export function calculatePayout(bet: Bet, multiplier: number): number {
     return bet.amount * multiplier + bet.amount;
   }
   ```

2. **Inline comments** for complex logic only

   ```typescript
   // Modulo bias correction: reject values above threshold
   if (value > MAX_UINT32 - (MAX_UINT32 % 37)) {
     continue;
   }
   ```

3. **Don't comment obvious code**

   ```typescript
   // BAD: Increment counter
   counter++;

   // GOOD: (no comment needed)
   counter++;
   ```

### Error Handling

**Backend**:

```typescript
if (!isValid) {
  return {
    success: false,
    error: {
      code: "INVALID_BET",
      message: "Bet structure is invalid",
    },
  };
}
```

**Frontend**:

```typescript
try {
  const result = await api.placeBetsAndSpin(bets);
  // Handle success
} catch (error) {
  console.error("Spin failed:", error);
  // Show error to user
}
```

### Testing Conventions

1. **One describe block per function/method**
2. **Use `it('should ...')` format** for test names
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Mock external dependencies**
5. **Test edge cases** and error conditions

---

## Common Tasks

### Adding a New Bet Type

**Example**: Add "basket" bet (0, 1, 2, 3)

1. **Update shared types** (`shared/types.ts`):

   ```typescript
   type BetType = ... | 'basket';
   ```

2. **Add payout multiplier** (`backend/src/constants/roulette.ts`):

   ```typescript
   export const PAYOUT_MULTIPLIERS: Record<BetType, number> = {
     // ...
     basket: 8, // 8:1 payout
   };
   ```

3. **Add validation** (`backend/src/services/validators/inside-bets.validator.ts`):

   ```typescript
   case 'basket':
     return isValidBasket(bet.numbers);
   ```

4. **Add payout logic** (automatic if multiplier defined)

5. **Add frontend UI** (`frontend/src/components/BettingTable.ts`):

   - Add clickable zone
   - Add bet creation logic

6. **Write tests**:
   - Validation test
   - Payout test
   - Integration test
   - Frontend test

### Modifying Game Constants

**Location**: `backend/src/constants/roulette.ts` and `frontend/src/constants/roulette.ts`

**Example**: Change initial balance

1. Update `INITIAL_BALANCE` in backend constants
2. Update `INITIAL_BALANCE` in frontend constants (if displayed)
3. Update tests that check initial balance

### Adding a New API Endpoint

**Example**: Add GET `/stats` endpoint

1. **Define types** (`shared/types.ts`):

   ```typescript
   export interface StatsResponse {
     totalSpins: number;
     totalWagered: number;
   }
   ```

2. **Add service function** (`backend/src/services/game.service.ts`):

   ```typescript
   export function getStats(): StatsResponse {
     // Implementation
   }
   ```

3. **Add route** (`backend/src/routes/game.routes.ts`):

   ```typescript
   router.get("/stats", gameController.getStats);
   ```

4. **Add controller** (`backend/src/controllers/game.controller.ts`):

   ```typescript
   export function getStats(req: Request, res: Response): void {
     const stats = gameService.getStats();
     res.json(stats);
   }
   ```

5. **Add frontend API function** (`frontend/src/services/api.service.ts`):

   ```typescript
   export async function getStats(): Promise<StatsResponse> {
     const response = await fetch(`${API_BASE_URL}/game/stats`);
     return response.json();
   }
   ```

6. **Write tests** for all layers

### Debugging Common Issues

#### Backend won't start

- Check port availability: `lsof -i :3001` (Mac/Linux) or `netstat -ano | findstr :3001` (Windows)
- Check environment variables
- Verify dependencies installed: `npm install`

#### Frontend can't reach backend

- Verify backend is running on correct port
- Check `vite.config.ts` proxy configuration
- Check browser console for CORS errors

#### Tests failing

- Clear test cache: `npm test -- --clearCache`
- Check for async issues (missing `await`)
- Verify mocks are set up correctly

#### TypeScript errors

- Check `tsconfig.json` is correct
- Run `npm run build` to see all errors
- Ensure shared types are properly exported

---

## Important Patterns

### 1. Shared Types Pattern

**Always import from `types/` directory**, which re-exports from `shared/`:

```typescript
// CORRECT
import { Bet, GameResult } from "../types";

// WRONG - Don't import directly from shared
import { Bet } from "../../shared/types";
```

### 2. Service Function Pattern (Backend)

**Structure**:

```typescript
export function serviceFunctionName(
  params: ParamType
): ReturnType | { success: false; error: ErrorObject } {
  // Validation
  if (!isValid) {
    return {
      success: false,
      error: { code: "ERROR_CODE", message: "..." },
    };
  }

  // Business logic
  const result = doWork(params);

  // Return success
  return result; // or { success: true, result }
}
```

### 3. Component Pattern (Frontend)

**Phaser component structure**:

```typescript
export class ComponentName {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.create();
  }

  private create(): void {
    // Create visual elements
  }

  public update(delta: number): void {
    // Update logic (if needed)
  }

  public destroy(): void {
    this.container.destroy();
  }
}
```

### 4. API Call Pattern (Frontend)

**Always use try-catch with user feedback**:

```typescript
try {
  this.uiManager.showMessage("Spinning...", "#FFD700");
  const result = await placeBetsAndSpin(bets);
  this.handleWin(result);
} catch (error) {
  console.error("Spin failed:", error);
  this.uiManager.showMessage("Connection error!", "#FF0000");
  this.isSpinning = false;
}
```

### 5. Validation Pattern

**Geometric validation for inside bets**:

```typescript
// Instead of hardcoding valid combinations, use math
export function isValidSplit(numbers: number[]): boolean {
  const [a, b] = numbers.sort((x, y) => x - y);

  // Horizontal adjacency
  if (b - a === 1 && Math.ceil(a / 3) === Math.ceil(b / 3)) {
    return true;
  }

  // Vertical adjacency
  if (b - a === 3) {
    return true;
  }

  return false;
}
```

---

## Gotchas & Warnings

### 1. Port Conflicts

**Issue**: Backend won't start because port 3001 is in use.

**Solution**:

```bash
# Set different port
PORT=3002 npm run dev

# Update vite.config.ts proxy target to match new port
```

### 2. Shared Types Must Stay Synchronized

**Issue**: Changes to `shared/types.ts` affect both frontend and backend.

**Solution**:

- After changing types, run both `npm run build` in frontend and backend
- Fix any TypeScript errors before committing
- Run all tests

### 3. In-Memory State Limitations

**Issue**: Backend state (balance, history) is lost on server restart.

**This is intentional** - no persistence required for this project scope.

**For development**: Use `/game/reset` endpoint to reset state.

### 4. Phaser Context Required

**Issue**: `managers/` classes fail when used outside Phaser scene.

**Reason**: They depend on `Phaser.Scene` context.

**Solution**: Only use managers inside Phaser scenes. For logic that needs to work outside Phaser, put it in `services/`.

### 5. Modulo Bias in RNG

**Issue**: Naive `% 37` introduces bias.

**Solution**: RNG service implements bias correction:

```typescript
// Reject values above threshold to ensure uniform distribution
if (value > MAX_UINT32 - (MAX_UINT32 % 37)) {
  continue; // Generate new number
}
```

**DO NOT remove this** - it's required for provably fair gaming.

### 6. Bet Validation Order Matters

**Pattern**:

1. Validate bet structure (type, numbers, amount)
2. Validate number combinations (geometric rules)
3. Calculate total bet amount
4. Validate against balance

**DO NOT check balance first** - structural validation must come first for clear error messages.

### 7. Payout Calculation Includes Original Bet

**Formula**: `payout = amount × multiplier + amount`

**Example**:

- Bet: $10 on straight (35:1)
- Win: $10 × 35 + $10 = $360 (not $350)

**Reason**: Player gets original bet back plus winnings.

### 8. Zero (0) Wins = All Outside Bets Lose

**Rule**: Zero is GREEN and not covered by any outside bets.

**Implementation**: All outside bet validators exclude 0 from valid numbers.

### 9. Frontend/Backend API Version Must Match

**Issue**: Type changes in shared types can break runtime API contract.

**Solution**:

- Use shared types for ALL API communication
- TypeScript will catch mismatches at compile time
- Always run tests after type changes

### 10. Wheel Order is European Standard

**Order**: `0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35-3-26`

**DO NOT change** - This is the official European roulette wheel layout.

**Location**: `WHEEL_ORDER` in `constants/roulette.ts`

---

## Quick Reference

### File Modification Checklist

When modifying the codebase, consider:

- [ ] Does this change shared types? → Update `shared/types.ts`
- [ ] Does this add a new bet type? → Update validators, payouts, constants, UI
- [ ] Does this change API contract? → Update both frontend and backend
- [ ] Does this modify game logic? → Add tests
- [ ] Does this change constants? → Update both frontend and backend constants
- [ ] Does this affect balance/state? → Test insufficient balance scenarios
- [ ] Does this add UI elements? → Test responsiveness and visual feedback
- [ ] Does this modify RNG? → Ensure provably fair properties maintained

### Testing Checklist

Before committing:

- [ ] Backend tests pass: `cd backend && npm test`
- [ ] Frontend tests pass: `cd frontend && npm test`
- [ ] Backend builds: `cd backend && npm run build`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Manual test: Run dev servers and test in browser
- [ ] TypeScript strict mode passes (no errors)

### Common Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm test            # Run tests
npm run build       # Build for production

# Testing
npm test            # Run all tests
npm test -- --watch # Watch mode
npm test <name>     # Run specific test

# Debugging
npm run build       # Check for TypeScript errors
curl localhost:3001/api/balance  # Test backend endpoint
```

---

## Additional Resources

- **Technical Spec**: See `roulette-spec.md`
- **User Documentation**: See `README.md`
- **GitHub Repository**: https://github.com/NivBuskila/roulette

---

## Contributing Guidelines for AI Assistants

When working on this codebase:

1. **Read relevant files first** - Don't propose changes without understanding existing code
2. **Maintain type safety** - Never use `any` types
3. **Follow existing patterns** - Match the style and structure of existing code
4. **Write tests** - All new features and bug fixes need tests
5. **Update documentation** - Keep this file and README.md current
6. **Test thoroughly** - Run both frontend and backend tests
7. **Consider edge cases** - Think about error conditions, boundaries, invalid input
8. **Ask clarifying questions** - If requirements are ambiguous, ask before implementing

---

**Document Version**: 1.0
**Last Updated**: 2025-12-01
**Maintained By**: Project Contributors
