/**
 * Provably Fair RNG Service
 * 
 * Implements a cryptographically secure random number generator
 * that allows players to verify the fairness of each spin.
 * 
 * Algorithm:
 * 1. Server generates a random seed (serverSeed)
 * 2. Server hashes the seed and shows hash to player (commitment)
 * 3. Player can provide their own seed (clientSeed)
 * 4. Result = HMAC_SHA256(serverSeed, clientSeed + nonce) mod 37
 * 5. After spin, serverSeed is revealed for verification
 */

import * as crypto from 'crypto';

export interface RNGResult {
  winningNumber: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export class RNGService {
  private serverSeed: string;
  private serverSeedHash: string;
  private clientSeed: string;
  private nonce: number;

  constructor() {
    // Initialize with fresh seeds
    this.serverSeed = this.generateSecureRandomHex(32);
    this.serverSeedHash = this.hashSeed(this.serverSeed);
    this.clientSeed = this.generateSecureRandomHex(16);
    this.nonce = 0;
  }

  /**
   * Generate a cryptographically secure random hex string
   */
  private generateSecureRandomHex(bytes: number): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hash a seed using SHA-256
   */
  private hashSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Calculate the winning number using HMAC-SHA256
   * Implements modulo bias correction for fair distribution
   */
  private calculateOutcome(serverSeed: string, clientSeed: string, nonce: number): number {
    const message = `${clientSeed}:${nonce}`;
    const hmac = crypto.createHmac('sha256', serverSeed)
      .update(message)
      .digest('hex');

    // Use first 8 hex characters (32 bits = 4 bytes)
    // Range: 0 to 4,294,967,295
    const MAX_UINT32 = 4294967295;

    // To avoid modulo bias, we reject values that would cause uneven distribution
    // 37 numbers (0-36), so we need the largest multiple of 37 that fits in uint32
    const LIMIT = MAX_UINT32 - (MAX_UINT32 % 37);

    let cursor = 0;
    let decimalValue: number;

    // Keep trying until we get a value within the unbiased range
    do {
      if (cursor + 8 > hmac.length) {
        // Extremely rare: hash exhausted, generate new hmac with incremented data
        const extendedHmac = crypto.createHmac('sha256', serverSeed)
          .update(`${message}:${cursor}`)
          .digest('hex');
        decimalValue = parseInt(extendedHmac.substring(0, 8), 16);
      } else {
        decimalValue = parseInt(hmac.substring(cursor, cursor + 8), 16);
      }
      cursor += 8;
    } while (decimalValue > LIMIT);

    return decimalValue % 37;
  }

  /**
   * Generate the next winning number
   * Returns all data needed for verification
   */
  public spin(providedClientSeed?: string): RNGResult {
    // Allow player to provide their own client seed
    if (providedClientSeed) {
      this.clientSeed = providedClientSeed;
    }

    // Calculate result with current seeds
    const winningNumber = this.calculateOutcome(
      this.serverSeed,
      this.clientSeed,
      this.nonce
    );

    // Store current seeds for result
    const result: RNGResult = {
      winningNumber,
      serverSeed: this.serverSeed,
      serverSeedHash: this.serverSeedHash,
      clientSeed: this.clientSeed,
      nonce: this.nonce,
    };

    // SECURITY CRITICAL: Since we reveal the serverSeed in the result (to allow verification),
    // we MUST rotate the server seed immediately for the next spin.
    // If we didn't do this, the player would know the serverSeed for the next spin
    // and could predict the outcome since they also know the clientSeed and nonce.
    this.rotateServerSeed();

    return result;
  }

  /**
   * Rotate the server seed (generates new seed and hash)
   */
  public rotateServerSeed(): { newHash: string; oldSeed: string } {
    const oldSeed = this.serverSeed;
    this.serverSeed = this.generateSecureRandomHex(32);
    this.serverSeedHash = this.hashSeed(this.serverSeed);
    this.nonce = 0;

    return {
      newHash: this.serverSeedHash,
      oldSeed, // Reveal old seed for verification
    };
  }

  /**
   * Get the current server seed hash (for player to record before spin)
   */
  public getServerSeedHash(): string {
    return this.serverSeedHash;
  }

  /**
   * Get current nonce
   */
  public getNonce(): number {
    return this.nonce;
  }

  /**
   * Static method for client-side verification
   * Players can use this exact logic to verify results
   */
  public static verify(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    expectedResult: number
  ): boolean {
    const message = `${clientSeed}:${nonce}`;
    const hmac = crypto.createHmac('sha256', serverSeed)
      .update(message)
      .digest('hex');

    const MAX_UINT32 = 4294967295;
    const LIMIT = MAX_UINT32 - (MAX_UINT32 % 37);

    let cursor = 0;
    let decimalValue: number;

    do {
      if (cursor + 8 > hmac.length) {
        const extendedHmac = crypto.createHmac('sha256', serverSeed)
          .update(`${message}:${cursor}`)
          .digest('hex');
        decimalValue = parseInt(extendedHmac.substring(0, 8), 16);
      } else {
        decimalValue = parseInt(hmac.substring(cursor, cursor + 8), 16);
      }
      cursor += 8;
    } while (decimalValue > LIMIT);

    const calculatedResult = decimalValue % 37;
    return calculatedResult === expectedResult;
  }

  /**
   * Reset the RNG service (for game reset)
   */
  public reset(): void {
    this.serverSeed = this.generateSecureRandomHex(32);
    this.serverSeedHash = this.hashSeed(this.serverSeed);
    this.clientSeed = this.generateSecureRandomHex(16);
    this.nonce = 0;
  }
}

// Singleton instance
export const rngService = new RNGService();
