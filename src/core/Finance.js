class Finance {
    constructor(game) {
        this.game = game;
        this.loanAmount = 1000;
        this.mortgagePrepay = false;
    }

    calculateTaxes(player) {
        // Based on 2019 United States federal income tax brackets
        const income = player.totalIncome;
        let taxes;

        if (income > 41667) {
            taxes = income * 0.37;
        } else if (income > 16667) {
            taxes = income * 0.35;
        } else if (income > 13084) {
            taxes = income * 0.32;
        } else if (income > 6875) {
            taxes = income * 0.24;
        } else {
            taxes = income * 0.22;
        }

        player.jobTitle[3] = Math.round(taxes);
        return Math.round(taxes);
    }

    calculateInsurance(player) {
        const income = player.totalIncome;
        const baseRate = 0.08;
        const dependentRate = 0.01;
        
        if (player.children > 0) {
            player.insurance = Math.round(income * (baseRate + (dependentRate * player.children)));
        } else {
            player.insurance = Math.round(income * baseRate);
        }
        
        return player.insurance;
    }

    calculateLoanPayment(player) {
        player.loanPayment = player.loans * 0.1;
        return player.loanPayment;
    }

    calculateLoanAmount(cost, playerCash) {
        const val = cost - playerCash;
        if (val < 1000) {
            this.loanAmount = 1000;
        } else {
            this.loanAmount = Math.ceil(val/1000) * 1000;
        }
        return this.loanAmount;
    }

    takeOutLoan(player, amount) {
        player.loans += amount;
        player.cash += amount;
        this.calculateLoanPayment(player);
    }

    repayLoan(player, amount, loanType) {
        if (player.cash < amount) {
            return false;
        }

        player.cash -= amount;

        switch(loanType) {
            case 'mortgage':
                player.jobTitle[9] -= amount;
                if (player.jobTitle[9] <= 0) {
                    player.jobTitle[4] = 0;
                    player.jobTitle[9] = 0;
                }
                break;
            case 'boat':
                player.boatLoan -= amount;
                if (player.boatLoan <= 0) {
                    player.boatLoan = 0;
                    player.boatPayment = 0;
                }
                break;
            default:
                player.loans -= amount;
                break;
        }

        this.calculateLoanPayment(player);
        return true;
    }

    buyAsset(player, asset) {
        if (player.cash < asset.downPayment) {
            return false;
        }

        player.cash -= asset.downPayment;
        player.addAsset(asset);
        return true;
    }

    sellAsset(player, assetId, assetType, settlement) {
        const asset = player[`${assetType}Assets`].find(a => a.id === assetId);
        if (!asset) {
            return false;
        }

        player.cash += settlement;
        player.assetIncome -= asset.cashFlow;
        player.removeAsset(assetId, assetType);
        return true;
    }

    handlePaycheck(player) {
        player.updatePayday();
        player.cash += player.payday;
    }

    checkBankruptcy(player) {
        if (player.payday < 0 && player.cash < 0) {
            player.debt = true;
            return true;
        }
        return false;
    }
}

export default Finance; 