class Player {
    constructor(name, color, jobTitle) {
        this.name = name;
        this.color = color;
        this.jobTitle = jobTitle;
        this.position = 0;
        this.cash = jobTitle[2]; // Starting savings
        this.charityTurns = 0;
        this.childExpense = 0;
        this.children = 0;
        this.totalIncome = 0;
        this.totalExpenses = 0;
        this.payday = 0;
        this.assetIncome = 0;
        this.passiveIncome = 0;
        this.loans = 0;
        this.loanPayment = 0;
        this.boatLoan = 0;
        this.boatPayment = 0;
        this.downsizedTurns = 0;
        this.stockAssets = [];
        this.realEstateAssets = [];
        this.businessAssets = [];
        this.coinAssets = [];
        this.personalAssets = [];
        this.fastTrack = false;
        this.fastTrackOption = false;
        this.cashFlowDay = 0;
        this.insurance = 0;
        this.hasInsurance = false;
        this.fastTrackAssets = [];
        this.loanApproval = true;
        this.mortgagePrepay = false;
    }

    get totalAssets() {
        return {
            stocks: this.stockAssets,
            realEstate: this.realEstateAssets,
            business: this.businessAssets,
            coins: this.coinAssets,
            personal: this.personalAssets
        };
    }

    addAsset(asset) {
        switch(asset.type) {
            case 'stock':
                this.stockAssets.push(asset);
                break;
            case 'realEstate':
                this.realEstateAssets.push(asset);
                break;
            case 'business':
                this.businessAssets.push(asset);
                break;
            case 'coin':
                this.coinAssets.push(asset);
                break;
            case 'personal':
                this.personalAssets.push(asset);
                break;
        }
    }

    removeAsset(assetId, assetType) {
        const assetArray = this[`${assetType}Assets`];
        const index = assetArray.findIndex(asset => asset.id === assetId);
        if (index !== -1) {
            assetArray.splice(index, 1);
        }
    }

    updateIncome() {
        // Calculate total income from all sources
        this.totalIncome = this.jobTitle[1] + // Salary
            this.assetIncome + // Asset income
            this.calculateStockDividends(); // Stock dividends
    }

    calculateStockDividends() {
        return this.stockAssets.reduce((total, stock) => {
            if (stock.type === "Preferred Stock" || stock.type === "Certificate of Deposit") {
                return total + (stock.shares * stock.dividend);
            }
            return total;
        }, 0);
    }

    updateExpenses() {
        this.totalExpenses = 
            this.jobTitle[3] + // Taxes
            this.jobTitle[4] + // Mortgage
            this.jobTitle[5] + // Car
            this.jobTitle[6] + // Credit
            this.jobTitle[7] + // Retail
            this.jobTitle[8] + // Other
            this.childExpense +
            this.loanPayment +
            this.boatPayment +
            this.insurance;
    }

    updatePayday() {
        this.updateIncome();
        this.updateExpenses();
        this.payday = this.totalIncome - this.totalExpenses;
    }
}

export default Player; 