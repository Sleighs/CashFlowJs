var OPTIONS = {
    playerNumber: document.getElementById("player-number"),
    slider: document.getElementById("start-savings-slide"),
    output: document.getElementById("start-savings-option-value"),
    checkbox: document.querySelectorAll("input[type=checkbox]"),
    smallRE: document.getElementById("ao-small-real-estate"),
    bigRE: document.getElementById("ao-big-real-estate"),
    stocks: document.getElementById("ao-stocks"),
	preferredStocks: document.getElementById("ao-preferred-stocks"),
    mutuals: document.getElementById("ao-mutuals"),
    cds: document.getElementById("ao-cds"),
    coins: document.getElementById("ao-coins"),
    limitedPartnership: document.getElementById("ao-limited-partnership"),
    companies: document.getElementById("ao-companies"),
    startingSavings: document.getElementById("start-savings-slide"),
    kids: document.getElementById("oo-kids"),
    paycheckDoodads: document.getElementById("oo-paycheck-doodads"),
    playerLoans: document.getElementById("oo-player-loans"),
    chooseJob: document.getElementById("oo-choose-job"),
    oneDealDeck: document.getElementById("oo-one-deal-deck"),
    mortgagePrepay: document.getElementById("oo-mortgage-prepay"),
	instantFastTrack: document.getElementById("oo-instant-ft"),
	oneCentAway: document.getElementById("oo-one-cent-away"),
	noLoans: document.getElementById("oo-no-loans"),
    checkState: function() {
        if (this.smallRE.checked == true && this.bigRE.checked == true && this.stocks.checked == true && this.mutuals.checked == true && this.preferredStocks.checked == true && this.cds.checked == true && this.coins.checked == true && this.limitedPartnership.checked == true && this.companies.checked == true && this.startingSavings.value == 1 && this.kids.checked == false && this.paycheckDoodads.checked == false && this.instantFastTrack.checked == false && this.oneCentAway.checked == false && this.noLoans.checked == false) {
            $("#default-game-indicator").css("color", "#FDD835");
            $("#custom-game-indicator").css("color", "#4E342E");
        } else {
            $("#default-game-indicator").css("color", "#4E342E");
            $("#custom-game-indicator").css("color", "#FDD835");
        }
    },
    defaultOptions: function() {
        this.smallRE.checked = true;
        this.bigRE.checked = true;
        this.stocks.checked = true;
        this.mutuals.checked = true;
		this.preferredStocks.checked = true;
        this.cds.checked = true;
        this.coins.checked = true;
        this.limitedPartnership.checked = true;
        this.companies.checked = true;
        this.startingSavings.value = 1;
        this.kids.checked = false;
        this.paycheckDoodads.checked = false;
        this.playerLoans.checked = false;
        this.oneDealDeck.checked = false;
        this.paycheckDoodads.checked = false;
        this.mortgagePrepay.checked = false;
		this.instantFastTrack.checked = false;
		this.oneCentAway.checked = false;
		this.noLoans.checked = false;

        OPTIONS.checkState();
    },
    setup: function() {
        // if an asset is unchecked delete
        if (this.smallRE.checked == false) {
            // remove deals from cards object
            for (var i = 1; i <= 13; i++) {
                var deal = "realEstateS" + String(i);
                delete APP.cards.smallDeal[deal];
            }
            delete APP.cards.smallDeal.propertyDamage;

            // delete related offers
            delete APP.cards.offer.offer35;

        }
        if (this.bigRE.checked == false) {
            for (var i = 1; i <= 33; i++) {
                var deal = "realEstateB" + String(i);
                delete APP.cards.bigDeal[deal];
            }
            delete APP.cards.bigDeal.propertyDamage1;
            delete APP.cards.bigDeal.propertyDamage2;

            delete APP.cards.offer.offer2;
            delete APP.cards.offer.offer3;
            delete APP.cards.offer.offer4;
            delete APP.cards.offer.offer7;
            delete APP.cards.offer.offer9;
            delete APP.cards.offer.offer15;
            delete APP.cards.offer.offer17;
            delete APP.cards.offer.offer18;
            delete APP.cards.offer.offer20;
            delete APP.cards.offer.offer21;
            delete APP.cards.offer.offer23;
            delete APP.cards.offer.offer27;
            delete APP.cards.offer.offer34;
            delete APP.cards.offer.offer36;
            delete APP.cards.offer.offer40;
            delete APP.cards.offer.offer41;
        }
        if (this.stocks.checked == false) {
            delete APP.cards.smallDeal.stockSplit1;
            delete APP.cards.smallDeal.stockSplit2;
            delete APP.cards.smallDeal.stockSplit3;
            delete APP.cards.smallDeal.stockSplit4;
            delete APP.cards.smallDeal.stock001;
            delete APP.cards.smallDeal.stock002;
            delete APP.cards.smallDeal.stock003;
            delete APP.cards.smallDeal.stock004;
            delete APP.cards.smallDeal.stock005;
            delete APP.cards.smallDeal.stock006;
            delete APP.cards.smallDeal.stock007;
            delete APP.cards.smallDeal.stock008;
            delete APP.cards.smallDeal.stock101;
            delete APP.cards.smallDeal.stock102;
            delete APP.cards.smallDeal.stock103;
            delete APP.cards.smallDeal.stock104;
            delete APP.cards.smallDeal.stock105;
            delete APP.cards.smallDeal.stock106;
            delete APP.cards.smallDeal.stock107;
            delete APP.cards.smallDeal.stock108;
            delete APP.cards.smallDeal.stock201;
            delete APP.cards.smallDeal.stock202;
            delete APP.cards.smallDeal.stock203;
            delete APP.cards.smallDeal.stock204;
            delete APP.cards.smallDeal.stock205;
            delete APP.cards.smallDeal.stock206;
            delete APP.cards.smallDeal.stock207;
            delete APP.cards.smallDeal.stock208;
        }
        if (this.mutuals.checked == false) {
            delete APP.cards.smallDeal.mutual01;
            delete APP.cards.smallDeal.mutual02;
            delete APP.cards.smallDeal.mutual03;
            delete APP.cards.smallDeal.mutual04;
            delete APP.cards.smallDeal.mutual05;
        }
        if (this.preferredStocks.checked == false) {
			 delete APP.cards.smallDeal.preferredStock1;
            delete APP.cards.smallDeal.preferredStock2;
		}
		if (this.cds.checked == false) {
            delete APP.cards.smallDeal.cd1;
            delete APP.cards.smallDeal.cd2;
        }
        if (this.coins.checked == false) {
            delete APP.cards.smallDeal.coin1;
            delete APP.cards.smallDeal.coin2;

            delete APP.cards.offer.offer43;
            delete APP.cards.offer.offer44;
        }
        if (this.limitedPartnership.checked == false) {
            delete APP.cards.bigDeal.limitedPartnershipB1;
            delete APP.cards.bigDeal.limitedPartnershipB2;
            delete APP.cards.bigDeal.limitedPartnershipB3;
            delete APP.cards.bigDeal.limitedPartnershipB4;

            delete APP.cards.offer.offer29;
            delete APP.cards.offer.offer30;
            delete APP.cards.offer.offer31;
        }
        if (this.companies.checked == false) {
            delete APP.cards.smallDeal.companyS1;
            delete APP.cards.smallDeal.companyS2;
            delete APP.cards.bigDeal.automatedBusinessB1;
            delete APP.cards.bigDeal.automatedBusinessB2;
            delete APP.cards.bigDeal.automatedBusinessB3;
            delete APP.cards.offer.offer32;
            delete APP.cards.offer.offer33;
            delete APP.cards.offer.offer38;
            delete APP.cards.offer.offer42;
        }
		
		//loop through all players to apply game settings
        for (var j = 0; j < APP.players.length; j++) {
            var player = APP.players[j];

            //set starting savings
            if (this.startingSavings.value == 0) {
                player.cash = 0;
            } else if (this.startingSavings.value == 1) {
                player.cash = player.jobTitle[2];
            } else if (this.startingSavings.value == 2) {
                player.cash = player.jobTitle[1];
            } else if (this.startingSavings.value == 3) {
                player.cash = player.jobTitle[1] * 2;
            }

            //set kid limit on or off
            if (this.kids.checked == true) {
                player.kidLimit = false;
            } else {
                player.kidLimit = true;
            }
			
			// mortgage prepay
			if (this.mortgagePrepay.checked == true) {
				player.mortgagePrepay = true;
			}
		
			// instant fast track		
			if (this.instantFastTrack.checked == true) {		
				player.fastTrackOption = true;

				$("#roll-btn").hide();
			}
			
			// one cent away
			if (this.oneCentAway.checked == true) {		
				player.cash = 999999;
			}
			
			//start with no loans
			if (this.noLoans.checked == true) {
				//set loans to 0
				player.jobTitle[9] = 0;
				player.jobTitle[10] = 0;
				player.jobTitle[11] = 0;
				player.jobTitle[12] = 0;
				
				//set payments to 0
				player.jobTitle[4] = 0;
				player.jobTitle[5] = 0;
				player.jobTitle[6] = 0;
				player.jobTitle[7] = 0;
			}
        }

        // Insurance option
        for (var k = 1; k <= APP.pCount; k++) {
            var playerArrPos = k - 1;
            var player = APP.players[playerArrPos];
            var playerCheck = String("po-insurance-p" + k);
            var check = document.getElementById(playerCheck);

            if (check.checked == true) {
                player.hasInsurance = true;

                APP.finance.getInsurance(playerArrPos);
            }
        }
	},
    fastTrackStart: function() {

    }
};