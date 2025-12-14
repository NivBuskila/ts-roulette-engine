# Roulette Technical Specification

This document provides detailed technical specifications for implementing the roulette game.

---

## Table of Contents

1. [Game Rules](#game-rules)
2. [Bet Types & Payouts](#bet-types--payouts)
3. [API Specification](#api-specification)
4. [Data Models](#data-models)
5. [Frontend Architecture](#frontend-architecture)
6. [RNG Requirements](#rng-requirements)

---

## Game Rules

### European Roulette

- **Numbers:** 0-36 (37 total numbers)
- **Layout:** Single zero (0 is green, 1-36 alternating red/black)
- **Wheel Order:** 0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35-3-26

### Number Colors

| Color | Numbers |
|-------|---------|
| **Green** | 0 |
| **Red** | 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 |
| **Black** | 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35 |

### Game Flow

1. Player places bet(s) with specified amount(s)
2. Backend validates bets against balance
3. Backend generates winning number using RNG
4. Backend calculates payouts for winning bets
5. Backend updates balance
6. Frontend receives result and animates wheel to winning number
7. Frontend displays wins/losses

---

## Bet Types & Payouts

### Inside Bets

| Bet Type | Description | Numbers Covered | Payout | Example |
|----------|-------------|-----------------|--------|---------|
| **Straight Up** | Single number | 1 | 35:1 | Bet on "17" |
| **Split** | Two adjacent numbers | 2 | 17:1 | Bet on "17/18" |
| **Street** | Three numbers in a row | 3 | 11:1 | Bet on "13/14/15" |
| **Corner** | Four numbers forming a square | 4 | 8:1 | Bet on "13/14/16/17" |
| **Line** | Two adjacent streets | 6 | 5:1 | Bet on "13/14/15/16/17/18" |

### Outside Bets

| Bet Type | Description | Numbers Covered | Payout | Example |
|----------|-------------|-----------------|--------|---------|
| **Column** | Entire column (12 numbers) | 12 | 2:1 | Column 1: 1,4,7,10,13,16,19,22,25,28,31,34 |
| **Dozen** | First, second, or third dozen | 12 | 2:1 | 1st: 1-12, 2nd: 13-24, 3rd: 25-36 |
| **Red/Black** | All red or all black numbers | 18 | 1:1 | All red or all black |
| **Odd/Even** | All odd or all even numbers | 18 | 1:1 | Excludes 0 |
| **High/Low** | 1-18 (Low) or 19-36 (High) | 18 | 1:1 | Low: 1-18, High: 19-36 |

### Detailed Number Mapping

**Columns:**
- Column 1: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
- Column 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
- Column 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36

**Dozens:**
- 1st Dozen: 1-12
- 2nd Dozen: 13-24
- 3rd Dozen: 25-36

**Note:** Zero (0) is NOT covered by any outside bets. If 0 wins, all outside bets lose.

---

## API Specification

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### 1. Get Balance

```http
GET /balance
```

**Response:**
```json
{
  "balance": 1000
}
```

---

#### 2. Place Bet & Spin

```http
POST /game/spin
```

**Request Body:**
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
      "numbers": [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
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
        "payout": 350
      },
      {
        "type": "red",
        "numbers": [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
        "amount": 20,
        "won": true,
        "payout": 20
      }
    ]
  }
}
```

**Response (Insufficient Balance):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Total bet amount (100) exceeds balance (50)"
  }
}
```

**Response (Invalid Bet):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_BET",
    "message": "Bet amount must be positive"
  }
}
```

---

#### 3. Get Game History

```http
GET /game/history?limit=10
```

**Response:**
```json
{
  "history": [
    {
      "timestamp": "2025-11-24T10:30:00Z",
      "winningNumber": 17,
      "winningColor": "red",
      "totalBetAmount": 30,
      "totalWinAmount": 370,
      "netProfit": 340
    },
    {
      "timestamp": "2025-11-24T10:28:00Z",
      "winningNumber": 0,
      "winningColor": "green",
      "totalBetAmount": 50,
      "totalWinAmount": 0,
      "netProfit": -50
    }
  ]
}
```

---

#### 4. Reset Game (Optional - for testing)

```http
POST /game/reset
```

**Response:**
```json
{
  "success": true,
  "balance": 1000
}
```

---

### Error Handling

All error responses should follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Standard Error Codes:**
- `INSUFFICIENT_BALANCE` - Total bet exceeds available balance
- `INVALID_BET` - Bet structure is invalid (negative amount, empty numbers, etc.)
- `INVALID_BET_TYPE` - Unknown bet type
- `SERVER_ERROR` - Internal server error

**HTTP Status Codes:**
- `200` - Success
- `400` - Invalid request (bad bet structure, insufficient balance)
- `500` - Server error

---

## Data Models

### TypeScript Interfaces

#### Bet Interface

```typescript
interface Bet {
  type: BetType;
  numbers: number[];  // Array of numbers covered by this bet
  amount: number;     // Bet amount in currency units
}

type BetType =
  | 'straight'  // Single number
  | 'split'     // Two adjacent numbers
  | 'street'    // Three numbers in a row
  | 'corner'    // Four numbers in a square
  | 'line'      // Six numbers (two streets)
  | 'column'    // Column (12 numbers)
  | 'dozen'     // Dozen (12 numbers)
  | 'red'       // All red numbers
  | 'black'     // All black numbers
  | 'odd'       // All odd numbers
  | 'even'      // All even numbers
  | 'low'       // 1-18
  | 'high';     // 19-36
```

#### Bet Result Interface

```typescript
interface BetResult extends Bet {
  won: boolean;       // Did this bet win?
  payout: number;     // Amount won (includes original bet if won)
}
```

#### Game Result Interface

```typescript
interface GameResult {
  winningNumber: number;      // 0-36
  winningColor: 'red' | 'black' | 'green';
  totalBetAmount: number;     // Sum of all bet amounts
  totalWinAmount: number;     // Sum of all payouts
  netProfit: number;          // totalWinAmount - totalBetAmount
  newBalance: number;         // Updated balance after spin
  bets: BetResult[];          // Results for each bet placed
}
```

#### Game History Entry

```typescript
interface GameHistoryEntry {
  timestamp: string;          // ISO 8601 format
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
  totalBetAmount: number;
  totalWinAmount: number;
  netProfit: number;
}
```

#### API Response Wrappers

```typescript
interface SuccessResponse<T> {
  success: true;
  result: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

---

## System Architecture

```
┌──────────────────────────────────────────────┐
│              FRONTEND                        │
│         (Phaser 3 + TypeScript)              │
├──────────────────────────────────────────────┤
│                                              │
│  Responsibilities:                           │
│  • Render roulette wheel & betting table     │
│  • Handle chip placement UI                  │
│  • Animate wheel to winning number           │
│  • Display balance and results               │
│  • Make HTTP calls to backend                │
│                                              │
└──────────────┬───────────────────────────────┘
               │
               │ HTTP/REST
               │ POST /api/game/spin
               │ GET /api/balance
               │ GET /api/game/history
               │
┌──────────────▼───────────────────────────────┐
│              BACKEND                         │
│        (Node.js + TypeScript)                │
├──────────────────────────────────────────────┤
│                                              │
│  Responsibilities:                           │
│  • Validate bets (amount, type, balance)     │
│  • Generate winning number (RNG)             │
│  • Calculate payouts for all bet types       │
│  • Manage player balance                     │
│  • Store game history                        │
│  • Return game results to frontend           │
│                                              │
└──────────────────────────────────────────────┘
```

**Key Principle:** All game logic happens on the backend. The frontend is purely for rendering and user interaction.

---

## Frontend Architecture

**Wheel Number Order (clockwise from top):**
```
0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35-3-26
```

**Rotation Calculation:**
Each number occupies 360/37 ≈ 9.73 degrees. The wheel must land on the winning number returned from the backend.

---

## RNG Requirements

### Provably Fair System

The backend should use a **seeded random number generator** that can be verified. Here's a simple implementation approach:

```typescript
import crypto from 'crypto';

interface SpinResult {
  serverSeed: string;      // Secret seed (hashed before revealing)
  clientSeed: string;      // Can be provided by client or generated
  nonce: number;           // Increments with each spin
  winningNumber: number;   // 0-36
}

function generateWinningNumber(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  // Combine seeds and nonce
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;

  // Create hash
  const hash = crypto.createHash('sha256').update(combined).digest('hex');

  // Convert first 8 characters to number
  const hexValue = parseInt(hash.substring(0, 8), 16);

  // Map to 0-36 range
  return hexValue % 37;
}
```

**Why this matters:**
- Players can verify results weren't manipulated
- Shows understanding of fair gaming practices
- Industry standard for crypto/provably fair games

**Implementation:**
This project implements the provably fair system described above using HMAC-SHA256 to ensure transparency and fairness.
**Security Note:** The server seed is automatically rotated (regenerated) after every spin where it is revealed. This ensures that even though the player can verify the past spin using the revealed seed, they cannot use it to predict the next spin's outcome.


---

## Quick Reference: Payout Multipliers

| Bet Type | Multiplier | Formula |
|----------|------------|---------|
| Straight | 35:1 | Bet × 35 + Bet |
| Split | 17:1 | Bet × 17 + Bet |
| Street | 11:1 | Bet × 11 + Bet |
| Corner | 8:1 | Bet × 8 + Bet |
| Line | 5:1 | Bet × 5 + Bet |
| Column | 2:1 | Bet × 2 + Bet |
| Dozen | 2:1 | Bet × 2 + Bet |
| Even Money | 1:1 | Bet × 1 + Bet |

**Note:** "Even money" bets include: Red/Black, Odd/Even, High/Low

**Payout Calculation:**
- If bet **wins**: Return `betAmount × multiplier + betAmount` (original bet + winnings)
- If bet **loses**: Return `0`

---

**End of Technical Specification**
