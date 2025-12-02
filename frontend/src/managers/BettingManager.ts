import { Bet } from '../types';
import { BettingTable } from '../components/BettingTable';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { UIManager } from './UIManager';
import { MAX_BET } from '../constants/roulette';

export class BettingManager {
    private currentBets: Map<string, Bet> = new Map();
    private lastBets: Bet[] = [];
    private bettingTable: BettingTable;
    private balanceDisplay: BalanceDisplay;
    private uiManager: UIManager;
    private getBalance: () => number;
    private isSpinning: () => boolean;

    constructor(
        bettingTable: BettingTable,
        balanceDisplay: BalanceDisplay,
        uiManager: UIManager,
        getBalance: () => number,
        isSpinning: () => boolean
    ) {
        this.bettingTable = bettingTable;
        this.balanceDisplay = balanceDisplay;
        this.uiManager = uiManager;
        this.getBalance = getBalance;
        this.isSpinning = isSpinning;
    }

    public handleBetPlaced(bet: Bet): boolean {
        if (this.isSpinning()) {
            this.uiManager.showMessage('Wait for the wheel to stop!', '#ff6b6b');
            return false;
        }

        // Create unique key for this bet type
        const betKey = `${bet.type}-${bet.numbers.join(',')}`;

        // Check if we have enough balance
        const currentTotal = this.getTotalBetAmount();
        if (currentTotal + bet.amount > this.getBalance()) {
            this.uiManager.showMessage('Insufficient balance!', '#ff6b6b');
            return false;
        }

        // Check if this single bet would exceed MAX_BET
        const existingBet = this.currentBets.get(betKey);
        const newBetTotal = (existingBet?.amount || 0) + bet.amount;
        if (newBetTotal > MAX_BET) {
            this.uiManager.showMessage(`Maximum bet per position is ${MAX_BET}!`, '#ff6b6b');
            return false;
        }

        // Add or update bet
        if (existingBet) {
            existingBet.amount += bet.amount;
        } else {
            this.currentBets.set(betKey, { ...bet });
        }

        // Update display
        this.balanceDisplay.update(this.getBalance(), this.getTotalBetAmount());
        this.uiManager.showMessage(`Bet placed: ${bet.amount} on ${this.getBetDescription(bet)}`, '#28a745');
        return true;
    }

    public clearBets(force: boolean = false): void {
        if (!force && this.isSpinning()) return;

        this.currentBets.clear();
        this.bettingTable.clearChips();
        this.balanceDisplay.update(this.getBalance(), 0);
        if (!force) {
            this.uiManager.showMessage('Bets cleared', '#ffd700');
        }
    }

    public repeatLastBet(): void {
        if (this.isSpinning()) return;

        if (this.lastBets.length === 0) {
            this.uiManager.showMessage('No previous bet to repeat!', '#ff6b6b');
            return;
        }

        // Calculate total of last bets
        const totalLastBet = this.lastBets.reduce((sum, bet) => sum + bet.amount, 0);

        if (totalLastBet > this.getBalance()) {
            this.uiManager.showMessage('Insufficient balance to repeat bet!', '#ff6b6b');
            return;
        }

        // Clear current bets first
        this.currentBets.clear();
        this.bettingTable.clearChips();

        // Restore last bets
        for (const bet of this.lastBets) {
            const betKey = `${bet.type}-${bet.numbers.join(',')}`;
            this.currentBets.set(betKey, { ...bet });

            // Place visual chips - get position from betting table
            this.bettingTable.placeChipForBet(bet);
        }

        this.balanceDisplay.update(this.getBalance(), this.getTotalBetAmount());
        this.uiManager.showMessage('Last bet repeated!', '#28a745');
    }

    public getTotalBetAmount(): number {
        let total = 0;
        this.currentBets.forEach(bet => {
            total += bet.amount;
        });
        return total;
    }

    public getBets(): Bet[] {
        return Array.from(this.currentBets.values());
    }

    public saveLastBets(): void {
        this.lastBets = this.getBets();
    }

    public hasBets(): boolean {
        return this.currentBets.size > 0;
    }

    private getBetDescription(bet: Bet): string {
        switch (bet.type) {
            case 'straight': return `#${bet.numbers[0]}`;
            case 'split': return `Split ${bet.numbers.join('/')}`;
            case 'street': return `Street ${bet.numbers[0]}-${bet.numbers[2]}`;
            case 'corner': return `Corner`;
            case 'line': return `Line ${bet.numbers[0]}-${bet.numbers[5]}`;
            case 'column': return `Column`;
            case 'dozen':
                if (bet.numbers[0] === 1) return '1st Dozen';
                if (bet.numbers[0] === 13) return '2nd Dozen';
                return '3rd Dozen';
            case 'red': return 'Red';
            case 'black': return 'Black';
            case 'odd': return 'Odd';
            case 'even': return 'Even';
            case 'low': return '1-18';
            case 'high': return '19-36';
            default: return bet.type;
        }
    }
}
