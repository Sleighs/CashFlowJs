// Game Phases
//   Phase 1 - select dream/path
//		each dream will have an interest perk that can earn and save money at times in the game
//		
//   Phase 2 - race
//      starting out - 0 assets, pay off liabilities, buy low sell high
//      middle/the race - 1st big acquisition
//      end game - paid off liabilities and looking for a big deal
//   Phase 3 - acuire dream
//      fast track
//      cash flow day - start with 100 times passive income at end of rat race
//      new income = cashflow day income + 50k
//      rules = roll 2 die*, cannot borrow money from bank

var APP = APP || {
    players: [],
    pCount: 1,
    turnCount: 1,
    currentPlayer: 1,
    currentPlayerArrPos: function () {
        return APP.currentPlayer - 1;
    },
    previousPlayer: function () {
        var prevPlayer;

        if (this.currentPlayer === 1) {
            prevPlayer = this.pCount;
        } else {
            prevPlayer = APP.currentPlayerArrPos();
        }

        return prevPlayer;
    },
    name: function (playerNumber) {
        var player = "player" + parseInt(playerNumber, 10) + "name";
        var name = document.getElementById(player).value;
        return name;
    },
    initGame: function () {
        $("#home-screen").click(function () {
            APP.display.hideHomeScreen();
            APP.display.showGameSelectionScreen();
            window.setTimeout(function () {
                if ($("#game-selection-screen").css('display') != 'none' && $("#turn-info").css('display') != 'inline-block') {
                    window.location.reload(false);
                }
            }, 120000);
        });
        $("#new-room-button").click(function () {
            APP.display.hideGameSelectionScreen();
            APP.display.showGameSetupScreen();
        });
        $("#start-game").click(function () {
            APP.display.hideSetup();
            APP.display.renderBoard();
        });
    },
    setup: function () {
		// create players
        var pn = document.getElementById("player-number");
        APP.pCount = pn.options[pn.selectedIndex].value;
		APP.remainingPlayers = this.pCount;
        
        for (var i = 1; i <= APP.pCount; i++) {
            // choose selected scenario
			var jobId = "job-input-player" + parseInt(i, 10);
			var pj = document.getElementById(jobId);
			if (pj.options[pj.selectedIndex].value == 'Random Job'){
				var playerScenario = Math.floor(
				// doesn't include ceo job in random
					Math.random() * (APP.scenarioChoices.length - 1)
				);
			} else {
				var playerScenario = pj.selectedIndex - 1;
			}
			
            // add each player and job to the players array
            var playerObj = new APP.scenario(APP.scenarioChoices[playerScenario]);
			
            playerObj.name = APP.name(i);
            APP.players.push(playerObj);

            // send list of players to board
            var tableId = document.getElementById("player-list-table");
            tableId.insertAdjacentHTML(
                "beforeend",
                "<div class='table-row-player' id='table-row-player" +
                parseInt(i, 10) +
                "'> " +
                playerObj.name +
                " </div>"
            );
        }
		
        // highlight first player
        var curPlayerRowId = document.getElementById(
            "table-row-player" + parseInt(APP.currentPlayer, 10)
        );
        curPlayerRowId.style.border = "3pt groove #FDD835";

		// set game variables
			// included assets
			// starting cash
		OPTIONS.setup();
		
        // start dream phase (phase 1)
        APP.dreamPhase.openDreamPhase();
        APP.dreamPhase.dreamPhaseOn = true;
		
		// show game menu
        $("#game-menu").show();

        APP.display.clearBtns();
        APP.display.clearCards();
        APP.clearAmounts();

        $("#end-turn-btn").hide();
        $("#ft-end-turn-btn").hide();

        $("#opp-card-btns").hide();
        $("#buy-opp-button").hide();
        $("#doodad-pay-button").hide();
        $("#ds-pay-button").hide();
        $("#pd-pay-button").hide();
        $("#charity-donate-btn").hide();
        $("#done-btn").hide();
        $("#pass-button").hide();
        $("#roll2-btn").hide();
        $("#ft-roll2-btn").hide();
        $("#confirm-pay-btn").hide();
        $("#exp-child-row").hide();
        $("#ft-turn-instructions").hide();
        $("#ft-roll-btn").hide();
		$("#ft-dream-roll-btn").hide();
		$("#ft-doodad-roll-btn").hide();
        $("#ft-enter-btn").hide();

        $("#finish-instructions").hide();
    },
    rollDie: function (dieCount) {
        var die = Math.floor(Math.random() * 6) + 1;
		
        return die * dieCount;
    },
    movePlayer: function (dieCount) {
        // move player piece the amount of rolledDie
        var player = APP.currentPlayerArrPos();
        var pObj = APP.players[player];
        var previousPosition = pObj.position;
        var dice = this.rollDie(dieCount);
		
		// show rolled dice info
		$("#roll-info-container").show();
		$("#roll-info").text("Dice: " + String(dice));

        var token = APP.display.tokens[player];

        // remove old piece
        var playerTokenEle = document.getElementById(
            "player" + parseInt(APP.currentPlayer, 10) + "-piece"
        );
		
        playerTokenEle.remove();
        //update board position
        this.updatePosition(dice);
        // Add token to new section
        var token = APP.display.tokens[player].ele;
        var currentPosition = pObj.position;
        var newSquare = document.getElementById(
            "tokenSection" + parseInt(currentPosition, 10)
        );
        $(token).appendTo(newSquare);

        // when player lands on square load card
        APP.loadCard(currentPosition);

        // if pass paycheck get payday - currently set to salary
        if (previousPosition < 5 && currentPosition >= 5) {
            pObj.cash += pObj.payday;
        } else if (previousPosition < 13 && currentPosition >= 13) {
            pObj.cash += pObj.payday;
        } else if (previousPosition < 21 && currentPosition + dice >= 21) {
            pObj.cash += pObj.payday;
        }

        APP.finance.statement();
    },
    updatePosition: function (dice) {
        var p = APP.players[APP.currentPlayerArrPos()];

        if (p.position + dice <= 23) {
            p.position += dice;
        } else {
            var x = p.position + dice;
            x -= 23;
            p.position = x;
        }
    },
    nextTurn: function () {
        var player = APP.players[this.currentPlayerArrPos()];
        $("#finish-instructions").hide();
        $("#finish-turn-container").hide();
        $("#ft-end-turn-btn").hide();
        $("#fast-track-intro-card").hide();
        $("#fast-track-option-card").hide();
		$("#roll-info-container").hide();

        APP.display.clearBtns();
        APP.display.clearCards();
        APP.clearAmounts();
		
		//remove card highlight
		$("#turn-info").css("border", "2pt solid transparent");
		$("#turn-info").css("box-shadow", "0 0 2px #212121");
		$(".card-title").css("text-shadow", ".2px .2px .2px #7DCEA0");
		$(".card-title").css("color", "#4E342E");

        //hide prev assets and show current assets
        if (player.stockAssets.length >= 0) {
            var stockRowClass =
                ".stock-shares" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(stockRowClass).hide();
        }
        if (player.realEstateAssets.length >= 0) {
            var rowClass =
                ".real-estate-asset" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(rowClass).hide();
        }
        if (player.coinAssets.length >= 0) {
            var coinRowClass =
                ".coin-asset" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(coinRowClass).hide();
        }

        
        if (player.fastTrack == false) {
			if (APP.dreamPhase.dreamPhaseOn == false) {
				$("#card-btns").show();
				$("#roll-btn").show();
			} else {
				$("#roll-btn").hide();
			}
            $("#turn-instructions").show();
            
            $("#roll2-btn").hide();
			$("#ftic-ok-btn").hide();
			
			$("#asset-table").show();
			$("#liability-table").show();
			$("#ft-statement").hide();
			
             if (player.fastTrackOption == true) {
                $("#ft-enter-btn").show();
            } else {
                $("#ft-enter-btn").hide();
            }
        } else {
            $("#ft-turn-instructions").show();
            $("#ft-roll-btn").show();
            $("#ft-roll2-btn").hide();
            $("#ft-enter-btn").hide();
			
            // fast track statement
			$("#asset-table").hide();
			$("#liability-table").hide();
			$("#ft-statement").show();
        }
		
		if (APP.dreamPhase.dreamPhaseOn == true) {
			$("#turn-info-box").hide();
		}

        if (APP.currentPlayer < APP.pCount) {
            APP.currentPlayer++;
        } else {
            APP.currentPlayer = 1;
        }
        player = APP.players[APP.currentPlayerArrPos()];

        if (player.stockAssets.length >= 0) {
            var stockRowId =
                ".stock-shares" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(stockRowId).show();
        }
        if (player.stockAssets.length >= 0) {
            var realEstateRowClass =
                ".real-estate-asset" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(realEstateRowClass).show();
        }
        if (player.coinAssets.length >= 0) {
            var coinRowClass =
                ".coin-asset" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
            $(coinRowClass).show();
        }

        if (APP.pCount == 1) {
            var player1RowId = document.getElementById("table-row-player1");
            player1RowId.style.border = "3pt grove #827717";
        } else {
            var curPlayerRowId = document.getElementById(
                "table-row-player" + parseInt(APP.currentPlayer, 10)
            );
            var prevPlayerRowId = document.getElementById(
                "table-row-player" + parseInt(APP.previousPlayer(), 10)
            );
            //highlight next player
            curPlayerRowId.style.border = "3pt groove #FDD835";
            prevPlayerRowId.style.border = "1pt double #F5F5F5";
        }

        document.getElementById("player-name").innerHTML = APP.name(APP.currentPlayer);
        document.getElementById("ft-player-name").innerHTML = APP.name(APP.currentPlayer);

        APP.turnCount++;

        if (player.charityTurns === 0) {
            $("#roll2-btn").hide();
            $("#ft-roll2-btn").hide();
        } else {
            if (player.fastTrack == true) {
                $("#ft-roll2-btn").show();
            } else {
                $("#roll2-btn").show();
            }
            player.charityTurns--;
        }

        if (player.downsizedTurns != 0) {
            player.downsizedTurns--;
            if (APP.pCount != 1) {
                this.nextTurn();
            }
        }

        APP.finance.statement();
		
		this.checkBankruptcy();
    },
    finishTurn: function () {
        // hide card
        $("#turn-instructions").hide();
        $("#cancel-btn").hide();
        $("#done-repay-btn").hide();
        $("#done-btn").hide();
        $("#offer-settlement").hide();
		$("#roll-info-container").hide();

        APP.display.clearCards();
        APP.display.clearBtns();
		
		// show instructions, bank options, and end turn btn
        $("#finish-turn-container").show();
        $("#finish-instructions").show();
        $("#end-turn-btn").show();
        $("#repay-borrow-btns").show();
		
		// remove card highlight
		$("#turn-info").css("border", "2pt solid transparent");
		$("#turn-info").css("box-shadow", "0 0 2px #212121");
		$(".card-title").css("text-shadow", ".2px .2px .2px #7DCEA0");
		$(".card-title").css("color", "#4E342E");

        var player = APP.players[APP.currentPlayerArrPos()];
        var realEstateAssets = player.realEstateAssets;
		var coinAssets = player.coinAssets;
		
        if (realEstateAssets.length > 0) {
            for (var i = 0; i < realEstateAssets.length; i++) {
                realEstateAssets[i].highlight = "off";
                var rowId = "#asset" + parseInt(i, 10) + "-row";
				
                $(rowId).click(function () {
                    return 0;
                });
            }
        }
		if (coinAssets.length > 0) {
            for (var i = 0; i < coinAssets.length; i++) {
                coinAssets[i].highlight = false;
                var rowId = "#asset-c" + parseInt(i, 10) + "-row";
				
                $(rowId).click(function () {
                    return 0;
                });
            }
        }

        APP.finance.statement();
    },
    getDoodad: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
		
        //random doodad
        var obj = APP.cards.doodad;
        var keys = Object.keys(obj);
        var randDoodad = function (object) {
            return object[keys[Math.floor(keys.length * Math.random())]];
        };
        var currentDoodad = randDoodad(obj);
		
		//check if doodad requires children
		
		if (currentDoodad.child == true && player.children == 0) {
			//get new doodad
			this.getDoodad();
		} else {
			this.currentDoodad = currentDoodad;
		} 
			
		
        //set doodad
        var doodadName = this.currentDoodad.name;
        var doodadCost = this.currentDoodad.cost;
        var text = this.currentDoodad.text;

        //if boat
        if (doodadName == "New Boat!" && player.boatLoan == 0) {
            player.boatLoan = 17000;
            player.boatPayment = 340;
        } else if (doodadName == "New Boat!") {
            text = "You already own one.";
        }
        //if credit card
        if (doodadName == "Buy Big Screen TV") {
            player.creditDebt = 4000;
            player.tvPayment = 120;
        }
        //if child required

        //display doodad
        document.getElementById("doodad-title").innerHTML = doodadName;
        document.getElementById("doodad-text").innerHTML = text;
    },
    getOffer: function () {
        var player = APP.players[APP.currentPlayerArrPos()];

        var obj = APP.cards.offer;
        var keys = Object.keys(obj);
        var randOffer = function (object) {
            return object[keys[Math.floor(keys.length * Math.random())]];
        };
        var currentOffer = randOffer(obj);

        this.currentOffer = currentOffer;
        this.currentOfferOffered = currentOffer.offer;

        document.getElementById("offer-title").innerHTML = currentOffer.name;
        document.getElementById("offer-description").innerHTML =
            currentOffer.description;
        document.getElementById("offer-rule1").innerHTML = currentOffer.rule1;
        document.getElementById("offer-rule2").innerHTML = currentOffer.rule2;

        //if player has the type of property in their assets show sell/appropriate button
        var offerType = APP.currentOffer.type;

        var assetArr = player.realEstateAssets;
		var coinArr = player.coinAssets;

        APP.display.renderAssetTable();

        switch (offerType) {
            case "4-plex":
            case "8-plex":
            case "duplex":
				for (var i = 0; i < assetArr.length; i++) {
					if (assetArr[i].landType == offerType) {
						assetArr[i].highlight = "on";
					}
				}
				break;
            case "plex":
                for (var i = 0; i < assetArr.length; i++) {
                    if (assetArr[i].landType == offerType || assetArr[i].landType == "duplex" || assetArr[i].landType == "4-plex" || assetArr[i].landType == "8-plex" ) {
                        assetArr[i].highlight = "on";
                    }
                }
                break;
            case "apartment":
                for (var i = 0; i < assetArr.length; i++) {
                    if (
                        assetArr[i].landType == offerType &&
                        assetArr[i].units > APP.currentOffer.lowestUnit
                    ) {
                        assetArr[i].highlight = "on";
                    }
                }
                break;
            case "bed breakfast":
            case "10 acres":
            case "20 acres":
            case "3Br/2Ba":
            case "2Br/1Ba":
                for (var i = 0; i < assetArr.length; i++) {
                    if (assetArr[i].landType == offerType) {
                        assetArr[i].highlight = "on";
                    }
                }
                break;
            case "3Br/2Ba+":
                //add 50000 to 3br2ba costs
                for (var i = 0; i < assetArr.length; i++) {
                    if (assetArr[i].landType == "3Br/2Ba") {
                        assetArr[i].cost += 50000;
                    }
                }
                break;
            case "3Br/2Ba-":
                //Remove 3br2ba and cashFlow
				
				
                for (var i = 0; i < assetArr.length; i++) {
					
                    if (assetArr[i].landType == "3Br/2Ba") {
                        player.assetIncome -= assetArr[i].cashFlow;
						
						var index = assetArr.findIndex(x => x.landType == "3Br/2Ba");

						assetArr.splice(index, 1);
                    }
                }
                break;
            case "limited":
                for (var i = 0; i < assetArr.length; i++) {
                    while (assetArr[i].landType == offerType) {
                        var settlement = assetArr[i].cost * 2;
						//highlight 						
						$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #0277BD");
						
                        $("#offer-settlement").show();
                        document.getElementById("offer-settlement").innerHTML =
                            "Your Settlement: $" +
                            parseInt(settlement, 10) +
                            " per partnership";
                        APP.currentSettlement = settlement;
                        APP.currentSettlementCashFlow = assetArr[i].cashFlow;
                        APP.currentSettlementId = assetArr[i].id;
                        var id = APP.currentSettlementId;

                        player.cash += settlement;
                        player.assetIncome -= assetArr[i].cashFlow;
									
                        //remove from array
                        var index = assetArr.findIndex(x => x.id == id);
                        assetArr.splice(index, 1);
                    }
                }
                break;
            case "franchise":
                //?
                break;
            case "business":
                var businessAssetArr = player.businessAssets;
                for (var i = 0; i < businessAssetArr.length; i++) {
                    if (businessAssetArr[i].landType == offerType) {
                        var cashFlow = APP.currentOffer.cashFlow;
                        businessAssetArr[i].cashFlow += cashFlow;
                        player.assetIncome += cashFlow;
                    }
                }
                break;
            case "car wash":
                for (var i = 0; i < assetArr.length; i++) {
                    if (assetArr[i].landType == offerType) {
                        assetArr[i].highlight = "on";
                    }
                }
                break;
            case "widget":
                break;
            case "mall":
                for (var i = 0; i < assetArr.length; i++) {
                    if (assetArr[i].landType == offerType) {
                        assetArr[i].highlight = "on";
                    }
                }
                break;
            case "Krugerrands":
				for (var i = 0; i < coinArr.length; i++){
					if (coinArr[i].name == "Krugerrands") {
						coinArr[i].highlight = true;
					}
				}
                break;
            case "1500's Spanish":
			for (var i = 0; i < coinArr.length; i++){
					if (coinArr[i].name == "1500's Spanish") {
						coinArr[i].highlight = true;
					}
				}
                break;
			default:
				
				break;
        }
    },
	getSettlement: function (row, debt) {
		var player = APP.players[APP.currentPlayerArrPos()];
		var currentId = row;
	
		currentId.split('');
		
		const index = Number(currentId[5]);
		
		this.currentSettlementIndex = index;
		
		if (debt === true){
			var bankruptcySettlement = player.realEstateAssets[index].downPayment / 2;
			APP.currentSettlement = bankruptcySettlement;
			APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
			APP.currentSettlementId = player.realEstateAssets[index].id;
				
			$("#confirm-settlement-btn").show();
			$("#show-offer-btn").show();
			$("#br-settlement-text").show();
			$("#br-settlement-offer").html(parseInt(bankruptcySettlement, 10));	
			
			console.log("bankrupcy settlement:" + bankruptcySettlement);
		} else {
			//if (typeof APP.currentOffer == "object") {
				switch (APP.currentOffer.type) {
					case "4-plex":
					case "8-plex":
					case "duplex":
					case "plex":
						APP.currentSettlement =
							player.realEstateAssets[index].units * APP.currentOffer.offerPerUnit -
							player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
					case "apartment":
						APP.currentSettlement =
							player.realEstateAssets[index].units * APP.currentOffer.offerPerUnit -
							player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
						break;
					default:
						APP.currentSettlement = APP.currentOfferOffered - player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
				}			
          //  }
			/*
			if (typeof APP.currentOffer == "object") {
				switch (APP.currentOffer.type) {
					case "4-plex":
					case "8-plex":
					case "duplex":
					case "plex":
						APP.currentSettlement =
							player.realEstateAssets[index].units * APP.currentOffer.offerPerUnit -
							player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
					case "apartment":
						APP.currentSettlement =
							player.realEstateAssets[index].units * APP.currentOffer.offerPerUnit -
							player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
						break;
					default:
						APP.currentSettlement = APP.currentOfferOffered - player.realEstateAssets[index].mortgage;
						APP.currentSettlementCashFlow = player.realEstateAssets[index].cashFlow;
						break;
				}			
            }
			*/
				
			$("#offer-card").hide();
			$("#done-btn").hide();

			$("#settlement-card").show();
			$("#confirm-settlement-btn").show();
			$("#show-offer-btn").show();
			$("#settlement-offer").html(APP.display.numWithCommas(APP.currentSettlement));
		}
	},
	smallDeal: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        //get random deal
        var obj = APP.cards.smallDeal;
        var keys = Object.keys(obj);
        var randDeal = function (object) {
            return object[keys[Math.floor(keys.length * Math.random())]];
        };
        const currentDeal = randDeal(obj);
        var dealType = currentDeal.type;

        this.currentDeal = currentDeal;

        APP.finance.statement();

        $("#opp-card").hide();
        $("#small-deal-btn").hide();
        $("#big-deal-btn").hide();
        $("#sell-shares-form").hide();

        //show deal card
        switch (dealType) {
            case "Stock":
            case "Mutual Fund":
				$("#deal-card-stock").show();
                $("#show-stock-form-btn").show();
                $("#done-btn").show();
                $("#stock-cost-table").show();
                $("#deal-stock-rule").hide();
				$("#stock-table-trading-range-row").show();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
                document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-stock-cost").innerHTML =
                    currentDeal.price;
                document.getElementById("deal-stock-cash-flow").innerHTML = "Dividend: $0";
                document.getElementById("deal-stock-trading-range").innerHTML =
                    currentDeal.range;
                document.getElementById(
                    "deal-stock-shares-owned"
                ).innerHTML = APP.display.numWithCommas(APP.ownedShares());
                document.getElementById("share-cost").innerHTML = currentDeal.price;
                document.getElementById("share-cost-sell").innerHTML = currentDeal.price;

                var shares = APP.ownedShares();
                if (shares > 0) {
                    $("#show-stock-sell-form-btn").show();
                }

                break;
			case "Preferred Stock":
                $("#deal-card-stock").show();
                $("#show-stock-form-btn").show();
                $("#done-btn").show();
                $("#stock-cost-table").show();
                $("#deal-stock-rule").hide();
				$("#stock-table-trading-range-row").hide();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
                document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-stock-cost").innerHTML =
                    currentDeal.price;
                document.getElementById("deal-stock-cash-flow").innerHTML = "Dividend: $" + currentDeal.dividend;
                document.getElementById("deal-stock-trading-range").innerHTML =
                    currentDeal.range;
                document.getElementById(
                    "deal-stock-shares-owned"
                ).innerHTML = APP.display.numWithCommas(APP.ownedShares());
                document.getElementById("share-cost").innerHTML = currentDeal.price;
                document.getElementById("share-cost-sell").innerHTML = currentDeal.price;

                var shares = APP.ownedShares();
                if (shares > 0) {
                    $("#show-stock-sell-form-btn").show();
                }

                break;
            case "Real Estate":
                $("#deal-card-real-estate").show();
                $("#pass-btn").show();
                $("#real-estate-cost-table").show();
                $("#buy-real-estate-btn").show();

                document.getElementById("deal-re-name").innerHTML = currentDeal.name;
                document.getElementById("deal-re-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
                document.getElementById("deal-re-cost").innerHTML = APP.display.numWithCommas(currentDeal.cost);
                document.getElementById("deal-re-cash-flow").innerHTML =
                    APP.display.numWithCommas(currentDeal.cashFlow);
                document.getElementById("deal-re-down-payment").innerHTML =
                    APP.display.numWithCommas(currentDeal.downPayment);
                document.getElementById("deal-re-mortgage").innerHTML =
                    APP.display.numWithCommas(currentDeal.mortgage);
					
				//highlight card when player has enough cash to buy the deal
				if (APP.currentDeal.downPayment < player.cash){
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				}
                break;
            case "Property Damage":
                $("#deal-card-real-estate").show();
                $("#real-estate-cost-table").hide();

                document.getElementById("deal-re-name").innerHTML = currentDeal.name;
                document.getElementById("deal-re-description").innerHTML =
                    currentDeal.description;
				
                if (player.realEstateAssets.length <= 0) {
                    document.getElementById("deal-re-rule").innerHTML =
                        "You do not own any of this type of property.";
                    $("#done-btn").show();
					$("#card-btns").show();
                } else {
					for (var i = 0; i < player.realEstateAssets.length; i++) {
						var damageType = APP.currentDeal.propertyType;
						var obj = player.realEstateAssets[i];
						var landType = obj.landType;						
                    
                        if ((damageType === "rental" && landType ==
                                ("3Br/2Ba" ||
                                    "2Br/1Ba" ||
                                    "duplex" ||
                                    "4-plex" ||
                                    "8-plex" ||
                                    "plex")) ||
                            obj.type === "Real Estate"
                        ) {
                            document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
                            $("#pd-pay-button").show();
                        }							 
                    }	
                }
                break;
            case "Stock Split":
                $("#deal-card-stock").show();
                $("#deal-stock-rule").show();
                $("#stock-cost-table").hide();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
                document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML =
                    currentDeal.description;

                //run split function
                APP.finance.stockSplit("split");

                $("#done-btn").show();
                break;
            case "Reverse Split":
                $("#deal-card-stock").show();
                $("#deal-stock-rule").show();
                $("#stock-cost-table").hide();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
                document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-stock-rule").innerHTML = currentDeal.rule;

                //run split function
                APP.finance.stockSplit("reverse");

                $("#done-btn").show();
                break;
            case "Coin":
                $("#deal-coin-card").show();

                document.getElementById("deal-coin-title").innerHTML = currentDeal.title;
                document.getElementById("deal-coin-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-coin-rule").innerHTML = currentDeal.rule;
                document.getElementById("deal-coin-cost").innerHTML = currentDeal.cost;
                document.getElementById("deal-coin-down-payment").innerHTML =
                    currentDeal.downPayment;
                document.getElementById("deal-coin-liability").innerHTML =
                    currentDeal.liability;
                document.getElementById("deal-coin-cash-flow").innerHTML =
                    currentDeal.cashFlow;

                $("#buy-coin-btn").show();
                $("#pass-btn").show();
                break;
            case "Certificate of Deposit":
                $("#deal-cd-card").show();

                document.getElementById("deal-cd-name").innerHTML = currentDeal.name;
                document.getElementById("deal-cd-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-cd-rule").innerHTML = currentDeal.rule;

                $("#pass-btn").show();
                break;
            case "Company":
                $("#deal-company-card").show();

                document.getElementById("deal-company-name").innerHTML =
                    currentDeal.name;
                document.getElementById("deal-company-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-company-rule").innerHTML =
                    currentDeal.rule;
                document.getElementById("deal-company-cost").innerHTML =
                    currentDeal.cost;
                document.getElementById("deal-company-cash-flow").innerHTML =
                    currentDeal.cashFlow;

                $("#pass-btn").show();
                $("#buy-business-btn").show();
                break;
            case "Personal Loan":
                $("#deal-personal-loan-card").show();

                document.getElementById("deal-personal-loan-name").innerHTML =
                    currentDeal.name;
                document.getElementById("deal-personal-loan-description").innerHTML =
                    currentDeal.description;

                $("#pass-btn").show();
                break;
			default:
				//-- temp
				$("#done-btn").show();
				break;
        }

    },
    bigDeal: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var obj = APP.cards.bigDeal;
        var keys = Object.keys(obj);
        var randDeal = function (object) {
            return object[keys[Math.floor(keys.length * Math.random())]];
        };
        var currentDeal = randDeal(obj);
		var dealType;
		
		if (!currentDeal) {
			dealType = "none";
		} else {
			dealType = currentDeal.type;
			this.currentDeal = currentDeal;
		}   

        APP.finance.statement();

        $("#opp-card").hide();
        $("#small-deal-btn").hide();
        $("#big-deal-btn").hide();

        //show deal card
        switch (dealType) {
            case "Real Estate":
                $("#deal-card-real-estate").show();
                $("#buy-real-estate-btn").show();
                $("#pass-btn").show();
                $("#real-estate-cost-table").show();

                document.getElementById("deal-re-name").innerHTML = currentDeal.name;
                document.getElementById("deal-re-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
                document.getElementById("deal-re-cost").innerHTML = APP.display.numWithCommas(currentDeal.cost);
                document.getElementById("deal-re-mortgage").innerHTML =
                    APP.display.numWithCommas(currentDeal.mortgage);
                document.getElementById("deal-re-cash-flow").innerHTML =
                    APP.display.numWithCommas(currentDeal.cashFlow);
                document.getElementById("deal-re-down-payment").innerHTML =
                    APP.display.numWithCommas(currentDeal.downPayment);
					
				if (APP.currentDeal.downPayment <= player.cash){
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				}
                break;
            case "Property Damage":
                $("#pass-btn").show();
                $("#real-estate-cost-table").hide();

                document.getElementById("deal-re-name").innerHTML = currentDeal.name;
                document.getElementById("deal-re-description").innerHTML =
                    currentDeal.description;

                if (player.realEstateAssets.length == 0) {
                    document.getElementById("deal-re-rule").innerHTML =
                        "You do not own any of this type of property.";
                    $("#done-btn").show();
                } else {
                    for (var i = 0; i < player.realEstateAssets.length; i++) {
                        var damageType = APP.currentDeal.propertyType;
                        var obj = player.realEstateAssets[i];
                        var landType = obj.landType;

                        if (
                            (damageType === "rental" &&
                                landType ==
                                ("3Br/2Ba" ||
                                    "2Br/1Ba" ||
                                    "duplex" ||
                                    "4-plex" ||
                                    "8-plex" ||
                                    "plex")) ||
                            damageType === landType
                        ) {
                            document.getElementById("deal-re-rule").innerHTML =
                                currentDeal.rule;
                            $("#pd-pay-button").show();
                        }
                    }
                }
                break;
            case "Limited Partnership":
                $("#deal-card-limited").show();
                $("#pass-btn").show();
                $("#limited-cost-table").show();
                //buy limited button
                $("#buy-real-estate-btn").show();

                document.getElementById("deal-limited-name").innerHTML =
                    currentDeal.name;
                document.getElementById("deal-limited-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-limited-rule").innerHTML =
                    currentDeal.rule;
                document.getElementById("deal-limited-cost").innerHTML =
                    currentDeal.cost;
                document.getElementById("deal-limited-cash-flow").innerHTML =
                    currentDeal.cashFlow;
                document.getElementById("deal-limited-down-payment").innerHTML =
                    currentDeal.downPayment;
                document.getElementById("deal-limited-liability").innerHTML =
                    currentDeal.liability;
					
				if (APP.currentDeal.downPayment <= player.cash){
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				}
                break;
            case "Automated Business":
                $("#deal-card-automated").show();
                $("#pass-btn").show();
                $("#automated-cost-table").show();
                //buy automated button
                $("#buy-business-btn").show();

                document.getElementById("deal-automated-name").innerHTML =
                    currentDeal.name;
                document.getElementById("deal-automated-description").innerHTML =
                    currentDeal.description;
                document.getElementById("deal-automated-rule").innerHTML =
                    currentDeal.rule;
                document.getElementById("deal-automated-cost").innerHTML =
                    currentDeal.cost;
                document.getElementById("deal-automated-cash-flow").innerHTML =
                    currentDeal.cashFlow;
                document.getElementById("deal-automated-down-payment").innerHTML =
                    currentDeal.downPayment;
                document.getElementById("deal-automated-liability").innerHTML =
                    currentDeal.liability;
					
				if (APP.currentDeal.downPayment <= player.cash){
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				}
                break;
			case "none":
				$("#done-btn").show();
                $("#real-estate-cost-table").hide();

                document.getElementById("deal-re-name").innerHTML = "No Deals to Choose From";
                document.getElementById("deal-re-description").innerHTML = "";
					document.getElementById("deal-re-rule").innerHTML = "";
				
			break;
				
        }
    },
    clearAmounts: function () {
        APP.finance.loanAmount = 1000;
		APP.finance.mortgagePrepay = false;

        delete APP.currentDeal;
        delete APP.currentDoodad;

        delete APP.currentOffer;
        delete APP.currentSettlement;
        delete APP.currentSettlementId;
        delete APP.currentOfferOffered;

        document.getElementById("loan-amt-input").value = 1000;
        document.getElementById("loan-amt-input2").value = 1000;
        document.getElementById("share-amt-input").value = 1;
        document.getElementById("share-amt-input-sell").value = 1;
    },
    ownedShares: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;
        var stockId = APP.currentDeal.id;
        var stockSymbol = APP.currentDeal.symbol;
        var shares = 0;

        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].symbol == stockSymbol) {
                    shares += Number(arr[i].shares);
                }
            }
            return shares;
        } else {
            return 0;
        }
    },
	randomDealText: function(playerPosition) {
		//-- unused
		var text;
		if (APP.players[this.currentPlayerArrPos()].fastTrack == true) { 
			if (playerPosition == 2) {
				var dealText = Math.floor(Math.random() * APP.cardText.donations.length) + 1;	
				text = APP.cardText.donations[dealText];
			}
			
			if (playerPosition !== (1 || 2 || 7 || 10 || 14 || 18 || 21 || 27 || 30 || 34 || 38)) {
				var dealText = Math.floor(Math.random() * APP.cardText.deals.length) + 1;	
				text = APP.cardText.deals[dealText];
			}
		}
		return text;
	},
	saveState: function(){
		setInterval(function(){}, 2000);
	},
	checkBankruptcy: function(){
		var player = APP.players[APP.currentPlayerArrPos()];
		//updgrade to calculating the total amount the player can get from every asset and sell
		var propertyAssets = player.realEstateAssets;
        var businessAssets = player.businessAssets;
        var coinAssets = player.coinAssets;
        var stockAssets = player.stockAssets;
		
		player.debt = false;
		
		if (player.payday < 0) {
			player.loanApproval = false;
		}
		
		if (player.payday < 0 && player.cash < 0) {	
			
			//clear cards
			APP.display.clearCards();
			APP.display.clearBtns();
			
			// if the player has no assets to sell they lose the game, else 
				console.log("checking bankruptcy..." + "arr lengths: " + player.realEstateAssets.length + ", " + player.businessAssets.length + ", "  + player.coinAssets.length + ", "  + player.stockAssets.length);
			
			if ((player.realEstateAssets.length && player.businessAssets.length && player.coinAssets.length && player.stockAssets.length) <= 0) {
				$("#bankrupt-game-over-card").show();
				$("#bankrupt-card").hide();
				// continue button
			} else {				
			    player.debt = true;
				
				APP.display.renderAssetTable();
				
				function cash(){
					var total;
					
					total = player.cash; 
					/*
					get cash + amount owed
					if doodad 
					if owe money */
					return total;
				}

				$("#bankrupt-card").show();
				$("#br-cash-flow").html(String(APP.display.numWithCommas(cash())));
				$("#br-settlement-text").hide();
			}
		}
	}
};

APP.finance = {
    statement: function () {
		// get current player
        var player = APP.players[APP.currentPlayerArrPos()];
		
        // Income
        document.getElementById("player-job-income").innerHTML = APP.display.numWithCommas(player.jobTitle[0]);
        document.getElementById("player-salary-income").innerHTML = APP.display.numWithCommas(player.jobTitle[1]);
        
		// Expenses
		APP.finance.getTaxes();
        document.getElementById("expenses-taxes").innerHTML = APP.display.numWithCommas(player.jobTitle[3]);
        document.getElementById("expenses-mortgage").innerHTML = APP.display.numWithCommas(player.jobTitle[4]);
        document.getElementById("expenses-car").innerHTML = APP.display.numWithCommas(player.jobTitle[5]);
        document.getElementById("expenses-credit").innerHTML = APP.display.numWithCommas(player.jobTitle[6]);
        document.getElementById("expenses-retail").innerHTML = APP.display.numWithCommas(player.jobTitle[7]);
        document.getElementById("expenses-other").innerHTML = APP.display.numWithCommas(player.jobTitle[8]);
        this.loanPayment(APP.currentPlayerArrPos());
        document.getElementById("child-count").innerHTML = player.children;
        document.getElementById("expenses-loans").innerHTML = APP.display.numWithCommas(player.loanPayment);
		
		if (player.boatLoan > 0){
			$("#exp-boat-row").show();
			document.getElementById("expenses-boatloan").innerHTML = APP.display.numWithCommas(player.boatPayment);
        } else {
			$("#exp-boat-row").hide();
		}
		if (player.insurance > 0){
			$("#exp-insurance-row").show();
			document.getElementById("expenses-insurance").innerHTML = APP.display.numWithCommas(player.insurance);
        } else {
			$("#exp-insurance-row").hide();
		}
		
		// Summary
		if (APP.players[APP.currentPlayerArrPos()].hasInsurance == true){ 
			this.getInsurance(APP.currentPlayerArrPos());
		}
        this.getExpenses(APP.currentPlayerArrPos());
        this.getIncome(APP.currentPlayerArrPos());
        this.getPayday(APP.currentPlayerArrPos());
		
		// Show amount needed to win if player is in the fast track
		if (player.fastTrack == true){
			//hide total expenses and show winpay amount
			$("#total-expenses-header").hide();
			$("#win-pay-header").show();
			document.getElementById("summary-win-bar").innerHTML = APP.display.numWithCommas(player.winPay);
			document.getElementById("bar-passive-income").innerHTML = APP.display.numWithCommas(player.cashFlowDay);
		} else {
			$("#total-expenses-header").show();
			$("#win-pay-header").hide();
			//show total expenses
			document.getElementById("summary-total-expenses").innerHTML = APP.display.numWithCommas(player.totalExpenses);
			document.getElementById("summary-total-expenses-bar").innerHTML = APP.display.numWithCommas(player.totalExpenses);
			document.getElementById("bar-passive-income").innerHTML = APP.display.numWithCommas(player.passiveIncome);
		}
			
        // summary totals
        document.getElementById("summary-cash").innerHTML = APP.display.numWithCommas(Math.round(player.cash));
        document.getElementById("summary-total-income").innerHTML = APP.display.numWithCommas(player.totalIncome);
        document.getElementById("summary-payday").innerHTML = APP.display.numWithCommas(player.payday);
        
		// get asset table
        APP.display.renderStockTable();
        APP.display.renderAssetTable();
        
		// get liabilities table
		APP.display.renderLiabilitiesTable();
		
		// amount needed for fast track progress bar 
        this.progressBar();
       
        var expenseBarEle = document.getElementById("income-expense-bar");

        if (expenseBarEle.style.width == "100%") {
            if (player.fastTrackOption == false) {
                player.fastTrackOption = true;

                APP.display.clearCards();
                APP.display.clearBtns();

                $("#fast-track-intro-card").show();

                $("#turn-instructions").hide();
                $("#finish-instructions").hide();
                $("#ft-turn-instructions").hide();
                $("#roll-btn").hide();
				$("#end-turn-btn").hide();
                $("#fast-track-option-card").hide();

                document.getElementById("ftic-player-name").innerHTML = APP.name(APP.currentPlayer);
                document.getElementById("ftic-player-name-intro").innerHTML = APP.name(APP.currentPlayer);
                $("#ftic-ok-btn").show();
                $("#ft-enter-btn").show();
            }
        }
		
		//Check for Fast Track
		if (player.fastTrack == true){
			APP.display.renderFtAssets();
			$("#income-table").hide();
			$("#liability-table").hide();
			$("#sum-total-expense-row").hide();
			$("#sum-total-income-row").hide();
			$("#asset-statement").css("width", "90%");
			
			console.log("cashflow day: " + player.cashFlowDay + ", winpay: " + player.winPay);
			
			if (player.cashFlowDay >= player.winPay) {
				
				//show win card
				APP.display.clearCards();
				APP.display.clearBtns();
				
				$("#win-game-card").show();
				
				if (APP.remainingPlayers == APP.pCount){
					$("#win-scenario").text(APP.name(APP.currentPlayer) + "wins the game by adding over $50,000 to their Cash Flow Day!");
				} else {
					$("#win-scenario").text(APP.name(APP.currentPlayer) + "wins the game by adding over $50,000 to their Cash Flow Day!");
				}
				
				APP.remainingPlayers -= 1;
				
				document.getElementById("win-cash-amount").innerHTML = APP.display.numWithCommas(player.cash);
				document.getElementById("win-income-amount").innerHTML = APP.display.numWithCommas(player.cashFlowDay + Math.round(this.getIncome(APP.currentPlayerArrPos())));
				document.getElementById("win-asset-amount").innerHTML = APP.display.numWithCommas(player.realEstateAssets.length);

				$("#win-card-new-game-btn").click(function(){
					window.location.reload(false);
				});
			}
		} else {
			$("#sum-total-expense-row").show();
			$("#sum-total-income-row").show();
			$("#income-table").show();
			$("#liability-table").show();
			
			if (player.realEstateAssets.length >= 5){
				$("#income-table").css("height","14%");
				$("#asset-stock-body").css("height","300px");
			} else {
				$("#income-table").css("height","10%");
				$("#asset-stock-body").css("height","16%");
			}
			
			$("#asset-statement").css("width", "98%");
		}
    },
    progressBar: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var expenseBarEle = document.getElementById("income-expense-bar");
        var expenses = this.getExpenses(APP.currentPlayerArrPos());
        var width; 
		
		if(player.fastTrack == true){
			width = 100 * (player.fastTrackIncome / player.winPay);
			
			if (width > 100) {
				expenseBarEle.style.width = "100%";
			} else {
				expenseBarEle.style.width = Math.round(width) + "%";
			}
		} else {
			width = 100 * (player.passiveIncome / expenses);
			
			if (width > 100) {
				expenseBarEle.style.width = "100%";
			} else {
				expenseBarEle.style.width = Math.round(width) + "%";
			}
        }
		
		if (width > 100) {
            expenseBarEle.style.width = "100%";
        } else {
            expenseBarEle.style.width = Math.round(width) + "%";
        }
    },
    getIncome: function (currentPlayer) {
        var player = APP.players[currentPlayer];
        var salary = player.jobTitle[1];
		var dividends = 0;
		var assetIncome = 0;
		var fastTrackIncome = 0;
		
		var stockArr = player.stockAssets;
		var realEstateArr = player.realEstateAssets;
		var businessArr = player.businessAssets;
		var ftArr = player.fastTrackAssets;

		// get income from stocks, assets and businesses
		for (var i = 0; i < stockArr.length; i++){
			if (stockArr[i].type == "Preferred Stock") {
				var stockReturn = stockArr[i].shares * stockArr[i].dividend;
				
				dividends += stockReturn;
			}
		}
		for (var i = 0; i < realEstateArr.length; i++){
			if (realEstateArr[i].cashFlow) {
				assetIncome += realEstateArr[i].cashFlow;
			}
		}
		for (var i = 0; i < businessArr.length; i++){
			if (businessArr[i].cashFlow) {
				assetIncome += businessArr[i].cashFlow;
			}
		}
		for (var i = 0; i < ftArr.length; i++){
			if (ftArr[i].cashFlow) {
				fastTrackIncome += ftArr[i].cashFlow;
			}
		}

		// get total income
        if (player.fastTrack == false) {
            player.totalIncome = salary + player.assetIncome + assetIncome + dividends;
			player.passiveIncome = assetIncome + dividends;
        } else {
            player.totalIncome = player.cashFlowDay + fastTrackIncome;
        }

        return player.totalIncome;
    },
    getExpenses: function (currentPlayer) {
        //total expenses = liabilities + bills
        var player = APP.players[currentPlayer];

        var taxes = APP.players[currentPlayer].jobTitle[3];
        var mortgage = APP.players[currentPlayer].jobTitle[4];
        var car = APP.players[currentPlayer].jobTitle[5];
        var credit = APP.players[currentPlayer].jobTitle[6];
        var retail = APP.players[currentPlayer].jobTitle[7];
        var other = APP.players[currentPlayer].jobTitle[8];
        var children = player.childExpense;
        var loanPayment = player.loanPayment;
        var boatPayment = player.boatPayment;
		var insurance = player.insurance;
		
		if (player.hasInsurance == true) {
			
		this.getInsurance(currentPlayer);
		}
		
        if (player.fastTrack == false) {
            player.totalExpenses =
                taxes +
                mortgage +
                car +
                credit +
                retail +
                other +
                children +
                loanPayment +
                boatPayment +
				insurance;
        } else {
            player.totalExpenses = 0;//taxes + children + other;
        }

        //include assets

        return player.totalExpenses;
    },
    getPayday: function (currentPlayer) {
        var player = APP.players[currentPlayer];
        var income = this.getIncome(currentPlayer);
        var expenses = this.getExpenses(currentPlayer);
        var pay = income - expenses;
        if (player.fastTrack == false) {
            player.payday = pay;
        } else {
            player.payday = player.cashFlowDay + income;
        }
    },
    payDoodad: function () {
        var player = APP.players[APP.currentPlayerArrPos()];

        if (APP.currentDoodad.name == "New Boat") {
            player.boatLoan = 17000;
            player.boatPayment = 340;
            APP.finishTurn();
        } else if (APP.currentDoodad.cost <= player.cash) {
            player.cash -= APP.currentDoodad.cost;
            APP.finishTurn();
        } else {
            this.loanOffer(APP.currentDoodad.cost);
        }
    },
    payDownsize: function () {
        //show liability card
        var player = APP.players[APP.currentPlayerArrPos()];
        var boardPosition = player.position;
        var downsizedAmount = player.totalExpenses;
		
		if (player.hasInsurance == true){
            APP.finishTurn();
		} else {
			if (player.cash < downsizedAmount) {
				this.loanOffer(downsizedAmount);
			} else {
				player.cash -= downsizedAmount;
				player.downsizedTurns += 3;
				APP.finishTurn();
			}
		}
    },
    payPropertyDamage: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var cost = APP.currentDeal.cost;

        if (player.cash < cost) {
            this.loanOffer(cost);
        } else {
            player.cash -= cost;
            APP.finishTurn();
        }
    },
    donate: function () {
        var dPlayer = APP.players[APP.currentPlayerArrPos()];
        var donation = dPlayer.totalIncome * 0.1;

        if (dPlayer.cash >= donation) {
            dPlayer.cash = dPlayer.cash - donation;
            dPlayer.charityTurns += 3;
            if (dPlayer.fastTrack == true) { 
                FASTTRACK.finishTurn();
            } else {
                APP.finishTurn();
            }
        } else {
            $("#charity-donate-btn").hide();
            $("#charity-card").hide();
            $("#pass-btn").hide();
            $("#cannot-afford-card").show();
            $("#done-repay-btn").show();
        }
    },
    increaseLoan: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var value = parseInt(document.getElementById("loan-amt-input").value, 10);
        var value2 = parseInt(document.getElementById("loan-amt-input2").value, 10);

        value = isNaN(value) ? 0 : value;
        value += 1000;
        document.getElementById("loan-amt-input").value = value;

        value2 = isNaN(value2) ? 0 : value2;
        if (value2 + 1000 > player.cash) {
            value2 += 0;
        } else {
            value2 += 1000;
        }
        document.getElementById("loan-amt-input2").value = value2;
    },
    decreaseLoan: function () {
        var value = parseInt(document.getElementById("loan-amt-input").value, 10);

        value = isNaN(value) ? 0 : value;
        if (value > 1000) {
            value -= 1000;
        } else {
            value = 1000;
        }
        document.getElementById("loan-amt-input").value = value;

		var value2 = parseInt(document.getElementById("loan-amt-input2").value, 10);
		value2 = isNaN(value2) ? 0 : value2;
        if (value2 > 1000) {
            value2 -= 1000;
        } else {
            value2 = 1000;
        }
        document.getElementById("loan-amt-input2").value = value2;
    },
    takeOutLoan: function () {
        var loan = parseInt(document.getElementById("loan-amt-input").value, 10);
        var player = APP.players[APP.currentPlayerArrPos()];
        loan = isNaN(loan) ? 0 : loan;
		
        player.loans += loan;
        player.cash += loan;

        APP.finishTurn();
    },
    repayLoan: function () {
        var loan = parseInt(document.getElementById("loan-amt-input2").value, 10);
        var player = APP.players[APP.currentPlayerArrPos()];
        loan = isNaN(loan) ? 0 : loan;
		
		if (player.loanId == "liability-mortgage"){
			player.cash -= loan;
			player.jobTitle[9] -= loan;
			
			if (player.jobTitle[9] <= 0){
				player.jobTitle[4] = 0;
				player.jobTitle[9] = 0;
			}
		} else if (player.loanId == "liability-boat"){
			player.cash -= loan;
			player.boatLoan -= loan;
			
			if (player.boatLoan <= 0){
				player.boatLoan = 0;
				player.boatPayment = 0;
			} 
		} else {
			player.loans -= loan;
			player.cash -= loan;
		}
		
        $("#confirm-pay-btn").hide();
        APP.display.highlightLiabilities(2);
    },
	mortgagePrepay: false,
    loanPayment: function (currentPlayer) {
        var player = APP.players[currentPlayer];
        var loanPayment = player.loans * 0.1;
        player.loanPayment = loanPayment;
        return loanPayment;
    },
    pay: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var loanId = player.loanId;

        switch (loanId) {
            case "liability-mortgage":
                if (this.mortgagePrepay == true) {										
					$("#cancel-btn").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#done-repay-btn").show();
                    $("#repay-card").show();
					
					this.repayLoan();
					APP.finishTurn();
					
					document.getElementById("loan-amt-input2").value = 1000;
				} else if (player.cash < player.jobTitle[9]) {
                    $("#repay-card").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();
                    $("#cannot-afford-loan-card").show();
                } else {
                    player.cash -= player.jobTitle[9];
                    player.jobTitle[4] = 0;
                    player.jobTitle[9] = 0;

                    $("#cancel-btn").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#done-repay-btn").show();
                    $("#repay-card").show();
                }
                break;
            case "liability-car":
                if (player.cash < player.jobTitle[10]) {
                    $("#repay-card").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#cannot-afford-loan-card").show();
                } else {
                    player.cash -= player.jobTitle[10];
                    player.jobTitle[5] = 0;
                    player.jobTitle[10] = 0;

                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();
                    $("#cancel-btn").hide();

                    $("#done-repay-btn").show();
                    $("#repay-card").show();
                }
                break;
            case "liability-credit":
                if (player.cash < player.jobTitle[11]) {
                    $("#repay-card").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#cannot-afford-loan-card").show();
                } else {
                    player.cash -= player.jobTitle[11];
                    player.jobTitle[6] = 0;
                    player.jobTitle[11] = 0;

                    $("#repay-card").show();
                    $("#done-repay-btn").show();

                    $("#confirm-pay-btn").hide();
                    $("#cancel-btn").hide();
                    $("#pay-confirm-card").hide();
                }
                break;
            case "liability-retail":
                if (player.cash < player.jobTitle[12]) {
                    $("#repay-card").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#cannot-afford-loan-card").show();
                } else {
                    player.cash -= 1000;
                    player.jobTitle[7] = 0;
                    player.jobTitle[12] = 0;

                    $("#repay-card").show();
                    $("#done-repay-btn").show();

                    $("#cancel-btn").hide();
                    $("#pay-confirm-card").hide();
                    $("#repay-loan-card").hide();
                    $("#confirm-pay-btn").hide();
                }
                break;
            case "liability-loans":
                var loanAmt = document.getElementById("loan-amt-input2").value;
                if (player.cash < loanAmt) {
                    $("#repay-card").hide();
                    $("#pay-confirm-card").hide();
                    $("#confirm-pay-btn").hide();

                    $("#cannot-afford-loan-card").show();
                } else {
                    this.repayLoan();
                    APP.finishTurn();
                }
                document.getElementById("loan-amt-input2").value = 1000;
                break;
			case "liability-boat":
				$("#cancel-btn").hide();
				$("#pay-confirm-card").hide();
				$("#confirm-pay-btn").hide();

				$("#done-repay-btn").show();
				$("#repay-card").show();
				
				this.repayLoan();
				APP.finishTurn();
                
				document.getElementById("loan-amt-input2").value = 1000;
                break;
            default:
                APP.finishTurn();
                break;
        }
        APP.finance.statement(APP.currentPlayerArrPos());
    },
    buyStock: function () {
        var player = APP.players[APP.currentPlayerArrPos()];

        APP.currentDeal.shares = 0;
        APP.currentDeal.shares += Number(
            document.getElementById("share-amt-input").value
        );

        const stockObj = JSON.parse(JSON.stringify(APP.currentDeal));

        stockObj.selected = false;

        var shares = Number(stockObj.shares);
        var price = Number(stockObj.price);
        var cost = price * shares;
        var stockId = stockObj.id;
        var arr = player.stockAssets;
        var index = arr.findIndex(x => x.id == stockId);

        if (cost <= player.cash) {
            player.cash -= cost;
			
            if (index == -1) {
                arr.push(stockObj);
            } else {
                arr[index].shares += shares;
            }
			
			$("#show-stock-form-btn").show();
			$("#show-stock-sell-form-btn").show();
			$("#buy-shares-form").hide();
			$("#buy-stock-btn").hide();
			$("#done-buy-sell-btn").hide();
			$("#done-btn").show();
        } else {
			$("#show-stock-form-btn").hide();
			$("#show-stock-sell-form-btn").hide();
			$("#buy-stock-btn").hide();
			$("#done-btn").hide();
			$("#done-buy-sell-btn").hide();
			
            this.loanOffer(cost);
        }        

        if (APP.ownedShares() > 0) {
            $("#show-stock-sell-form-btn").show();
        }
        document.getElementById(
            "deal-stock-shares-owned"
        ).innerHTML = APP.ownedShares();

        APP.finance.statement();
    },
    sellStock: function () {
        //--
        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;

        APP.currentDeal.shares = 0;
        APP.currentDeal.shares += Number(
            document.getElementById("share-amt-input-sell").value
        );

        let sellStockObj = JSON.parse(JSON.stringify(APP.currentDeal));

        var shares = Number(sellStockObj.shares);
        var price = Number(sellStockObj.price);
        var re = price * shares;
        var index;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].selected === true) {
                index = i;
            }
        }

        player.cash += re;
        arr[index].shares -= shares;

        document.getElementById(
            "deal-stock-shares-owned"
        ).innerHTML = APP.ownedShares();

        $("#show-stock-form-btn").show();
        $("#show-stock-sell-form-btn").show();
        $("#sell-shares-form").hide();
        $("#sell-stock-btn").hide();
        $("#done-buy-sell-btn").hide();
        $("#done-btn").show();


        if (arr[index].shares === 0) {
            arr.splice(index, 1);
            if (arr.length === 0) {
                $("#show-stock-sell-form-btn").hide();
            }
        }
        for (var j = 0; j < arr.length; j++) {
            if (arr[j].highlight === "on") {
                arr[j].highlight = "off";
            }
            if (arr[j].selected === true) {
                arr[j].selected = false;
            }
        }
        APP.finance.statement();
    },
    stockSplit: function (type) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;
        var stockSymbol = APP.currentDeal.symbol;

        for (var i = 0; i < arr.length; i++) {
            var shares = arr[i].shares;
            if (arr[i].symbol == stockSymbol) {
				
                if (type == "split") {
                    arr[i].shares = shares * 2;
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
                } else if (type == "reverse") {
                    arr[i].shares = shares / 2;
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px#D32F2F");
                }
            }
        }
    },
    buyRealEstate: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var downPayment = APP.currentDeal.downPayment;
        var arr = player.realEstateAssets;

        if (downPayment <= player.cash) {
            player.cash -= downPayment;
            //player.assetIncome += APP.currentDeal.cashFlow;

            APP.currentDeal.id = this.newId();

            arr.push(JSON.parse(JSON.stringify(APP.currentDeal)));

            APP.finishTurn();
        } else if (downPayment > player.cash) {
            this.loanOffer(downPayment);
        }
    },
	newId: function(){
		return Math.round(Math.random() * (9999999-1000000) + 1000000);
	},
    sellAsset: function () {
        //Settlement = Sales Price – RE Mortgage
        var player = APP.players[APP.currentPlayerArrPos()];
        var assetArr = player.realEstateAssets;
		var coinArr = player.coinAssets;
		
		if (player.debt == true){
			player.cash += APP.currentSettlement;
			player.assetIncome -= APP.currentSettlementCashFlow;
			//--temp
			assetArr.splice(0, 1);
			
			$("#confirm-settlement-btn").hide();
		} else {

			$("#confirm-settlement-btn").hide();
			$("#settlement-card").hide();
			$("#show-offer-btn").hide();
		
		if (APP.currentOffer.type && (APP.currentOffer.type == "Krugerrands" || APP.currentOffer.type == "1500's Spanish")){
			var type = APP.currentOffer.type;
			var index = assetArr.findIndex(x => x.name == type);
			
			player.cash += APP.settlementOffer;
			
			coinArr.splice(index, 1);
		} else 
		
		/*if (APP.currentOffer.type == ("4-plex" || "8-plex"
            || "duplex" || "plex" || "apartment" || "bed breakfast" || "10 acres" || "20 acres" || "3Br/2Ba" || "2Br/1Ba"))*/{
			player.cash += APP.currentSettlement;
			player.assetIncome -= APP.currentSettlementCashFlow;
			
			assetArr.splice(APP.currentSettlementIndex, 1);
		}
	
        if (APP.currentOffer !== 'undefined') {
            $("#offer-card").show();
        }
        if (player.payday > 0) {
            $("#done-btn").show();
        }
		}
		
		//--temp
		$("#done-btn").show();
		
        APP.finance.statement();
    },
    buyCoin: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var cost = APP.currentDeal.cost;
		var name = APP.currentDeal.name;
        var arr = player.coinAssets;
        var index = arr.findIndex(x => x.name == name);

		// if player can afford coin, buy. if not offer loan
        if (cost <= player.cash) {
            player.cash -= cost;
            //check if player already owns coins
            if (index in arr) {
				if (cost == 500) {
                    arr[index].amount += 1;
                } else if (cost == 3000) {
                    arr[index].amount += 10;
                }
            } else { 
				arr.push(JSON.parse(JSON.stringify(APP.currentDeal)));
            }
		
			APP.finishTurn();
        } else {
            this.loanOffer(cost);
        }
		
    },
    buyBusiness: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var downPayment = APP.currentDeal.downPayment;
        var arr = player.businessAssets;
        var businessAsset = JSON.parse(JSON.stringify(APP.currentDeal));

        if (downPayment <= player.cash) {
            player.cash -= downPayment;

            var type = businessAsset.businessType;
            var tag = APP.currentDeal.landType;
            var idNum = Math.random() * (9999999-1000000) + 1000000;
            var newId = tag + idNum;
            businessAsset.id = newId;

            arr.push(businessAsset);

            APP.finishTurn();
        } else {
            this.loanOffer(downPayment);
        }
    },
    loanAmount: 1000,
    loanOffer: function (cost) {
        var player = APP.players[APP.currentPlayerArrPos()];
        const amountToCover = cost;
        this.roundLoan(amountToCover);
        const loan = this.loanAmount;

        APP.display.clearCards();
        APP.display.clearBtns();

		$("#done-btn").hide();
		$("#ft-enter-btn").hide();
		
		if (player.payday < 0){
			player.loanApproval = false;
			
			//clear cards
			APP.display.clearCards();
			APP.display.clearBtns();
			
			// if the player has no assets to sell they lose the game, else 
				console.log("checking bankruptcy..." + "arr lengths: " + player.realEstateAssets.length + player.businessAssets.length + player.coinAssets.length + player.stockAssets.length);
			
			if ((player.realEstateAssets.length && player.businessAssets.length && player.coinAssets.length && player.stockAssets.length) == -1) {
				$("#bankrupt-game-over-card").show();
				
				// continue button
			} else {				
			    player.debt = true;
				
				APP.display.renderAssetTable();

				$("#bankrupt-card").show();
				$("#br-cash-flow").html(String(APP.display.numWithCommas(player.payday)));
				$("#br-settlement-text").hide();
			}
			
		} else {
			player.loanApproval = true;
			
			$("#cannot-afford-loan-card").show();
			$("#borrow-offer-loan-btn").show();
			
			//remove card title color
			if (player.position === 2 % 0 || player.position === 0){
				$(".card-title").css("color", "#4E342E");
			}
			
			document.getElementById("loan-offer").innerHTML = loan;
			document.getElementById("loan-offer-monthly-payment").innerHTML =
				loan * 0.1;
			
			if (player.position === (1 || 9 || 17)) {
				$("#no-loan-btn").hide();
			} else {
				$("#no-loan-btn").show();
			}
			
			if (player.position === 19) {
				$("#no-loan-btn").hide();
			} 
			
		}
    },
    roundLoan: function (cost) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var value = cost - player.cash;
        var pay;

        if (value < 1000) {
            this.loanAmount = 1000;
        } else {
            var string = value.toString().split("");
            for (var i = 1; i < string.length; i++) {
                string[i] = 0;
            }
            string[0] = Number(string[0]) + 1;
            this.loanAmount = Number(string.join(""));
        }
    },
    getLoan: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var boardPosition = player.position;
        var downsizedAmount = player.totalExpenses;

        player.loans += this.loanAmount;
        player.cash += this.loanAmount;

        $("#cannot-afford-loan-card").hide();
        $("#borrow-offer-loan-btn").hide();
        $("#no-loan-btn").hide();

        if (boardPosition % 2 === 0 || boardPosition === 0) {
            //return to deal
            APP.display.clearCards();
            APP.display.clearBtns();
			
			$(".card-title").css("color", "#43A047");

            var dealType = APP.currentDeal.type;
			
            switch (dealType) {
                case "Stock":
                case "Mutual Fund":
				case "Preferred Stock":
                    $("#deal-card-stock").show();
                    $("#show-stock-form-btn").show();
					$("#done-buy-sell-btn").show();
                    break;
                case "Property Damage":
                    $("#deal-card-real-estate").show();
                    $("#done-btn").show();
                    break;
                case "Real Estate":
                    $("#deal-card-real-estate").show();
                    $("#buy-real-estate-btn").show();
                    $("#pass-btn").show();
					break;
                case "Coin":
                    $("#deal-coin-card").show();
                    $("#buy-coin-btn").show();
                    $("#pass-btn").show();
                case "Certificate of Deposit":
                    $("#deal-cd-card").show();
                    $("#pass-btn").show();
                    break;
                case "Company":
                    $("#deal-company-card").show();
                    $("#buy-business-btn").show();
                    $("#pass-btn").show();
                    break;
                case "Personal Loan":
                    $("#deal-personal-loan-card").show();
                    $("#pass-btn").show();
                    break;	
				default:
					$("#pass-btn").show();
					break;
            }
			
            APP.finance.statement();
			
			if (APP.currentDeal.downPayment < player.cash){
			$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
			}
        } else if (boardPosition === 19) {
            APP.display.clearCards();
            APP.display.clearBtns();
            $("#downsize-card").show();
            $("#ds-pay-button").show();
            //hide no button
            player.downsizedTurns += 3;
            APP.finance.statement();
        }
		
		if (boardPosition === 1 || boardPosition === 9 || boardPosition === 17) {
            APP.display.clearCards();
            APP.display.clearBtns();
            $("#doodad-card").show();
            $("#doodad-pay-button").show();
			
            APP.finance.statement();
        }
    },
	noLoan: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
        var boardPosition = player.position;
        var downsizedAmount = player.totalExpenses;

        $("#cannot-afford-loan-card").hide();
        $("#borrow-offer-loan-btn").hide();
        $("#no-loan-btn").hide();
		//return to card
		if (boardPosition % 2 === 0 || boardPosition === 0) {
            //return to deal
            APP.display.clearCards();
            APP.display.clearBtns();

            var dealType = APP.currentDeal.type;

            switch (dealType) {
                case "Stock":
                case "Mutual Fund":
                    $("#deal-card-stock").show();
                    $("#show-stock-form-btn").show();
					$("#done-buy-sell-btn").show();
                    break;
                case "Property Damage":
                    $("#deal-card-real-estate").show();
                    $("#done-btn").show();
                    break;
                case "Real Estate":
                    $("#deal-card-real-estate").show();
                    $("#buy-real-estate-btn").show();
                    $("#pass-btn").show();
					break;
                case "Coin":
                    $("#deal-coin-card").show();
                    $("#buy-coin-btn").show();
                    $("#pass-btn").show();
                case "Certificate of Deposit":
                    $("#deal-cd-card").show();
                    $("#pass-btn").show();
                    break;
                case "Company":
                    $("#deal-company-card").show();
                    $("#buy-business-btn").show();
                    $("#pass-btn").show();
                    break;
                case "Personal Loan":
                    $("#deal-personal-loan-card").show();
                    $("#pass-btn").show();
                    break;				
            }
			
            APP.finance.statement();
		}
		
		if (boardPosition === 19) {
            $("#no-loan-btn").hide();
		}
	},
	getTaxes: function () {
		var player = APP.players[APP.currentPlayerArrPos()];
		var taxes = player.jobTitle[3];
	
		if (6875 < player.totalIncome && player.totalIncome < 13084) {
			taxes = player.totalIncome * .24;		
		} else if (13084 < player.totalIncome && player.totalIncome < 16667) {
			taxes = player.totalIncome * .32;
		} else if (16667 < player.totalIncome && player.totalIncome < 41667) {
			taxes = player.totalIncome * .35;
		} else if (41667 < player.totalIncome) {
			taxes = player.totalIncome * .37;
		}	else {
			taxes = player.totalIncome * .22;
		}				
		
		player.jobTitle[3] = Math.round(taxes);
		return Math.round(taxes);
	},
	getInsurance: function(player) {
		//player income 
		var curPlayer = APP.players[player];
		var income = this.getIncome(player);
		
		//pay a base 8% and 1% for every dependent
		curPlayer.insurance = Math.round(income * (0.08 + (0.01 * APP.players[player].children)));
		
		return curPlayer.insurance;
	}
};

APP.loadCard = function (boardPosition) {
    var playerObj = APP.players[APP.currentPlayerArrPos()];
    //hide turn instructions
    $("#turn-instructions").hide();
    $("#ft-turn-instructions").hide();
    $("#repay-borrow-btns").hide();
    $("#roll-btn").hide();
    $("#roll2-btn").hide();
    $("#ft-roll-btn").hide();
    $("#ft-roll2-btn").hide();
    $("#end-turn-btn").hide();
    $("#ft-end-turn-btn").hide();
    $("#confirm-pay-btn").hide();
    $("#ft-enter-btn").hide();
    $("#fast-track-intro-card").hide();
	
	APP.checkBankruptcy();

    if (playerObj.fastTrack == true) {
        var currentSquare = "square" + String(boardPosition);
		var doodadTitle = document.getElementById("ft-doodad-title");
		var doodadText = document.getElementById("ft-doodad-text");
		
		// show fast track finance statement
        switch (boardPosition) {
            // Doodads
            case 1:
				$("#ft-doodad-card").show();
				$("#ft-doodad-roll-btn").show();
                //--temp
                //$("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				doodadTitle.innerHTML = FASTTRACK.square.doodad1.title;
				doodadText.innerHTML = FASTTRACK.square.doodad1.text;
				break;
            case 7:
				$("#ft-doodad-card").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				
				doodadTitle.innerHTML = FASTTRACK.square.doodad2.title;
				doodadText.innerHTML = FASTTRACK.square.doodad2.text;
				
				FASTTRACK.doodad(boardPosition);
				break;
            case 14:
				$("#ft-doodad-card").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				
				FASTTRACK.doodad(boardPosition);
				
				doodadTitle.innerHTML = FASTTRACK.square.doodad3.title;
				doodadText.innerHTML = FASTTRACK.square.doodad3.text;
				break;
            case 21:
				$("#ft-doodad-card").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				
				FASTTRACK.doodad(boardPosition);
				
				doodadTitle.innerHTML = FASTTRACK.square.doodad4.title;
				doodadText.innerHTML = FASTTRACK.square.doodad4.text + " - " + FASTTRACK.square.square21.lowestAsset;				
				break;
            case 27:
				$("#ft-doodad-card").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				
				FASTTRACK.doodad(boardPosition);
				
				doodadTitle.innerHTML = FASTTRACK.square.doodad5.title;
				doodadText.innerHTML = FASTTRACK.square.doodad5.text;
				break;
            case 34:
                $("#ft-doodad-card").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#D32F2F");
				
				FASTTRACK.doodad(boardPosition);
				
				doodadTitle.innerHTML = FASTTRACK.square.doodad6.title;
				doodadText.innerHTML = FASTTRACK.square.doodad6.text;
                break;
			// CashFlow Day
            case 10:
            case 18:
            case 30:
            case 38:
                $("#ft-cashflow-day").show();
                $("#ft-end-turn-btn").show();
                break;
			// Charity
            case 2:
                $("#charity-card").show();
                $("#charity-donate-btn").show();
                $("#ft-end-turn-btn").show();
				$(".card-title").css("color", "#00BCD4");
                break;
			// Opportunities
            case 17:
                $("#ft-opp-card").show();
                $("#ft-deal-cash-flow-row").show();
                $("#ft-deal-retun-row").hide();
				$("#ft-opp-buy-btn").hide();
				
				$("#ft-opp-roll").show();
                $("#ft-pass-btn").show();
				
				$(".card-title").css("color", "#43A047");

                $("#ft-opp-title").html(FASTTRACK.square[currentSquare].title);
                $("#ft-card-text").html(FASTTRACK.square[currentSquare].text);
                $("#ft-deal-return").html(FASTTRACK.square[currentSquare].returnText);
                $("#ft-deal-cash-flow").html(FASTTRACK.square[currentSquare].cashFlowText);
                break;
            case 23:
                $("#ft-opp-card").show();
                $("#ft-deal-cash-flow-row").hide();
                $("#ft-deal-retun-row").show();
				$("#ft-opp-buy-btn").hide();
				
				$("#ft-opp-roll").show();
                $("#ft-pass-btn").show();
				
				$(".card-title").css("color", "#43A047");

                $("#ft-opp-title").html(FASTTRACK.square[currentSquare].title);
                $("#ft-card-text").html(FASTTRACK.square[currentSquare].text);
                $("#ft-deal-return").html(FASTTRACK.square[currentSquare].returnText);
                $("#ft-deal-cost").html(FASTTRACK.square[currentSquare].costText);
                break;
            case 33:
                $("#ft-opp-card").show();
                $("#ft-deal-cash-flow-row").hide();
                $("#ft-deal-retun-row").show();
				$("#ft-opp-buy-btn").hide();
				
				$("#ft-opp-roll").show();
                $("#ft-pass-btn").show();
				
				$(".card-title").css("color", "#43A047");

                $("#ft-opp-title").html(FASTTRACK.square[currentSquare].title);
                $("#ft-card-text").html(FASTTRACK.square[currentSquare].text);
                $("#ft-deal-return").html(FASTTRACK.square[currentSquare].returnText);
                $("#ft-deal-cost").html(FASTTRACK.square[currentSquare].costText);
                break;
			case 24:
				$("#ft-opp-card").show();
				$("#ft-deal-cash-flow-row").hide();
                $("#ft-deal-return-row").hide();
                $("#ft-pass-btn").show();
				$("#ft-dream-roll-btn").show();
				$(".card-title").css("color", "#43A047");

                $("#ft-opp-title").html(FASTTRACK.square[currentSquare].title);
                $("#ft-card-text").html(FASTTRACK.square[currentSquare].text);
                $("#ft-deal-cost").html(FASTTRACK.square[currentSquare].costText);	
				break;
            default:
                $("#ft-opp-card").show();
                $("#ft-deal-cash-flow-row").show();
                $("#ft-deal-return-row").hide();
				$("#ft-opp-buy-btn").show();
                $("#ft-pass-btn").show();
				$(".card-title").css("color", "#43A047");

                $("#ft-opp-title").html(FASTTRACK.square[currentSquare].title);
                $("#ft-card-text").html(FASTTRACK.square[currentSquare].text);
                $("#ft-deal-cash-flow").html(FASTTRACK.square[currentSquare].cashFlowText);
                $("#ft-deal-cost").html(FASTTRACK.square[currentSquare].costText);	

				/*if (FASTTRACK.square[currentSquare].cost <= playerObj.cash){
					$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				}	*/
                break;
        }
    } else if (playerObj.fastTrack == false){
        //opportunity
        if (boardPosition % 2 === 0 || boardPosition === 0) {
            // if mixed deal option is on 
            $("#opp-card").show();

            $("#card-btns").show();
            $("#small-deal-btn").show();
            $("#big-deal-btn").show();
			
			//highlight title
			$(".card-title").css("color", "#43A047");
        }

        // doodad aka expense
        if (boardPosition === 1 || boardPosition === 9 || boardPosition === 17) {
            $("#doodad-card").show();
            $("#doodad-pay-button").show();
            APP.getDoodad();
			
			//highlight title
			$(".card-title").css("color", "#D32F2F");
        }

        //offer
        if (boardPosition === 7 || boardPosition === 15 || boardPosition === 23) {
            $("#offer-card").show();
            $("#done-btn").show();
            APP.getOffer();
			
			//highlight title
			$(".card-title").css("color", "#0277BD");
        }

        //paycheck
        if (boardPosition === 5 || boardPosition === 13 || boardPosition === 21) {
			if (OPTIONS.paycheckDoodads.checked == true){
				$("#doodad-card").show();
				$("#doodad-pay-button").show();
				APP.getDoodad();
			
			//highlight title
			$(".card-title").css("color", "#D32F2F");
			} else {
				this.finishTurn();
			}
        }

        //charity
        if (boardPosition === 3) {
            $("#charity-card").show();
            $("#charity-donate-btn").show();
            $("#pass-btn").show();
			
			//highlight title
			$(".card-title").css("color", "#00BCD4");
        }

        //kid
        if (boardPosition === 11) {
            $("#kid-card").show();
            $("#done-btn").show();
            var expense = Math.round(parseInt(playerObj.totalIncome) * 0.056);
            var eTable = document.getElementById("expense-table");
			
			//highlight card
			//$("#turn-info").css("border", "2pt solid #FFB74D");
			//$("#turn-info").css("box-shadow", "2px 2px 4px 4px #FFB74D");
			$(".card-title").css("color", "#FFB74D");

            if (playerObj.children == 0) {
                //add row to expenses table
                $("#exp-child-row").show();
                document.getElementById("child-cost").innerHTML = expense;
                //children count ++
                playerObj.children += 1;
            } else if (playerObj.children == 3 && playerObj.kidLimit == true) {
                //keep same kid count
            } else {
                playerObj.children += 1;
            }
            var children = playerObj.children;
            var childCost = children * expense;
            playerObj.childExpense = childCost;
            document.getElementById("expenses-child").innerHTML = APP.display.numWithCommas(playerObj.childExpense);

            APP.finance.statement(APP.currentPlayerArrPos());
		
        }

        //downsize
        if (boardPosition === 19) {
            var downsizedAmount = playerObj.totalExpenses;
			//show downsize card
				$("#downsize-card").show();
				
				//highlight card
				
				$(".card-title").css("color", "#D32F2F");
				
			if (playerObj.hasInsurance == false){
				//show pay button
				$("#insured-ds").hide();
				$("#default-ds").show();
				$("#ds-pay-button").show();
				
				$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #D32F2F");
				
				document.getElementById("downsized-amt").innerHTML = APP.display.numWithCommas(downsizedAmount);
			} else {
				$("#default-ds").hide();
				$("#insured-ds").show();
				$("#done-btn").show();
				
				document.getElementById("downsized-amt2").innerHTML = APP.display.numWithCommas(downsizedAmount);
				
				playerObj.downsizedTurns += 3;
			}
			
        }
    }
};

APP.cards = {
    smallDeal: {
        mutual01: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Lower interest rates drive market and fund to strong showing.",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 30,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us30",
            shares: 0
        },
        mutual02: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Brilliant young fund manager. Everyone believes he has the Midas touch",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 20,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us20",
            shares: 0
        },
        mutual03: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Weak earnings by most companies lead to weak price of mutual fund",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 10,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us10",
            shares: 0
        },
        mutual04: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Lower interest rates drive market and fund to strong showing.",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 5,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us05",
            shares: 0
        },
        mutual05: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Powerhouse market drives strong fund's price up to record high",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 40,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us40",
            shares: 0
        },
        stock001: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Booming market leads to record share price of this home electronics seller!",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 40,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u40",
            shares: 0
        },
        stock002: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "High inflation leads to poor share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 5,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u05",
            shares: 0
        },
        stock003: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Record interest rates lead to substandard share price for this home electronics seller",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 5,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u05",
            shares: 0
        },
        stock004: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Strong market leads to strong share price for this home electronics seller",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 30,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u30",
            shares: 0
        },
        stock005: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Trade war panic leads to record low share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 1,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u01",
            shares: 0
        },
        stock006: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Weak market leads to sagging share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 10,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u10",
            shares: 0
        },
        stock007: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Fast growing seller of home electronics headed by 32 year old Harvard grad.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 20,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u20",
            shares: 0
        },
        stock008: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Low interest rates lead to substantial share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 30,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u30",
            shares: 0
        },
        stock101: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Market strength leads to high share price for this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 40,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock102: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Low inflation leads to high share price for this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u20",
            shares: 0
        },
        stock103: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Booming market raises share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 50,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u50",
            shares: 0
        },
        stock104: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Interest rates cripple share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 5,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u05",
            shares: 0
        },
        stock105: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "High interest rates cause poor share price of this long time make of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock106: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Inflation worries cause poor share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock107: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Market panic causes crash in the shares of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 1,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u01",
            shares: 0
        },
        stock108: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Long time maker of medicines; especially drugs for people of 70.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u30",
            shares: 0
        },
        stock201: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office hit by children's division casuses record share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 40,
            range: "$5 to $40",
            dividend: false,
            id: "on2u40",
            shares: 0
        },
        stock202: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Strong demand for company's library of old movies on video leads to good share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "on2u30",
            shares: 0
        },
        stock203: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "New director of movie acquisitions brings revived prospects for share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "on2u20",
            shares: 0
        },
        stock204: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Movie buyer fired after third mega-flop! Shares sink. Chairman's bonus canceled.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 5,
            range: "$5 to $40",
            dividend: false,
            id: "on2u05",
            shares: 0
        },
        stock205: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office smash hit in adult division causes strong share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "on2u30",
            shares: 0
        },
        stock206: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Recent merger strengthened market share of this leading company with good outlook.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "on2u20",
            shares: 0
        },
        stock207: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Newest theme park loses record amount. Share price hits all-time low.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 1,
            range: "$5 to $40",
            dividend: false,
            id: "on2u01",
            shares: 0
        },
        stock208: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office flop by musical extravaganza in core division causes poor share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "on2u10",
            shares: 0
        },
        stockSplit1: {
            type: "Stock Split",
            name: "MYT4U Electronics Co.",
            description: "Business is up dramatically and the company is doing so well their shares haave just split!",
            rule: "Everyone who owns MYT4U shares doubles the number of shares they own.",
            symbol: "MYT4U"
        },
        stockSplit2: {
            type: "Reverse Split",
            name: "MYT4U Electronics Co.",
            description: "Company reorganizes! Massive loses due to over expansion and recession. Stockholders lose 1/2 of their ownership rights.",
            rule: "Everyone who owns MYT4U shares cuts shares owned to 1/2 previous value.",
            symbol: "MYT4U"
        },
        stockSplit3: {
            type: "Stock Split",
            name: "OK4U Drug Co.",
            description: "Things are going so well for the company that their shares have just split!",
            rule: "Everyone who owns OK4U shares doubles the number of shares they own.",
            symbol: "OK4U"
        },
        stockSplit4: {
            type: "Reverse Split",
            name: "OK4U Drug Co.",
            description: "Company flounders! Massive losses due to tainted drug scandal. All stockholders lose 1/2 of their ownership rights.",
            rule: "Everyone who owns OK4U shares cuts shares owned to 1/2 previous value.",
            symbol: "OK4U"
        },
		preferredStock1: {
          type: "Preferred Stock",
          name: "2BIG Power",
          description: "High yield, preferred shares of major domestic electric power company. Dividend and price fixed at \"fair\" level by state utility commission.",
          rule: "Everyone may buy or sell as many shares as they wish at this time.",
          symbol: "2BIG",
          dividend: 30,
          price: 1200,
          tradingRange: "$1,200 to $1,200",
          id: "2big",
          shares: 0
        },
        preferredStock2: {
          type: "Preferred Stock",
          name: "1GLOBE Oil",
          description: "Moderate yield, preferred shares of major international biotech company. Dividend and price fixed at \"fair\" level by state utility commission.",
          rule: "Everyone may buy or sell as many shares as they wish at this time.",
          symbol: "1GLO",
          dividend: 15,
          price: 1000,
          tradingRange: "$1,200 to $1,200",
          id: "1globe",
          shares: 0
        },
        realEstateS1: {
            type: "Real Estate",
            name: "You Find a Great Deal!",
            description: "Older 3/2 house, repossessed by government agency. Ready to go with government financing and a tenant.",
            rule: "Borrow from the Bank if you must, but... BUY THIS! 132% ROI, may sell for $65,000 to $135,000.",
            roi: 1.32,
            cost: 35000,
            downPayment: 2000,
            mortgage: 33000,
            cashFlow: 220,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS2: {
            type: "Real Estate",
            name: "Condo for Sale - 2 Br/1 Ba",
            description: "Nice 2/1 condo available due to marriage of owner. Bad area. Needs work.",
            rule: "Use this yourself or sell to another player. 24% ROI, may sell for $45,000 to $65,000.",
            roi: 0.24,
            cost: 50000,
            downPayment: 5000,
            mortgage: 45000,
            cashFlow: 100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS3: {
            type: "Real Estate",
            name: "Condo For Sale - 2 Br/1 Ba",
            description: "Parents selling 2/1 condo used by their chil in college town. Lots of demand for rentals in this area.",
            rule: "Use this yourself or sell to another player. 42% ROI, may sell for $45,000 to $65,000.",
            roi: 0.42,
            cost: 40000,
            downPayment: 4000,
            mortgage: 36000,
            cashFlow: 140,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS4: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Older 2/1 condo offered by young couple who want to move up to a 3/2 house due to growing family. Available soon.",
            rule: "Use this yourself or sell to another player. 38% ROI, may sell for $45,000 to $65,000.",
            roi: 0.38,
            cost: 50000,
            downPayment: 5000,
            mortgage: 45000,
            cashFlow: 100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS5: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Excellent 2/1 condo with many extras. For sale due to business success of owner. She's moving up, so can you.",
            rule: "Use this yourself or sell to another player. -24% ROI, may sell for $45,000 to $65,000.",
            roi: -0.24,
            cost: 60000,
            downPayment: 5000,
            mortgage: 55000,
            cashFlow: -100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS6: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Bank foreclosure! 2/1 condo in desirable neighborhood close to jobs and stores. Make offer, favorable financing by bank.",
            rule: "Use this yourself or sell to another player. 53% ROI, may sell for $45,000 to $65,000",
            roi: 0.53,
            cost: 40000,
            downPayment: 5000,
            mortgage: 35000,
            cashFlow: 220,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS7: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Not lived in for 6 months, this bank-foreclosed house just reduced. Loan includes estimated repair costs.",
            rule: "Use this yourself or sell to another player. May sell for $65,000 to $135,000.",
            roi: 0,
            cost: 50000,
            downPayment: 0,
            mortgage: 50000,
            cashFlow: 100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS8: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Low down payment to pick up this 3/2 house. Owner/seller unexpectedly moving out of town. Right person will do well.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 50000,
            downPayment: 3000,
            mortgage: 47000,
            cashFlow: 100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS9: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "3/2 house in older area offered by Highway Department. Market has crashed. No bids at last week's auction.",
            rule: "Use this yourself or sell to another player. ??% ROI, may sell for $65,000 to $135,000.",
            cost: 50000,
            downPayment: 0,
            mortgage: 50000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS10: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 rental house suddenly available due to estate closing. Well maintained older property with existing tenant.",
            rule: "Use this yourself or sell to another player. 38% ROI, may sell for $65,000 to $135,000.",
            roi: 0.38,
            cost: 65000,
            downPayment: 5000,
            mortgage: 60000,
            cashFlow: 160,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS11: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 house available in depressed market due to layoffs. Would make good investment property for right buyer.",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $65,000 to $135,000.",
            roi: 0.6,
            cost: 50000,
            downPayment: 4000,
            mortgage: 46000,
            cashFlow: 200,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS12: {
            name: "You Find a Great Deal!",
            type: "Real Estate",
            description: "Company bought transferred manager's 3/2 house. No current tenant, has been on market 6 months, just reduced.",
            rule: "Borrow from the Bank if you must, but... BUY THIS! 150% ROI, may sell for $65,000 to $135,000.",
            roi: 1.5,
            cost: 50000,
            downPayment: 4000,
            mortgage: 46000,
            cashFlow: 200,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS13: {
            name: "10 Acres Raw Land",
            type: "Real Estate",
            description: "Wonderful park-like setting with stream on 10 acres in undeveloped area. No roads, no utilities, no noise.",
            rule: "Use this yourself or sell to another player. 0% ROI, possible future sale at ??.",
            roi: 0,
            cost: 5000,
            downPayment: 5000,
            mortgage: 0,
            cashFlow: 0,
            tag: "10 acres",
            landType: "10 acres"
        },
		propertyDamage: {
            name: "Tenant Damages Your Property",
            type: "Property Damage",
            description: "Tenant fails to pay rent for 2 months and then skips town leaving damage to your rental property. Insurance covers most damage and costs, but you are still out of pocket $500.",
            rule: "Pay $500 if you own any rental property",
            propertyType: "rental",
			landType: "rental",
            cost: 500
        },
        coin1: {
            type: "Coin",
            name: "1500's Spanish",
            title: "Rare Gold Coin",
            description: "You spot an unusual 1500's Royal Spanish New World (Havana Mint Only) \"pieces of eight\" gold coin in good condition at a swap meet. One only, seller asks $500.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for $0 to $4,000.",
            roi: 0,
            cost: 500,
            downPayment: 500,
            liability: 0,
            cashFlow: 0,
            amount: 1
        },
        coin2: {
            type: "Coin",
            name: "Krugerrands",
            title: "Friend Needs Cash... Quick",
            description: "A friend has urgent need for money. Will sell you 10 one-ounce gold Krugerrands, well below going rate, for $300 each.",
            rule: "Use this yourself or sell to another player. 0% ROI, possible future sale at ??",
            roi: 0,
            cost: 3000,
            downPayment: 3000,
            liability: 0,
            cashFlow: 0,
            amount: 10
        },
		/*cd1: {
          type: "Certificate of Deposit",
          name: "Certificate of Deposit",
          description: "A leading bank offers this special Certificate of Deposit to its customer. Guaranteed interest and redeemable after any holding period.",
          rule: "Everyone may buy or sell as many as they wish at this time.",
          symbol: "CD",
          interest: 20,
          price: 5000,
          tradingRange: "$5,000 to $5,000"
        },
        cd2: {
          type: "Certificate of Deposit",
          name: "Certificate of Deposit",
          description: "A leading bank offers this special Certificate of Deposit to its customer. Guaranteed interest and redeemable after any holding period.",
          rule: "Everyone may buy or sell as many as they wish at this time.",
          symbol: "CD",
          interest: 20,
          price: 4000,
          tradingRange: "$5,000 to $5,000"
        },*/
        companyS1: {
            type: "Company",
            name: "Start a Company Part Time",
            description: "Develop interesting idea for a software program, so you start a company to produce and sell it. No profits during startup, long hours, no extra pay.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for ??, if anything.",
            roi: 0,
            cost: 5000,
            downPayment: 5000,
            liability: 0,
            cashFlow: 0,
            tag: "SOFTWARE",
            landType: "business",
            businessType: "software"
        },
        companyS2: {
            type: "Company",
            name: "Start a Company Part Time",
            description: "Invent new way of making widgets, so you start a company to produce and sell them. No profits during startup, long hourse, no extra pay.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for ??, if anything.",
            roi: 0,
            cost: 3000,
            downPayment: 3000,
            liability: 0,
            cashFlow: 0,
            tag: "WIDGET",
            landType: "business",
            businessType: "widget"
        }
        
    },
    bigDeal: {
        realEstateB1: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Reinvesting owner offers 8-plex for sale at reasonable price. Financing already in place. All it needs is your down payment.",
            rule: "Use this yourself or sell to another pl;ayer. 51% ROI, may sell for $200,000 to $280,000.",
            roi: 0.51,
            cost: 220000,
            downPayment: 40000,
            mortgage: 180000,
            cashFlow: 1700,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB2: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            decription: "Divorce leads to sale of this 3/2 house in an area full of owner occupied homes. Has been on the market 5 months.",
            rule: "Use this yourself or sell to another player. 30% ROI, may sell for $65,000 to $135,000.",
            roi: 0.3,
            cost: 70000,
            downPayment: 20000,
            mortgage: 50000,
            cashFlow: 500,
            tag: "3Br/2ba",
            landType: "3Br/2Ba"
        },
        realEstateB3: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Good investment potential in this 3/2 house if you can be patient. Positive cash flow even though rents are weak.",
            rule: "Use this yourself or sell to another player. 45% ROI, may sell for $65,000 to $135,000.",
            roi: 0.45,
            cost: 65000,
            downPayment: 8000,
            mortgage: 57000,
            cashFlow: 300,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB4: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex available - forced sale. Out-of-state, financially distressed owner years behind on taxes. Some records available.",
            rule: "Use this yourself or sell to another player. 56% ROI, may sell for $100,00 to $140,000.",
            roi: 0.56,
            cost: 80000,
            downPayment: 16000,
            mortgage: 64000,
            cashFlow: 750,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB5: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Professional person urgently needs cash to save partnership. 8-plex sale to raise capital, good opportunity for right person.",
            rule: "Use this yourself or sell to another player. 64% ROI, may sell for $200,000 to $280,000.",
            roi: 0.64,
            cost: 16000,
            downPayment: 32000,
            mortgage: 128000,
            cashFlow: 1700,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB6: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "Successful 4 bay coin operated auto wash near busy intersection. Seller is moving to retirement community out of state.",
            rule: "Use this yourself or sell to another player. 86% ROI. No other buyers in sight.",
            roi: 0.86,
            cost: 125000,
            downPayment: 25000,
            liability: 100000,
            cashFlow: 1800,
            tag: "CarWash",
            landType: "car wash"
        },
        realEstateB7: {
            name: "20 Acres for Sale",
            type: "Real Estate",
            description: " 20 acres of vacant land, currently zoned residential. Possibly of good appreciation if rezoned commercial.",
            rule: " Use this yourself or sell to another player. 0% ROI, may sell for ??.",
            roi: 0,
            cost: 20000,
            downPayment: 20000,
            mortgage: 0,
            cashFlow: 0,
            tag: "20Acres",
            landType: "20 acres"
        },
        realEstateB8: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Retiring investor/owner offers his 8-plex at current appraisal value. Professional lawn service and management. Full records.",
            rule: "Use this yourself or sell to another player. 29% ROI, may sell for $200,000 to $280,000.",
            roi: 0.29,
            cost: 240000,
            downPayment: 40000,
            mortgage: 200000,
            cashFlow: 950,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB9: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: '"Project" 4-plex for sale in rehabilitating neighborhood. Owner being forced out by income tax liens.',
            rule: "Use this yourself or sell to another player. 24% ROI, may sell for $100,000 to $140,000.",
            roi: 0.24,
            cost: 80000,
            downPayment: 20000,
            mortgage: 60000,
            cashFlow: 400,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB10: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "Older 4-plex next to new highway for sale. Owner/occupant moving to wuieter area. Priced for quick sale.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $100,000 to $140,000.",
            roi: 0.4,
            cost: 90000,
            downPayment: 15000,
            mortgage: 75000,
            cashFlow: 500,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB11: {
            name: "Pizza Franchise for Sale",
            type: "Real Estate",
            description: "Healthy-pizza company franchise. Trend in nutritious fast-food booming. Next to college. High Traffic",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $500,000 to $800,000.",
            roi: 0.6,
            cost: 500000,
            downPayment: 100000,
            mortgage: 400000,
            cashFlow: 5000,
            tag: "PIZZA",
            landType: "franchise"
        },
        realEstateB12: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Duplex owner must sell to pay hospital bills. Two tenants in place, all records, good investment oppurtunity.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $50,000 to $80,000.",
            roi: 0.4,
            cost: 60000,
            mortgage: 48000,
            downPayment: 12000,
            cashFlow: 400,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB13: {
            name: "Bed & Breakfast for Sale",
            type: "Real Estate",
            description: "Owner retiring, wants out NOW. Great clientele in resort community. 5Br/3Ba.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $100,000 to $300,000.",
            roi: 0.4,
            cost: 150000,
            mortgage: 120000,
            downPayment: 30000,
            cashFlow: 1000,
            tag: "Bed&Br",
            landType: "bed breakfast"
        },
        realEstateB14: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "3/2 house on golf course offers potential capital gain plus current cash flow. Good rentals and nice financing.",
            rule: "Use this yourself or sell to another player. 51% ROI, may sell for $65,000 to $135,000.",
            roi: 0.51,
            cost: 75000,
            mortgage: 68000,
            downPayment: 32000,
            cashFlow: 2000,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB15: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Tenants in place at this investment duplex! Owner has income tax problems, needs to sell quickly.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $50,000 to $80,000.",
            roi: 0.48,
            cost: 45000,
            mortgage: 37000,
            downPayment: 8000,
            cashFlow: 320,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB16: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex for sale by owner, moving to another state. Full records, fully rented, low occupant turnover in good neighborhood.",
            rule: "Use this yourself or sell to another player. 75% ROI, may sell for $100,000 to $140,000.",
            roi: 0.75,
            cost: 140000,
            downPayment: 32000,
            mortgage: 108000,
            cashFlow: 2000,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB17: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Businessman liquidating this 3/2 house, needs cash to save his business. Currently occupied by happy tenant.",
            rule: "Use this yourself or sell to another player. 26% ROI, may sell for $65,000 to $135,000.",
            roi: 0.26,
            cost: 65000,
            mortgage: 58000,
            downPayment: 7000,
            cashFlow: 150,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB18: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Still level 3/2 house on out of way golf course offered by heirs of owner. Gold membership included.",
            rule: "Use this yourself or sell to another player. -12% ROI, may sell for $65,000 to $150,000.",
            roi: -0.12,
            cost: 115000,
            mortgage: 105000,
            downPayment: 10000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB19: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 house with in ground pool and full appliances available in upper middle class area. Good schools.",
            rule: "Use this yourself or sell to another player. -6% ROI, may sell for $65,000 to $150,000.",
            roi: -0.12,
            cost: 125000,
            mortgage: 105000,
            downPayment: 20000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB20: {
            name: "Apartment Houses for Sale",
            type: "Real Estate",
            description: "2 buildings totaling 24 units for sale. Owner managed with on-site assistant. Retirement prompts sale.",
            rule: "Use this yourself or sell to another player. 54% ROI, may sell for $600,000 to $960,000.",
            roi: 0.54,
            cost: 575000,
            mortgage: 500000,
            downPayment: 75000,
            cashFlow: 3400,
            unit: 48,
            tag: "2x 24u",
            landType: "apartment",
            units: 48
        },
        realEstateB21: {
            name: "Car Wash for Sale",
            type: "Real Estate",
            description: "Family car wash for sale. Family feuding. Wants out ASAP. Prime location in highgrowth area.",
            rule: "Use this yourself or sell to another player. 36% ROI, may sell for 12-25 times annual cash flow.",
            roi: 0.36,
            cost: 350000,
            mortgage: 300000,
            downPayment: 50000,
            cashFlow: 1500,
            tag: "CarWash",
            landType: "car wash"
        },
        realEstateB22: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "12 unit apartment house offered by out-of-state heirs of handyman/owner. Long waiting list for apartment in this building.",
            rule: "Use this yourself or sell to another player. 58% ROI, may sell for $300,000 to $480,000.",
            roi: 0.58,
            cost: 350000,
            mortgage: 300000,
            downPayment: 50000,
            cashFlow: 2400,
            units: 12,
            tag: "12Unit",
            landType: "apartment"
        },
        realEstateB23: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "Nice, well maintained 4-plex in good neighborhood. Stable tenants, positive cash flow, few problems. Full records.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $100,000 to $140,000.",
            roi: 0.48,
            cost: 125000,
            downPayment: 15000,
            mortgage: 110000,
            cashFlow: 600,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB24: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "60 unit complex available from pension fund that foreclosed on builder/owner. On-site management in place.",
            rule: "Use this yourself or sell to another player. 66% ROI, may sell for $1,500,000 to $2,700,000.",
            roi: 0.66,
            cost: 1200000,
            mortgage: 1000000,
            downPayment: 200000,
            cashFlow: 11000,
            units: 60,
            tag: "60Unit",
            landType: "apartment"
        },
        realEstateB25: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "This duplex is the best in the neighborhood! Proud owner retiring to another state to be near her grandchildren.",
            rule: "Use this yourself or sell to another player. 24% ROI, may sell for $50,000 to $80,000.",
            roi: 0.24,
            cost: 70000,
            mortgage: 63000,
            downPayment: 7000,
            cashFlow: 140,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB26: {
            name: "Small Shopping Mall for Sale",
            type: "Real Estate",
            description: "Bank has taken back mall from bankrupt owner. Mall is currently 50% occupied. Just listed today.",
            rule: "Use this yourself or sell to another player. 19% ROI, may sell for $35,000 to $150,000.",
            roi: 0.19,
            cost: 50000,
            mortgage: 0,
            downPayment: 50000,
            cashFlow: 800,
            tag: "MALL",
            landType: "mall"
        },
        realEstateB27: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "24 unit older building near community college available from retiring owner/builder. Fully rented, nice cash flow.",
            rule: "Use this yourself or sell to another player. 67% ROI, may sell for $600,000 to $960,000.",
            roi: 0.67,
            cost: 550000,
            mortgage: 500000,
            downPayment: 50000,
            cashFlow: 2800,
            units: 24,
            tag: "24Unit",
            landType: "apartment"
        },
        realEstateB28: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Well maintained duplex in desirable area available due to transfer of owner. Excellent investment opportunity for right buyer.",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $50,000 to $80,000.",
            roi: 0.6,
            cost: 60000,
            mortgage: 54000,
            downPayment: 6000,
            cashFlow: 300,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB29: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Downsized manager must sell this 3/2 house, cannot afford payments on new salary. Area in transition.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 70000,
            mortgage: 61000,
            downPayment: 9000,
            cashFlow: 300,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB30: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex in recovering neighborhood. Fully rented repairs kept up. Needs your down payment and patience.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $100,000 to $140,000.",
            roi: 0.48,
            cost: 100000,
            downPayment: 20000,
            mortgage: 80000,
            cashFlow: 800,
            tag: "4PLEX",
            landType: "4-plex",
            units: 4
        },
        realEstateB31: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Transferred skilled tradesman kept this 3/2 house in excellent condition, so it commands top dollar rentals in older neighborhood.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 67000,
            mortgage: 551000,
            downPayment: 12000,
            cashFlow: 400,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB32: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Owner's legal troubles lead to forced sale of this 8-plex. No qualifying on this loan, as mortgage holder is cooperating.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $200,000 to $280,000.",
            roi: 0.48,
            cost: 200000,
            downPayment: 40000,
            mortgage: 160000,
            cashFlow: 1600,
            tag: "8PLEX",
            landType: "8-plex",
            units: 8
        },
        realEstateB33: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Owner moving out of this duplex due to growing family. Tenant remains, well maintained, excellent landscaping.",
            rule: "Use this yourself or sell to another player. 36% ROI, may sell for $50,000 to $70,000.",
            roi: 0.36,
            cost: 50000,
            mortgage: 42000,
            downPayment: 8000,
            cashFlow: 240,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        limitedPartnershipB1: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Non-franchise sandwich shop doubling the number of locations. Owner needs additional equity capital to get operating loan.",
            rule: "Use this yourself or sell to another player. 60% ROI, owner may buy you out for $60,000 to $90,000.",
            roi: 0.6,
            cost: 30000,
            downPayment: 30000,
            liability: 0,
            cashFlow: 1500,
            tag: "LP-FOOD",
            landType: "limited"
        },
        limitedPartnershipB2: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Auto Dealer wants to expand into leasing 2 and 3 year old cars. Needs capital as car maker's finance company is not interested.",
            rule: "Use this yourself or sell to another player. 40% ROI, owner may buy you out for $60,000 to $90,000.",
            roi: 0.4,
            cost: 30000,
            downPayment: 30000,
            liability: 0,
            cashFlow: 1000,
            tag: "LP-Auto",
            landType: "limited"
        },
        limitedPartnershipB3: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Successful doctor expanding office and clinic. Needs partner to fund equity portion of construction costs.",
            rule: "Use this yourself or sell to another player. 48% ROI, owner may buy you out for $50,000 to $75,000.",
            roi: 0.48,
            cost: 25000,
            downPayment: 25000,
            liability: 0,
            cashFlow: 1000,
            tag: "LP-MDOffice",
            landType: "limited"
        },
        limitedPartnershipB4: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Successful pizza chain expanding into production of frozen pizzas for grocercy stores. Owner needs capital for equipment.",
            rule: "Use this yourself or sell to another player. 48% ROI, owner may buy you out for $40,000 to $60,000.",
            roi: 0.48,
            cost: 20000,
            downPayment: 20000,
            liability: 0,
            cashFlow: 800,
            tag: "LP-PIZZA",
            landType: "limited"
        },
        /*automatedBusinessB1: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "30 video/pinball machines at long term contract locations for sale by overextended owner. Owner is desperate.",
            rule: "Use this yourself or sell to another player. 96% ROI. No other buyers in sight.",
            roi: 0.96,
            cost: 100000,
            downPayment: 20000,
            liability: 80000,
            cashFlow: 1600,
            tag: "PINBALL",
            landType: "business"
        },
        automatedBusinessB2: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "Successful coin telephone business available due to death of owner. Heirs live out of state. All locations on long term contract.",
            rule: "Use this yourself or sell to another player. 81% ROI. No other buyers in sight.",
            roi: 0.81,
            cost: 200000,
            downPayment: 40000,
            liability: 160000,
            cashFlow: 2700,
            tag: "TELE",
            landType: "business"
        },
        automatedBusinessB3: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "Personal bankruptcy sale of busy, successful laundromat on busy highway. Absentee owner, contract cleaning.",
            rule: "Use this yourself or sell to another player. 81% ROI. No other buyers in sight.",
            roi: 1,
            cost: 150000,
            downPayment: 30000,
            liability: 120000,
            cashFlow: 2500,
            tag: "LAUNDRY",
            landType: "business"
        },
        */
		propertyDamage1: {
            name: "Sewer Line Breaks",
            type: "Property Damage",
            description: "Water everywhere at your 8-plex! Broken sewer line needs repair immediately. <br> If you own an 8-plex, pay $2,000 for new line. (Bank loan available on usual terms.)",
            rule: "If you own more than one 8-plex, pay repairs on only one.",
            propertyType: "8-plex",
            cost: 2000
        },
        propertyDamage2: {
            name: "Tenant Damages Your Property",
            type: "Property Damage",
            description: "Tenant refuses to pay rent after losing job. When you get him evicted you discover significant damages to your property. <br> Insurance covers most damages and costs, but you still are out of pocket $1,000. Pay $1,000",
            rule: "Pay $1,000 if you own any rental real estate",
            propertyType: "rental",
            cost: 1000
        }
    },
    offer: {
        offer1: {
            name: "Plex Buyer",
            description: "Buyer offers $30,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 30000,
            type: "plex"
        },
        offer2: {
            name: "Apartment House Buyer",
            description: "Buyer offers $25,000 per unit for all units in apartment houses of any size. Has own financing. [His 1031 tax deferred exchange time is running out.]",
            rule1: "Everyone may sell at this price.",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 25000,
            lowestUnit: 0,
            type: "apartment"
        },
        offer3: {
            name: "Apartment House Buyer",
            description: "Buyer offers $45,000 per unit for all units in apartment houses of any size. Has own financing. [His 1031 tax deferred exchange time is running out.]",
            rule1: "Everyone may sell at this price.",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 40000,
            lowestUnit: 0,
            type: "apartment"
        },
        offer4: {
            name: "Plex Buyer",
            description: "Buyer offers $35,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 35000,
            type: "plex"
        },
        offer5: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $135,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 135000,
            type: "3Br/2Ba"
        },
        offer6: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $110,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 115000,
            type: "3Br/2Ba"
        },
        offer7: {
            name: "Plex Buyer",
            description: "Buyer offers $35,000 per unit for all units. Will buy duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 35000,
            type: "plex"
        },
        offer8: {
            name: "Apartment House Buyer",
            description: "REIT offers $30,000 per unit for all units in apartment houses of 12 units or more. Has own financing. Buyer has funds from sale of complex in another city.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 30000,
            lowestUnit: 12,
            type: "apartment"
        },
        offer9: {
            name: "Plex Buyer",
            description: "Buyer offers $25,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 25000,
            type: "plex"
        },
        offer10: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $135,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 135000,
            type: "3Br/2Ba"
        },
        offer11: {
            name: "Plex Buyer",
            description: "Buyer offers $40,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 40000,
            type: "plex"
        },
        offer12: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $100,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 100000,
            type: "3Br/2Ba"
        },
        offer13: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $45,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 45000,
            type: "2Br/1Ba"
        },
        offer14: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $100,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 100000,
            type: "3Br/2Ba"
        },
        offer15: {
            name: "Plex Buyer",
            description: "Buyer offers $30,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 30000,
            type: "plex"
        },
        offer16: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $65,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 65000,
            type: "2Br/1Ba"
        },
        offer17: {
            name: "Plex Buyer",
            description: "Buyer offers $25,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 25000,
            type: "plex"
        },
        offer18: {
            name: "Plex Buyer",
            description: "Buyer offers $35,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 35000,
            type: "plex"
        },
        offer19: {
            name: "House Buyer - 3Br/2Ba",
            description: "You are offered $65,000 for a 3/2 rental house. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 65000,
            type: "3Br/2Ba"
        },
        offer20: {
            name: "Plex Buyer",
            description: "Buyer offers $30,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 30000,
            type: "plex"
        },
        offer21: {
            name: "Plex Buyer",
            description: "Buyer offers $40,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 40000,
            type: "plex"
        },
        offer22: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $55,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 55000,
            type: "2Br/1Ba"
        },
        offer23: {
            name: "Plex Buyer",
            description: "Buyer offers $40,000 per unit for all units in any combination of duplexes, 4-plexes, or 8-plexes. Has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 40000,
            type: "plex"
        },
        offer24: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $55,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 55000,
            type: "2Br/1Ba"
        },
        offer25: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $55,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 55000,
            type: "2Br/1Ba"
        },
        offer26: {
            name: "Condo Buyer - 2Br/1Ba",
            description: "You are offered $45,000 for a 2/1 rental condo. Buyer has own financing.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 45000,
            type: "2Br/1Ba"
        },
        offer27: {
            name: "Apartment House Buyer",
            description: "Buyer offers $40,000 per unit for all units in apartment houses of any size. Has own financing. Buyer has funds from sale of complex in another city.",
            rule1: "Everyone may sell at this price",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offerPerUnit: 40000,
            lowestUnit: 0,
            type: "apartment"
        },
        /*offer28: {
	
          name: "House Buyer - 3Br/2Ba",
          description: "Your brother-in-law lost his job and wants to buy your 3/2 rental house. He promises to pay you $100,000 four years from now, but has no income or savings. He can pay a small monthly amount, but no down payment...",
          rule1: "",
          rule2:
            "If you sell at his terms, your cash flow goes down by $500 per month, until you collect the $100,000",
          offer: 100000,
          cashFlow: -500,
          type: "3Br/2Ba"
        },*/
        offer29: {
            name: "Limited Partnership Sold",
            type: "limited",
            description: "The business has been sold and you receive twice your original cost for your share of it.",
            rule1: "You agreed to sell if and when the founder sold out, as they just did. New owners have their own financing.",
            rule2: "Every limited partnership is affected. If you own a limited partnership, receive cash and reduce your cash flows immediately."
        },
        offer30: {
            name: "Limited Partnership Sold",
            type: "limited",
            description: "The business has been sold and you receive twice your original cost for your share of it.",
            rule1: "You agreed to sell if and when the founder sold out, as they just did. New owners have their own financing.",
            rule2: "Every limited partnership is affected. If you own a limited partnership, receive cash and reduce your cash flows immediately."
        },
        offer31: {
            name: "Limited Partnership Sold",
            type: "limited",
            description: "The business has been sold and you receive twice your original cost for your share of it.",
            rule1: "You agreed to sell if and when the founder sold out, as they just did. New owners have their own financing.",
            rule2: "Every limited partnership is affected. If you own a limited partnership, receive cash and reduce your cash flows immediately."
        },
        offer32: {
            name: "Small Business Improves",
            type: "business",
            description: "The small business you founded has found a major company to distribute its product. Your sales increase 150%.",
            rule1: "This brings more problems and requires more time from you, but Monthly Net Income goes up $400.",
            rule2: "Everyone who owns a business they started is affected and increases their cash flow by $400 per month on all such businesses.",
            cashFlow: 400
        },
        offer33: {
            name: "Small Business Improves",
            type: "business",
            description: "The small business you founded won an industry award for its product innovation. Great publicity causes your sales to double.",
            rule1: "This requires more time from you, but Monthly Net Income goes up $250.",
            rule2: "Everyone who owns a business they started is affected and increases their cash flow by $250 per month on all such businesses.",
            cashFlow: 250
        },
        offer34: {
            name: "Car Wash Buyer",
            description: "Red hot buyer looking for a car wash bargain. Has $250,000 cash ready to spend. That's his limit.",
            rule1: "Everyone who owns a car wash may sell at this price.",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow you currently receive on this property.",
            offer: 250000,
            type: "car wash"
        },
        offer35: {
            name: "Builder Wants Land",
            description: "City planners require builder to put in 10 acre park or they will not approve new subdivision. Builder needs 10 acres with stream.",
            rule1: "Cash offer of $150,000 to everyone who owns such a property.",
			rule2: "",
            offer: 150000,
            type: "10 acres"
        },
        offer36: {
            name: "Demand for Bed & Breakfast",
            description: "Couple burned out from their corporate jobs are ready for a change. Have lots of cash. Looking for a profitable Bed & Breakfast. They will pay $250,000 today.",
            rule1: "Everyone with a Bed & Breakfast that is making money may sell at this price.",
            rule2: "If you sell, pay off the related mortgage and give up the cash flow currently receive on this property.",
            offer: 250000,
            type: "bed breakfast"
        },
       /* offer37: {
            name: "Inflation Hits!",
            description: "Infaltion goes to 10%. Interest rates climb to 20% on home loans.",
            rule1: "All 3Br/2Ba rental houses that you (no  other players) own are now in foreclosure. You financed with variable rate mortgages. You must give your 3Br/2Ba house(s) back to the bank. You lose your cash flow from the properties.",
            rule2: "",
            cashFlow: 0,
            type: "3Br/2Ba-"
        },*/
        offer38: {
            name: "Software Company Buyer",
            description: "Large integrated software company offers $100,000 cash for inventive software program and related company.",
            rule1: "Anyone who owns a software company may sell at this price.",
            rule2: "If you sell, give up the cash flow you currently receive from this company.",
            offer: 100000,
            type: "software"
        },/*
        offer39: {
            name: "Interest Rates Drop!",
            description: "Interest rates on home loans drop to 5%.",
            rule1: "If you (no other players) own any 3Br/2Ba rental houses you may sell them for $50,000 more than the original cost.",
            rule2: "If you sell, pay off the mortgage and give up the cash flow you currently receive on each property.",
            valueIncrease: 50000,
            type: "3Br/2Ba+"
        },*/
        offer40: {
            name: "Shopping Mall Wanted",
            description: "Major retailer is moving to you town. Looking for small shopping mall to purchase.",
            rule1: "They are ready to pay $100,000 to everyone who owns a small shopping mall.",
            rule2: "If you sell, give up the cash flow you currently receive from this property.",
            offer: 100000,
            type: "mall"
        },
        offer41: {
            name: "Buyer for 20 Acres",
            description: "Builder wants a 20-acre parcel of land. He will re-zone it from residential to commercial.",
            rule1: "Cash offer of $200,000 to everyone who owns 20 acres of residential land.",
            rule2: "If you sell, give up the cash flow you currently receive from this property.",
            offer: 200000,
            type: "20 acres"
        },
        offer42: {
            name: "Widget Company Buyer",
            type: "widget",
            description: "Engineer/Inventor who owns machinery company offers $50,000 cash for inventive method of making widgets.",
            rule1: "Anyone who owns a widget company may sell at this price.",
            rule2: "If you sell, give up the cash flow you currently receive from this company.",
            offer: 50000
        },
        offer43: {
            name: "Price of Gold Soars",
            type: "Krugerrands",
            description: "Rioting in Middle East. Oil prices threatened. Price of gold skyrockets to $600 per ounce.",
            rule1: "Everyone who owns 1 ounce Krugerrands may sell at this price.",
            rule2: "",
            offer: 600
        },
        offer44: {
            name: "Collector Wants Gold Coins",
            type: "1500's Spanish",
            description: 'Collector looking for authentic 1500\'s Royal Spanish New World (Havana mint only) "pieces of eight " gold coins.',
            rule1: "Cash offer of $5,000 foor each coin to everyone.",
            rule2: "",
            offer: 5000
        }
    },
	doodad: {
        doodad1: {
            name: "Water Heater Leaks",
            cost: 450,
            text: "Pay $450 for a new one"
        },
        doodad2: {
            name: "Go Out to Dinner",
            cost: 80,
            text: "Spend $80"
        },
		doodad3: {
          name: "New Boat!",
          cost: 1000,
          text: "Pay $1,000 down and $17,000 on time.",
          loan: 17000,
          payment: 340
        },
        doodad4: {
            name: "Go Out to Dinner",
            cost: 80,
            text: "Spend $80"
        },
        doodad5: {
            name: "Park in Handicapped Zone",
            cost: 100,
            text: "Pay $100 fine"
        },
        /*doodad6: {
          name: "Buy Big Screen TV",
          cost: 4000,
          text: "Pay $4000",
          loan: 4000,
          payment: 120
        },*/
		doodad7: {
            name: "Your Anniversary!",
            cost: 200,
            text: "Spend $200"
        },
        doodad8: {
          name: "Son's College Tuition",
          cost: 1500,
          text: "Pay $1500",
          child: true
        },
        doodad9: {
          name: "Buy Toys for Your Kids",
          cost: 50,
          text: "Spend $50",
          child: true
        },
		doodad10: {
            name: "Buy New Fishing Rod",
            cost: 100,
            text: "Pay $100"
        },
        doodad11: {
            name: "Play 2 Rounds of Golf",
            cost: 100,
            text: "Pay $100"
        },
        doodad12: {
            name: "Car's Air Conditioning Dies",
            cost: 700,
            text: "Pay $700"
        },
        doodad13: {
            name: "Tax Audit",
            cost: 350,
            text: "Pay Tax Authority $350 \n" + "\n" + "Ouch!"
        },
        doodad14: {
            name: "Shopping!",
            cost: 350,
            text: "Pay $350 for fabulous fake jewels"
        },
        doodad15: {
            name: "Family Vacation!",
            cost: 2000,
            text: "Costs $2000"
        },
        doodad16: {
            name: "Go to Casino!",
            cost: 200,
            text: "Lose $200 at the tables"
        },
        doodad17: {
            name: "Buy New Bowling Ball",
            cost: 80,
            text: "Pay $80"
        },
        doodad18: {
            name: "Play Your Lucky Lottery Number!",
            cost: 100,
            text: "Lose $100"
        },
        doodad19: {
            name: "Shopping Spree!",
            cost: 150,
            text: "Pay $150 \n" +
                "\n" +
                "Buy new wristwatch (even though you already have 3)"
        },
        doodad20: {
            name: "Go to Ball Game",
            cost: 50,
            text: "Pay $50"
        },
        doodad21: {
            name: "Visit Dentist",
            cost: 100,
            text: "Filling costs $100"
        },
        doodad22: {
            name: "Buy New Golf Balls",
            cost: 20,
            text: "Pay $20"
        },
        doodad23: {
            name: "Furniture Sale",
            cost: 300,
            text: "Pay $300 \n" + "\n" + "Replace that old chair"
        },
        doodad24: {
            name: "Go to a Concert",
            cost: 180,
            text: "Dinner, Tickets, & Coffee Sets you back $180"
        },
        doodad25: {
            name: "Upgrade Smart Phone",
            cost: 100,
            text: "Pay $100"
        },
        doodad26: {
            name: "Go to Coffee Shop",
            cost: 10,
            text: "Pay $10 \n" + "\n" + "Buy a cafe latte & cappuccino for you and a friend"
        },
        doodad27: {
            name: "High School Reunion",
            cost: 250,
            text: "You spend $250"
        },
        doodad28: {
            name: "Repaint House",
            cost: 600,
            text: "Costs you $600"
        },
        doodad29: {
            name: "Buy Painting",
            cost: 200,
            text: "Costs you $200. \n" + "\n Couldn't resist new painting by local artist"
        },
        doodad30: {
            name: "Your Child Needs Braces",
            cost: 2000,
            text: "Pay $2000",
          child: true
        },
        doodad31: {
          name: "Amusement Park",
          cost: 100,
          text: "Take kids to the Amusement Park and spend $100",
          child: true
        },
		doodad32: {
            name: "Buy Cappuccino Machine",
            cost: 150,
            text: "Pay $150"
        },
        doodad33: {
          name: "Your Daughter's Wedding",
          cost: 2000,
          text: "Costs you $2000",
          child: true          
        },
		doodad34: {
            name: "Buy New Tennis Racket",
            cost: 200,
            text: "You spend $200"
        },
        doodad35: {
            name: "Buy New Clothes",
            cost: 250,
            text: "Pay $250"
        },
        doodad36: {
            name: "Rumor of Layoff",
            cost: 220,
            text: "Go back to school for added skills." + "\n" + "Pay $220 for tuition & books."
        },
        doodad37: {
            name: "Go to the Air Show",
            cost: 120,
            text: "Pay $120"
        },
        doodad38: {
            name: "Must Have New Sunglasses",
            cost: 70,
            text: "Pay $70"
        },
        doodad39: {
            name: "Buy a Food Processor",
            cost: 150,
            text: "Pay $150"
        },
        doodad40: {
            name: "Lunch with Friends",
            cost: 40,
            text: "Pay $40"
        },
        doodad41: {
            name: "Car Needs Tires",
            cost: 300,
            text: "Pay $300"
        },
		doodad42: {
            name: "Family Vacation!",
            cost: 2000,
            text: "Pay $2,000 to take the kids to a world famous theme park and resort.",
			child: true
        },
		doodad43: {
            name: "Smartphone Broke!",
            cost: 250,
            text: "Pay $250 for replacement"
        },
		doodad44: {
			name: "Movie Streaming Service",
            cost: 15,
            text: "Pay $15"
		}
    },
    allDeals: {
        mutual01: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Lower interest rates drive market and fund to strong showing.",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 30,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us30",
            shares: 0
        },
        mutual02: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Brilliant young fund manager. Everyone believes he has the Midas touch",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 20,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us20",
            shares: 0
        },
        mutual03: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Weak earnings by most companies lead to weak price of mutual fund",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 10,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us10",
            shares: 0
        },
        mutual04: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Lower interest rates drive market and fund to strong showing.",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 5,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us05",
            shares: 0
        },
        mutual05: {
            type: "Mutual Fund",
            name: "GRO4US Fund",
            description: "Powerhouse market drives strong fund's price up to record high",
            rule: "Only you may buy as many units as you want at this price. Everyone may sell at this price",
            symbol: "GRO4US",
            price: 40,
            range: "$10 to $30",
            dividend: false,
            id: "gro4us40",
            shares: 0
        },
        stock001: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Booming market leads to record share price of this home electronics seller!",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 40,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u40",
            shares: 0
        },
        stock002: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "High inflation leads to poor share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 5,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u05",
            shares: 0
        },
        stock003: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Record interest rates lead to substandard share price for this home electronics seller",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 5,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u05",
            shares: 0
        },
        stock004: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Strong market leads to strong share price for this home electronics seller",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 30,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u30",
            shares: 0
        },
        stock005: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Trade war panic leads to record low share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 1,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u01",
            shares: 0
        },
        stock006: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Weak market leads to sagging share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 10,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u10",
            shares: 0
        },
        stock007: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Fast growing seller of home electronics headed by 32 year old Harvard grad.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 20,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u20",
            shares: 0
        },
        stock008: {
            type: "Stock",
            name: "MYT4U Electronics Co.",
            description: "Low interest rates lead to substantial share price for this home electronics seller.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "MYT4U",
            price: 30,
            range: "$5 to $30",
            dividend: false,
            id: "myt4u30",
            shares: 0
        },
        stock101: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Market strength leads to high share price for this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 40,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock102: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Low inflation leads to high share price for this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u20",
            shares: 0
        },
        stock103: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Booming market raises share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 50,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u50",
            shares: 0
        },
        stock104: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Interest rates cripple share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 5,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u05",
            shares: 0
        },
        stock105: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "High interest rates cause poor share price of this long time make of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock106: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Inflation worries cause poor share price of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u10",
            shares: 0
        },
        stock107: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Market panic causes crash in the shares of this long time maker of medicines.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 1,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u01",
            shares: 0
        },
        stock108: {
            type: "Stock",
            name: "OK4U Drug Co.",
            description: "Long time maker of medicines; especially drugs for people of 70.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "OK4U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "ok4u30",
            shares: 0
        },
        stock201: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office hit by children's division casuses record share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 40,
            range: "$5 to $40",
            dividend: false,
            id: "on2u40",
            shares: 0
        },
        stock202: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Strong demand for company's library of old movies on video leads to good share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "on2u30",
            shares: 0
        },
        stock203: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "New director of movie acquisitions brings revived prospects for share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "on2u20",
            shares: 0
        },
        stock204: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Movie buyer fired after third mega-flop! Shares sink. Chairman's bonus canceled.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 5,
            range: "$5 to $40",
            dividend: false,
            id: "on2u05",
            shares: 0
        },
        stock205: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office smash hit in adult division causes strong share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 30,
            range: "$5 to $40",
            dividend: false,
            id: "on2u30",
            shares: 0
        },
        stock206: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Recent merger strengthened market share of this leading company with good outlook.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 20,
            range: "$5 to $40",
            dividend: false,
            id: "on2u20",
            shares: 0
        },
        stock207: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Newest theme park loses record amount. Share price hits all-time low.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 1,
            range: "$5 to $40",
            dividend: false,
            id: "on2u01",
            shares: 0
        },
        stock208: {
            type: "Stock",
            name: "ON2U Entertainment Co.",
            description: "Box office flop by musical extravaganza in core division causes poor share price.",
            rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
            symbol: "ON2U",
            price: 10,
            range: "$5 to $40",
            dividend: false,
            id: "on2u10",
            shares: 0
        },
        stockSplit1: {
            type: "Stock Split",
            name: "MYT4U Electronics Co.",
            description: "Business is up dramatically and the company is doing so well their shares haave just split!",
            rule: "Everyone who owns MYT4U shares doubles the number of shares they own.",
            symbol: "MYT4U"
        },
        stockSplit2: {
            type: "Reverse Split",
            name: "MYT4U Electronics Co.",
            description: "Company reorganizes! Massive loses due to over expansion and recession. Stockholders lose 1/2 of their ownership rights.",
            rule: "Everyone who owns MYT4U shares cuts shares owned to 1/2 previous value.",
            symbol: "MYT4U"
        },
        stockSplit3: {
            type: "Stock Split",
            name: "OK4U Drug Co.",
            description: "Things are going so well for the company that their shares have just split!",
            rule: "Everyone who owns OK4U shares doubles the number of shares they own.",
            symbol: "OK4U"
        },
        stockSplit4: {
            type: "Reverse Split",
            name: "OK4U Drug Co.",
            description: "Company flounders! Massive losses due to tainted drug scandal. All stockholders lose 1/2 of their ownership rights.",
            rule: "Everyone who owns OK4U shares cuts shares owned to 1/2 previous value.",
            symbol: "OK4U"
        },      
        //add preferred stock		
        realEstateS1: {
            type: "Real Estate",
            name: "You Find a Great Deal!",
            description: "Older 3/2 house, repossessed by government agency. Ready to go with government financing and a tenant.",
            rule: "Borrow from the Bank if you must, but... BUY THIS! 132% ROI, may sell for $65,000 to $135,000.",
            roi: 1.32,
            cost: 35000,
            downPayment: 2000,
            mortgage: 33000,
            cashFlow: 220,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS2: {
            type: "Real Estate",
            name: "Condo for Sale - 2 Br/1 Ba",
            description: "Nice 2/1 condo available due to marriage of owner. Bad area. Needs work.",
            rule: "Use {this yourself or sell to another player. 24% ROI, may sell for $45,000 to $65,000.",
            roi: 0.24,
            cost: 50000,
            downPayment: 5000,
            mortgage: 45000,
            cashFlow: 100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS3: {
            type: "Real Estate",
            name: "Condo For Sale - 2 Br/1 Ba",
            description: "Parents selling 2/1 condo used by their chil in college town. Lots of demand for rentals in this area.",
            rule: "Use this yourself or sell to another player. 42% ROI, may sell for $45,000 to $65,000.",
            roi: 0.42,
            cost: 40000,
            downPayment: 4000,
            mortgage: 36000,
            cashFlow: 140,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS4: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Older 2/1 condo offered by young couple who want to move up to a 3/2 house due to growing family. Available soon.",
            rule: "Use this yourself or sell to another player. 38% ROI, may sell for $45,000 to $65,000.",
            roi: 0.38,
            cost: 50000,
            downPayment: 5000,
            mortgage: 45000,
            cashFlow: 100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS5: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Excellent 2/1 condo with many extras. For sale due to business success of owner. She's moving up, so can you.",
            rule: "Use this yourself or sell to another player. -24% ROI, may sell for $45,000 to $65,000.",
            roi: -0.24,
            cost: 60000,
            downPayment: 5000,
            mortgage: 55000,
            cashFlow: -100,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS6: {
            name: "Condo For Sale - 2 Br/1 Ba",
            type: "Real Estate",
            description: "Bank foreclosure! 2/1 condo in desirable neighborhood close to jobs and stores. Make offer, favorable financing by bank.",
            rule: "Use this yourself or sell to another player. 53% ROI, may sell for $45,000 to $65,000",
            roi: 0.53,
            cost: 40000,
            downPayment: 5000,
            mortgage: 35000,
            cashFlow: 220,
            tag: "2Br/1Ba",
            landType: "2Br/1Ba"
        },
        realEstateS7: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Not lived in for 6 months, this bank-foreclosed house just reduced. Loan includes estimated repair costs.",
            rule: "Use this yourself or sell to another player. May sell for $65,000 to $135,000.",
            roi: 0,
            cost: 50000,
            downPayment: 0,
            mortgage: 50000,
            cashFlow: 100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS8: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Low down payment to pick up this 3/2 house. Owner/seller unexpectedly moving out of town. Right person will do well.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 50000,
            downPayment: 3000,
            mortgage: 47000,
            cashFlow: 100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS9: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "3/2 house in older area offered by Highway Department. Market has crashed. No bids at last week's auction.",
            rule: "Use this yourself or sell to another player. ??% ROI, may sell for $65,000 to $135,000.",
            cost: 50000,
            downPayment: 0,
            mortgage: 50000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS10: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 rental house suddenly available due to estate closing. Well maintained older property with existing tenant.",
            rule: "Use this yourself or sell to another player. 38% ROI, may sell for $65,000 to $135,000.",
            roi: 0.38,
            cost: 65000,
            downPayment: 5000,
            mortgage: 60000,
            cashFlow: 160,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS11: {
            name: "House For Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 house available in depressed market due to layoffs. Would make good investment property for right buyer.",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $65,000 to $135,000.",
            roi: 0.6,
            cost: 50000,
            downPayment: 4000,
            mortgage: 46000,
            cashFlow: 200,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS12: {
            name: "You Find a Great Deal!",
            type: "Real Estate",
            description: "Company bought transferred manager's 3/2 house. No current tenant, has been on market 6 months, just reduced.",
            rule: "Borrow from the Bank if you must, but... BUY THIS! 150% ROI, may sell for $65,000 to $135,000.",
            roi: 1.5,
            cost: 50000,
            downPayment: 4000,
            mortgage: 46000,
            cashFlow: 200,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateS13: {
            name: "10 Acres Raw Land",
            type: "Real Estate",
            description: "Wonderful park-like setting with stream on 10 acres in undeveloped area. No roads, no utilities, no noise.",
            rule: "Use this yourself or sell to another player. 0% ROI, possible future sale at ??.",
            roi: 0,
            cost: 5000,
            downPayment: 5000,
            mortgage: 0,
            cashFlow: 0,
            tag: "10 acres",
            landType: "10 acres"
        },
        propertyDamage: {
            name: "Tenant Damages Your Property",
            type: "Property Damage",
            description: "Tenant fails to pay rent for 2 months and then skips town leaving damage to your rental property. Insurance covers most damage and costs, but you are still out of pocket $500.",
            rule: "Pay $500 if you own any rental property",
            propertyType: "rental",
            cost: 500
        },
        coin1: {
            type: "Coin",
            name: "1500's Spanish",
            title: "Rare Gold Coin",
            description: "You spot an unusual 1500's Royal Spanish New World (Havana Mint Only) \"pieces of eight\" gold coin in good condition at a swap meet. One only, seller asks $500.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for $0 to $4,000.",
            roi: 0,
            cost: 500,
            downPayment: 500,
            liability: 0,
            cashFlow: 0,
            amount: 1
        },
        coin2: {
            type: "Coin",
            name: "Krugerrand",
            title: "Friend Needs Cash... Quick",
            description: "A friend has urgent need for money. Will sell you 10 one-ounce gold Krugerrands, well below going rate, for $300 each.",
            rule: "Use this yourself or sell to another player. 0% ROI, possible future sale at ??",
            roi: 0,
            cost: 3000,
            downPayment: 3000,
            liability: 0,
            cashFlow: 0,
            amount: 10
        },
        /*cd1: {
          type: "Certificate of Deposit",
          name: "Certificate of Deposit",
          description: "A leading bank offers this special Certificate of Deposit to its customer. Guaranteed interest and redeemable after any holding period.",
          rule: "Everyone may buy or sell as many as they wish at this time.",
          symbol: "CD",
          interest: 20,
          price: 5000,
          tradingRange: "$5,000 to $5,000"
        },
        cd2: {
          type: "Certificate of Deposit",
          name: "Certificate of Deposit",
          description: "A leading bank offers this special Certificate of Deposit to its customer. Guaranteed interest and redeemable after any holding period.",
          rule: "Everyone may buy or sell as many as they wish at this time.",
          symbol: "CD",
          interest: 20,
          price: 4000,
          tradingRange: "$5,000 to $5,000"
        },*/
        companyS1: {
            type: "Company",
            name: "Start a Company Part Time",
            description: "Develop interesting idea for a software program, so you start a company to produce and sell it. No profits during startup, long hours, no extra pay.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for ??, if anything.",
            roi: 0,
            cost: 5000,
            downPayment: 5000,
            liability: 0,
            cashFlow: 0,
            tag: "SOFTWARE",
            landType: "business",
            businessType: "software"
        },
        companyS2: {
            type: "Company",
            name: "Start a Company Part Time",
            description: "Invent new way of making widgets, so you start a company to produce and sell them. No profits during startup, long hourse, no extra pay.",
            rule: "Use this yourself or sell to another player. 0% ROI, may sell for ??, if anything.",
            roi: 0,
            cost: 3000,
            downPayment: 3000,
            liability: 0,
            cashFlow: 0,
            tag: "WIDGET",
            landType: "business",
            businessType: "widget"
        },
        /*
            personalS1: {
              type: "Personal Loan",
              name: "Sister-In-Law Borrows Money",
              description: "Sister-In-Law is downsized. Needs $5,000 to make house payments. She promises to pay you back $10,000 after she finds a new job.",
              rule: "Use this yourself or sell to another player. ??% ROI.",
              roi: 0,
              cost: 5000,
              downPayment: 5000,
              liability: 0,
              cashFlow: 0
            }*/
        realEstateB1: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Reinvesting owner offers 8-plex for sale at reasonable price. Financing already in place. All it needs is your down payment.",
            rule: "Use this yourself or sell to another pl;ayer. 51% ROI, may sell for $200,000 to $280,000.",
            roi: 0.51,
            cost: 220000,
            downPayment: 40000,
            mortgage: 180000,
            cashFlow: 1700,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB2: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            decription: "Divorce leads to sale of this 3/2 house in an area full of owner occupied homes. Has been on the market 5 months.",
            rule: "Use this yourself or sell to another player. 30% ROI, may sell for $65,000 to $135,000.",
            roi: 0.3,
            cost: 70000,
            downPayment: 20000,
            mortgage: 50000,
            cashFlow: 500,
            tag: "3Br/2ba",
            landType: "3Br/2Ba"
        },
        realEstateB3: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Good investment potential in this 3/2 house if you can be patient. Positive cash flow even though rents are weak.",
            rule: "Use this yourself or sell to another player. 45% ROI, may sell for $65,000 to $135,000.",
            roi: 0.45,
            cost: 65000,
            downPayment: 8000,
            mortgage: 57000,
            cashFlow: 300,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB4: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex available - forced sale. Out-of-state, financially distressed owner years behind on taxes. Some records available.",
            rule: "Use this yourself or sell to another player. 56% ROI, may sell for $100,00 to $140,000.",
            roi: 0.56,
            cost: 80000,
            downPayment: 16000,
            mortgage: 64000,
            cashFlow: 750,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB5: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Professional person urgently needs cash to save partnership. 8-plex sale to raise capital, good opportunity for right person.",
            rule: "Use this yourself or sell to another player. 64% ROI, may sell for $200,000 to $280,000.",
            roi: 0.64,
            cost: 16000,
            downPayment: 32000,
            mortgage: 128000,
            cashFlow: 1700,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB6: {
            name: "Automated Business for Sale",
            type: "Real Estate",
            description: "Successful 4 bay coin operated auto wash near busy intersection. Seller is moving to retirement community out of state.",
            rule: "Use this yourself or sell to another player. 86% ROI. No other buyers in sight.",
            roi: 0.86,
            cost: 125000,
            downPayment: 25000,
            liability: 100000,
            cashFlow: 1800,
            tag: "CarWash",
            landType: "car wash"
        },
        realEstateB7: {
            name: "20 Acres for Sale",
            type: "Real Estate",
            description: " 20 acres of vacant land, currently zoned residential. Possibly of good appreciation if rezoned commercial.",
            rule: " Use this yourself or sell to another player. 0% ROI, may sell for ??.",
            roi: 0,
            cost: 20000,
            downPayment: 20000,
            mortgage: 0,
            cashFlow: 0,
            tag: "20Acres",
            landType: "20 acres"
        },
        realEstateB8: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Retiring investor/owner offers his 8-plex at current appraisal value. Professional lawn service and management. Full records.",
            rule: "Use this yourself or sell to another player. 29% ROI, may sell for $200,000 to $280,000.",
            roi: 0.29,
            cost: 240000,
            downPayment: 40000,
            mortgage: 200000,
            cashFlow: 950,
            tag: "8PLEX",
            landType: "plex",
            units: 8
        },
        realEstateB9: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: '"Project" 4-plex for sale in rehabilitating neighborhood. Owner being forced out by income tax liens.',
            rule: "Use this yourself or sell to another player. 24% ROI, may sell for $100,000 to $140,000.",
            roi: 0.24,
            cost: 80000,
            downPayment: 20000,
            mortgage: 60000,
            cashFlow: 400,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB10: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "Older 4-plex next to new highway for sale. Owner/occupant moving to wuieter area. Priced for quick sale.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $100,000 to $140,000.",
            roi: 0.4,
            cost: 90000,
            downPayment: 15000,
            mortgage: 75000,
            cashFlow: 500,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB11: {
            name: "Pizza Franchise for Sale",
            type: "Real Estate",
            description: "Healthy-pizza company franchise. Trend in nutritious fast-food booming. Next to college. High Traffic",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $500,000 to $800,000.",
            roi: 0.6,
            cost: 500000,
            downPayment: 100000,
            mortgage: 400000,
            cashFlow: 5000,
            tag: "PIZZA",
            landType: "franchise"
        },
        realEstateB12: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Duplex owner must sell to pay hospital bills. Two tenants in place, all records, good investment oppurtunity.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $50,000 to $80,000.",
            roi: 0.4,
            cost: 60000,
            mortgage: 48000,
            downPayment: 12000,
            cashFlow: 400,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB13: {
            name: "Bed & Breakfast for Sale",
            type: "Real Estate",
            description: "Owner retiring, wants out NOW. Great clientele in resort community. 5Br/3Ba.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $100,000 to $300,000.",
            roi: 0.4,
            cost: 150000,
            mortgage: 120000,
            downPayment: 30000,
            cashFlow: 1000,
            tag: "Bed&Br",
            landType: "bed breakfast"
        },
        realEstateB14: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "3/2 house on golf course offers potential capital gain plus current cash flow. Good rentals and nice financing.",
            rule: "Use this yourself or sell to another player. 51% ROI, may sell for $65,000 to $135,000.",
            roi: 0.51,
            cost: 75000,
            mortgage: 68000,
            downPayment: 32000,
            cashFlow: 2000,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB15: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Tenants in place at this investment duplex! Owner has income tax problems, needs to sell quickly.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $50,000 to $80,000.",
            roi: 0.48,
            cost: 45000,
            mortgage: 37000,
            downPayment: 8000,
            cashFlow: 320,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB16: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex for sale by owner, moving to another state. Full records, fully rented, low occupant turnover in good neighborhood.",
            rule: "Use this yourself or sell to another player. 75% ROI, may sell for $100,000 to $140,000.",
            roi: 0.75,
            cost: 140000,
            downPayment: 32000,
            mortgage: 108000,
            cashFlow: 2000,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB17: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Businessman liquidating this 3/2 house, needs cash to save his business. Currently occupied by happy tenant.",
            rule: "Use this yourself or sell to another player. 26% ROI, may sell for $65,000 to $135,000.",
            roi: 0.26,
            cost: 65000,
            mortgage: 58000,
            downPayment: 7000,
            cashFlow: 150,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB18: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Still level 3/2 house on out of way golf course offered by heirs of owner. Gold membership included.",
            rule: "Use this yourself or sell to another player. -12% ROI, may sell for $65,000 to $150,000.",
            roi: -0.12,
            cost: 115000,
            mortgage: 105000,
            downPayment: 10000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB19: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Nice 3/2 house with in ground pool and full appliances available in upper middle class area. Good schools.",
            rule: "Use this yourself or sell to another player. -6% ROI, may sell for $65,000 to $150,000.",
            roi: -0.12,
            cost: 125000,
            mortgage: 105000,
            downPayment: 20000,
            cashFlow: -100,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB20: {
            name: "Apartment Houses for Sale",
            type: "Real Estate",
            description: "2 buildings totaling 24 units for sale. Owner managed with on-site assistant. Retirement prompts sale.",
            rule: "Use this yourself or sell to another player. 54% ROI, may sell for $600,000 to $960,000.",
            roi: 0.54,
            cost: 575000,
            mortgage: 500000,
            downPayment: 75000,
            cashFlow: 3400,
            unit: 48,
            tag: "2x 24u",
            landType: "apartment",
            units: 48
        },
        realEstateB21: {
            name: "Car Wash for Sale",
            type: "Real Estate",
            description: "Family car wash for sale. Family feuding. Wants out ASAP. Prime location in highgrowth area.",
            rule: "Use this yourself or sell to another player. 36% ROI, may sell for 12-25 times annual cash flow.",
            roi: 0.36,
            cost: 350000,
            mortgage: 300000,
            downPayment: 50000,
            cashFlow: 1500,
            tag: "CarWash",
            landType: "car wash"
        },
        realEstateB22: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "12 unit apartment house offered by out-of-state heirs of handyman/owner. Long waiting list for apartment in this building.",
            rule: "Use this yourself or sell to another player. 58% ROI, may sell for $300,000 to $480,000.",
            roi: 0.58,
            cost: 350000,
            mortgage: 300000,
            downPayment: 50000,
            cashFlow: 2400,
            units: 12,
            tag: "12Unit",
            landType: "apartment"
        },
        realEstateB23: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "Nice, well maintained 4-plex in good neighborhood. Stable tenants, positive cash flow, few problems. Full records.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $100,000 to $140,000.",
            roi: 0.48,
            cost: 125000,
            downPayment: 15000,
            mortgage: 110000,
            cashFlow: 600,
            tag: "4PLEX",
            landType: "plex",
            units: 4
        },
        realEstateB24: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "60 unit complex available from pension fund that foreclosed on builder/owner. On-site management in place.",
            rule: "Use this yourself or sell to another player. 66% ROI, may sell for $1,500,000 to $2,700,000.",
            roi: 0.66,
            cost: 1200000,
            mortgage: 1000000,
            downPayment: 200000,
            cashFlow: 11000,
            units: 60,
            tag: "60Unit",
            landType: "apartment"
        },
        realEstateB25: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "This duplex is the best in the neighborhood! Proud owner retiring to another state to be near her grandchildren.",
            rule: "Use this yourself or sell to another player. 24% ROI, may sell for $50,000 to $80,000.",
            roi: 0.24,
            cost: 70000,
            mortgage: 63000,
            downPayment: 7000,
            cashFlow: 140,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB26: {
            name: "Small Shopping Mall for Sale",
            type: "Real Estate",
            description: "Bank has taken back mall from bankrupt owner. Mall is currently 50% occupied. Just listed today.",
            rule: "Use this yourself or sell to another player. 19% ROI, may sell for $35,000 to $150,000.",
            roi: 0.19,
            cost: 50000,
            mortgage: 0,
            downPayment: 50000,
            cashFlow: 800,
            tag: "MALL",
            landType: "mall"
        },
        realEstateB27: {
            name: "Apartment House for Sale",
            type: "Real Estate",
            description: "24 unit older building near community college available from retiring owner/builder. Fully rented, nice cash flow.",
            rule: "Use this yourself or sell to another player. 67% ROI, may sell for $600,000 to $960,000.",
            roi: 0.67,
            cost: 550000,
            mortgage: 500000,
            downPayment: 50000,
            cashFlow: 2800,
            units: 24,
            tag: "24Unit",
            landType: "apartment"
        },
        realEstateB28: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Well maintained duplex in desirable area available due to transfer of owner. Excellent investment opportunity for right buyer.",
            rule: "Use this yourself or sell to another player. 60% ROI, may sell for $50,000 to $80,000.",
            roi: 0.6,
            cost: 60000,
            mortgage: 54000,
            downPayment: 6000,
            cashFlow: 300,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        realEstateB29: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Downsized manager must sell this 3/2 house, cannot afford payments on new salary. Area in transition.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 70000,
            mortgage: 61000,
            downPayment: 9000,
            cashFlow: 300,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB30: {
            name: "4-plex for Sale",
            type: "Real Estate",
            description: "4-plex in recovering neighborhood. Fully rented repairs kept up. Needs your down payment and patience.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $100,000 to $140,000.",
            roi: 0.48,
            cost: 100000,
            downPayment: 20000,
            mortgage: 80000,
            cashFlow: 800,
            tag: "4PLEX",
            landType: "4-plex",
            units: 4
        },
        realEstateB31: {
            name: "House for Sale - 3 Br/2 Ba",
            type: "Real Estate",
            description: "Transferred skilled tradesman kept this 3/2 house in excellent condition, so it commands top dollar rentals in older neighborhood.",
            rule: "Use this yourself or sell to another player. 40% ROI, may sell for $65,000 to $135,000.",
            roi: 0.4,
            cost: 67000,
            mortgage: 551000,
            downPayment: 12000,
            cashFlow: 400,
            tag: "3Br/2Ba",
            landType: "3Br/2Ba"
        },
        realEstateB32: {
            name: "8-plex for Sale",
            type: "Real Estate",
            description: "Owner's legal troubles lead to forced sale of this 8-plex. No qualifying on this loan, as mortgage holder is cooperating.",
            rule: "Use this yourself or sell to another player. 48% ROI, may sell for $200,000 to $280,000.",
            roi: 0.48,
            cost: 200000,
            downPayment: 40000,
            mortgage: 160000,
            cashFlow: 1600,
            tag: "8PLEX",
            landType: "8-plex",
            units: 8
        },
        realEstateB33: {
            name: "Duplex for Sale",
            type: "Real Estate",
            description: "Owner moving out of this duplex due to growing family. Tenant remains, well maintained, excellent landscaping.",
            rule: "Use this yourself or sell to another player. 36% ROI, may sell for $50,000 to $70,000.",
            roi: 0.36,
            cost: 50000,
            mortgage: 42000,
            downPayment: 8000,
            cashFlow: 240,
            tag: "DUPLEX",
            landType: "duplex",
            units: 2
        },
        limitedPartnershipB1: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Non-franchise sandwich shop doubling the number of locations. Owner needs additional equity capital to get operating loan.",
            rule: "Use this yourself or sell to another player. 60% ROI, owner may buy you out for $60,000 to $90,000.",
            roi: 0.6,
            cost: 30000,
            downPayment: 30000,
            liability: 0,
            cashFlow: 1500,
            tag: "LP-FOOD",
            landType: "limited"
        },
        limitedPartnershipB2: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Auto Dealer wants to expand into leasing 2 and 3 year old cars. Needs capital as car maker's finance company is not interested.",
            rule: "Use this yourself or sell to another player. 40% ROI, owner may buy you out for $60,000 to $90,000.",
            roi: 0.4,
            cost: 30000,
            downPayment: 30000,
            liability: 0,
            cashFlow: 1000,
            tag: "LP-Auto",
            landType: "limited"
        },
        limitedPartnershipB3: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Successful doctor expanding office and clinic. Needs partner to fund equity portion of construction costs.",
            rule: "Use this yourself or sell to another player. 48% ROI, owner may buy you out for $50,000 to $75,000.",
            roi: 0.48,
            cost: 25000,
            downPayment: 25000,
            liability: 0,
            cashFlow: 1000,
            tag: "LP-MDOffice",
            landType: "limited"
        },
        limitedPartnershipB4: {
            name: "Limited Partner Wanted",
            type: "Limited Partnership",
            description: "Successful pizza chain expanding into production of frozen pizzas for grocercy stores. Owner needs capital for equipment.",
            rule: "Use this yourself or sell to another player. 48% ROI, owner may buy you out for $40,000 to $60,000.",
            roi: 0.48,
            cost: 20000,
            downPayment: 20000,
            liability: 0,
            cashFlow: 800,
            tag: "LP-PIZZA",
            landType: "limited"
        },
        automatedBusinessB1: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "30 video/pinball machines at long term contract locations for sale by overextended owner. Owner is desperate.",
            rule: "Use this yourself or sell to another player. 96% ROI. No other buyers in sight.",
            roi: 0.96,
            cost: 100000,
            downPayment: 20000,
            liability: 80000,
            cashFlow: 1600,
            tag: "PINBALL",
            landType: "business"
        },
        automatedBusinessB2: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "Successful coin telephone business available due to death of owner. Heirs live out of state. All locations on long term contract.",
            rule: "Use this yourself or sell to another player. 81% ROI. No other buyers in sight.",
            roi: 0.81,
            cost: 200000,
            downPayment: 40000,
            liability: 160000,
            cashFlow: 2700,
            tag: "TELE",
            landType: "business"
        },
        automatedBusinessB3: {
            name: "Automated Business for Sale",
            type: "Automated Business",
            description: "Personal bankruptcy sale of busy, successful laundromat on busy highway. Absentee owner, contract cleaning.",
            rule: "Use this yourself or sell to another player. 81% ROI. No other buyers in sight.",
            roi: 1,
            cost: 150000,
            downPayment: 30000,
            liability: 120000,
            cashFlow: 2500,
            tag: "LAUNDRY",
            landType: "business"
        },
        propertyDamage1: {
            name: "Sewer Line Breaks",
            type: "Property Damage",
            description: "Water everywhere at your 8-plex! Broken sewer line needs repair immediately. <br> If you own an 8-plex, pay $2,000 for new line. (Bank loan available on usual terms.)",
            rule: "If you own more than one 8-plex, pay repairs on only one.",
            propertyType: "8-plex",
            cost: 2000
        },
        propertyDamage2: {
            name: "Tenant Damages Your Property",
            type: "Property Damage",
            description: "Tenant refuses to pay rent after losing job. When you get him evicted you discover significant damages to your property. <br> Insurance covers most damages and costs, but you still are out of pocket $1,000. Pay $1,000",
            rule: "Pay $1,000 if you own any rental real estate",
            propertyType: "rental",
            cost: 1000
        }
    }
};

APP.cardText = {
	deals: {
		deal1: "Congrats on your new venture!",
		deal2: "A new world awaits you in a new endeavour!",
		deal3: "A big city mayor wishes you good fortune in your new business venture",
	},
	donations: {
		donation1: "Your charity has rewarded you with 2x rolls!"
	}
};

APP.display = {
    tokens: [{
            ele: "<div id='player1-piece'>1</div>"
        },
        {
            ele: "<div id='player2-piece'>2</div>"
        },
        {
            ele: "<div id='player3-piece'>3</div>"
        },
        {
            ele: "<div id='player4-piece'>4</div>"
        },
        {
            ele: "<div id='player5-piece'>5</div>"
        },
        {
            ele: "<div id='player6-piece'>6</div>"
        },
        {
            ele: "<div id='player7-piece'>7</div>"
        },
        {
            ele: "<div id='player8-piece'>8</div>"
        }
    ],
    renderBoard: function () {
        $("#board").show();
        $("#board2").show();
        $("#board-container").show();
		$("#game-container").show();
        $("#info").show();
        $("#player-list").show();

        APP.display.showPlayerList();
        APP.display.showTurnInfo();
        APP.board.printSquares();
        FASTTRACK.printSquares();
        APP.display.showTokens();
    },
    showTokens: function () {
        for (var i = 0; i < APP.pCount; i++) {
            var token = this.tokens[i].ele;
            var startSpace = document.getElementById("tokenSection0");
            startSpace.insertAdjacentHTML("beforeend", token);
        }
    },
    hideHomeScreen: function () {
        var hhs = document.getElementById("home-screen");
        hhs.style.display = hhs.style.display === "none" ? "" : "none";
    },
    showGameSelectionScreen: function () {
        var sgss = document.getElementById("game-selection-screen");
        sgss.style.display = sgss.style.display === "block" ? "block" : "block";
    },
    hideGameSelectionScreen: function () {
        var hgss = document.getElementById("game-selection-screen");
        hgss.style.display = hgss.style.display === "none" ? "" : "none";
    },
    hideSetup: function () {
        var hs = document.getElementById("setup-screen");
        hs.style.display = hs.style.display === "none" ? "" : "none";
    },
    showGameSetupScreen: function () {
        var sgss = document.getElementById("setup-screen");
        sgss.style.display = sgss.style.display === "block" ? "block" : "block";
    },
	showPlayerList: function () {
        var spl = document.getElementById("player-list");
        spl.style.display =
            spl.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showTurnInfo: function () {
        var st = document.getElementById("turn-info");
        st.style.display =
            st.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showFinanceBox: function () {
        var fb = document.getElementById("finance-box");
        fb.style.display =
            fb.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    hideDreamPhase: function () {
        var ds = document.getElementById("dream-choices");
        ds.style.display = ds.style.display === "none" ? "" : "none";
    },
    showRacePhase: function () {
        var sp = document.getElementById("turn-info-box");
        sp.style.display =
            sp.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showStockCard: function () {
        $("#show-stock-form-btn").show();
        $("#show-stock-sell-form-btn").show();
        $("#done-btn").show();

        $("#sell-shares-form").hide();
        $("#sell-stock-btn").hide();
        $("#buy-shares-form").hide();
        $("#buy-stock-btn").hide();
        $("#done-buy-sell-btn").hide();

        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;

        for (var j = 0; j < arr.length; j++) {
            if (arr[j].highlight === "on") {
                arr[j].highlight = "off";
            }
            if (arr[j].selected === true) {
                arr[j].selected = false;
            }
        }
        if (APP.ownedShares() == 0) {
            $("#show-stock-sell-form-btn").hide();
        }
        APP.finance.statement();
    },
    showBuyStockForm: function () {
        $("#show-stock-form-btn").hide();
        $("#show-stock-sell-form-btn").hide();
        $("#sell-shares-form").hide();
        $("#sell-stock-btn").hide();
        $("#done-btn").hide();

        $("#done-buy-sell-btn").show();
        $("#buy-shares-form").show();
        $("#buy-stock-btn").show();
    },
    showSellStockForm: function () {
        $("#show-stock-form-btn").hide();
        $("#show-stock-sell-form-btn").hide();
        $("#buy-shares-form").hide();
        $("#buy-stock-btn").hide();
        $("#done-btn").hide();

        $("#done-buy-sell-btn").show();


        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;
        var stockSymbol = APP.currentDeal.symbol;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].symbol == stockSymbol) {
                arr[i].highlight = 'on';
            }
        }
        APP.finance.statement();
    },
    showOffer: function () {
		var player = APP.players[APP.currentPlayerArrPos()];
		if (player.debt == true){
			$("br-settlement-text").hide();
			$("#show-offer-btn").hide();
			$("#bankrupt-card").show();
		} else {
			$("#confirm-settlement-btn").hide();
			$("#settlement-card").hide();
			$("#show-offer-btn").hide();

			$("#offer-card").show();
			$("#done-btn").show();
		}
    },
    increaseShares: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var value = parseInt(document.getElementById("share-amt-input-sell").value, 10);
        var arr = player.stockAssets;
        var stockSymbol = APP.currentDeal.symbol;

        var index;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].selected != 'undefined') {
                index = i;
            }
        }

        var shares = Number(arr[index].shares);

        if (value < shares) {
            document.getElementById('share-amt-input-sell').stepUp(1);
        }
    },
    decreaseShares: function (option) {
        if (option == 1) {
            var value = parseInt(document.getElementById("share-amt-input").value, 10);
            value = isNaN(value) ? 0 : value;
            value -= 1;

            if (value > 1) {
                value -= 1;
            } else {
                value = 1;
            }
            document.getElementById("share-amt-input").value = value;
        } else {
            var value2 = parseInt(document.getElementById("share-amt-input-sell").value, 10);
            value2 = isNaN(value2) ? 0 : value2;
            value2 -= 1;

            if (value2 > 1) {
                value2 -= 1;
            } else {
                value2 = 1;
            }
            document.getElementById("share-amt-input-sell").value = value2;
        }
    },
    clearBtns: function () {
        $("#repay-borrow-btns").hide();
        $("#small-deal-btn").hide();
        $("#big-deal-btn").hide();
        $("#buy-coin-btn").hide();
        $("#doodad-pay-button").hide();
        $("#ds-pay-button").hide();
        $("#pd-pay-button").hide();
        $("#charity-donate-btn").hide();
        $("#done-buy-sell-btn").hide();

        $("#pass-btn").hide();
        $("#no-loan-btn").hide();
        $("#done-btn").hide();
        $("#cancel-btn").hide();
		$("#cancel-l-btn").hide();
        $("#borrow-loan-btn").hide();
        $("#borrow-doodad-loan-btn").hide();
        $("#borrow-offer-loan-btn").hide();
        $("#confirm-pay-btn").hide();
        $("#done-repay-btn").hide();
        $("#show-stock-form-btn").hide();
        $("#show-stock-sell-form-btn").hide();
        $("#sell-stock-btn").hide();
        $("#confirm-settlement-btn").hide();
        $("#show-offer-btn").hide();
        $("#ftic-ok-btn").hide();
        $("#ft-enter-btn").hide();
		$("#ft-dream-roll-btn").hide();
		$("#ft-doodad-roll-btn").hide();
		$("#ft-opp-buy-btn").hide();
		$("#ft-opp-roll-btn").hide();
		$("#ft-pass-btn").hide();
		$("#ft-end-turn-btn").hide();

        $("#buy-stock-btn").hide();
        $("#buy-real-estate-btn").hide();
        $("#buy-business-btn").hide();
    },
    clearCards: function () {
        $("#turn-instructions").hide();
        $("#opp-card").hide();
        $("#deal-card-real-estate").hide();
        $("#deal-card-stock").hide();
        $("#buy-shares-form").hide();
        $("#deal-coin-card").hide();
        $("#deal-cd-card").hide();
        $("#deal-card-limited").hide();
        $("#deal-card-automated").hide();
        $("#deal-company-card").hide();
        $("#deal-personal-loan-card").hide();
        $("#kid-card").hide();
        $("#offer-card").hide();
        $("#charity-card").hide();
        $("#doodad-card").hide();
        $("#downsize-card").hide();
        $("#repay-card").hide();
        $("#borrow-card").hide();
        $("#cannot-afford-card").hide();
        $("#cannot-afford-loan-card").hide();
        $("#pay-confirm-card").hide();
        $("#bankrupt-card").hide();
        $("#lose-card").hide();
        $("#bankrupt-game-over-card").hide();
        $("#repay-loan-card").hide();
        $("#settlement-card").hide();
        $("#fast-track-intro-card").hide();
        $("#ft-opp-card").hide();
		$("#ft-doodad-card").hide();
        $("#fast-track-intro-card").hide();
        $("#fast-track-option-card").hide();
        $("#ft-cashflow-day").hide();
		$("#ft-finish-turn-card").hide();
		$("#win-game-card").hide();

        $("#automated-cost-table").hide();
        $("#limited-cost-table").hide();
    },
    repay: function () {
        //open card
        $("#end-turn-btn").hide();
        $("#finish-instructions").hide();
        $("#borrow-card").hide();
        $("#pay-confirm-card").hide();
        $("#confirm-pay.btn").hide();

        this.clearBtns();

        $("#repay-card").show();
        $("#done-repay-btn").show();
        $("#card-btns").show();

        //highlight table rows and add onclick functionality to pay for loan
        this.highlightLiabilities(1);
    },
    borrow: function () {
        $("#end-turn-btn").hide();
        $("#finish-instructions").hide();
        $("#repay-card").hide();
        $("#cancel-btn").hide();
        $("#repay-borrow-btns").hide();

        $("#borrow-card").show();
        $("#borrow-loan-btn").show();
        $("#cancel-btn").show();
        APP.finance.loanPayment();
        APP.finance.statement();
    },
    highlightLiabilities: function (option) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var table = document.getElementById("liability-table");
        var rows = table.getElementsByTagName("tr");

        for (var i = 1; i < rows.length; i++) {
            var currentRow = table.rows[i];

            if (option === 1) {
                currentRow.style.backgroundColor = "#FFEB3B";

                var addOnClick = function (row) {
                    var anchor = rows[i];
                    var cell = row.getElementsByTagName("td")[1];
                    var id = cell.getAttribute("id");
					
                    anchor.onclick = function () {
                        player.loanId = id;
						
						var loanName;
						var loanAmt;
						
							switch (id){
								case "liability-mortgage":
									loanName = "Mortgage";
									loanAmt = "$" + APP.display.numWithCommas(player.jobTitle[9]);
									break;
								case "liability-car":
									loanName = "Car Loan";
									loanAmt = "$" + APP.display.numWithCommas(player.jobTitle[10]);
									break;
								case "liability-credit":
									loanName = "Credit Card";
									loanAmt = "$" + APP.display.numWithCommas(player.jobTitle[11]);
									break;
								case "liability-retail":
									loanName = "Retail Loan";
									loanAmt = "$" + APP.display.numWithCommas(player.jobTitle[12]);
									break;
								case "liability-boat":
									loanName = "Car Loan";
									loanAmt = "$" + APP.display.numWithCommas(player.boatLoan);
									break;
							}

                        if (id === "liability-loans") {
                            $("#repay-loan-card").show();
							$("#cancel-btn").show();

                            $("#done-repay-btn").hide();
							$("#pay-confirm-card").hide();
							$("#confirm-pay-btn").hide();
                            $("#repay-card").hide();
							
							// form val is set to the highest amount the player can pay
							for (var i = 0; i < player.cash - 1000; i += 1000) {
								document.getElementById("loan-amt-input2").value = player.loans;
							}
                        } else if (id == "liability-mortgage"){
							if (player.mortgagePrepay == true) {
								APP.finance.mortgagePrepay = true;
								
								$("#repay-loan-card").show();
								$("#cancel-btn").show();

								$("#done-repay-btn").hide();
								$("#pay-confirm-card").hide();
								$("#confirm-pay-btn").hide();
								$("#repay-card").hide();
								
								$("#repay-loan-name").text(loanName);
								$("#repay-loan-amt").text(loanAmt);
							}
							
							for (var i = 0; i < player.cash - 1000; i += 1000) {
								document.getElementById("loan-amt-input2").value = 1000;
							}
							
						} else if (id == "liability-boat"){
							$("#repay-loan-card").show();
							$("#cancel-btn").show();

							$("#done-repay-btn").hide();
							$("#pay-confirm-card").hide();
							$("#confirm-pay-btn").hide();
							$("#repay-card").hide();
							
							$("#repay-loan-name").text(loanName);
							$("#repay-loan-amt").text(loanAmt);
						
						
							for (var i = 0; i < player.cash - 1000; i += 1000) {
								document.getElementById("loan-amt-input2").value = 1000;
							}
						} else {
                            $("#confirm-pay-btn").show();
                            $("#cancel-btn").show();
                            $("#pay-confirm-card").show();
							// show loan info in card
							$("#repay-loan-name").text(loanName);
							$("#repay-loan-amt").text(loanAmt);

                            $("#done-repay-btn").hide();
							$("#repay-loan-card").hide();
                            $("#repay-card").hide();
                        }
                    };
                };
                currentRow.onClick = addOnClick(currentRow);
            } else if (option === 2) {
                currentRow.style.backgroundColor = "white";

                var removeOnClick = function () {
                    var table = document.getElementById("liability-table");
                    var rows = table.getElementsByTagName("tr");

                    for (var i = 1; i < rows.length; i++) {
                        var anchor = rows[i];

                        anchor.onclick = function () {
                            return 0;
                        };
                    }
                };
                removeOnClick(currentRow);
            }
        }
    },
	renderLiabilitiesTable: function(){
		// get current player
        var player = APP.players[APP.currentPlayerArrPos()];
        var lTable = document.getElementById("liability-table");
		
        var mortgage = player.jobTitle[9];
        var carLoan = player.jobTitle[10];
        var creditCard = player.jobTitle[11];
        var retail = player.jobTitle[12];
        var loans = player.loans;
        var boatLoan = player.boatLoan;
		
        // if paid off remove rows, if no loans hide row
        if (mortgage === 0) {
            $("#lia-mortgage-row").hide();
            $("#exp-mortgage-row").hide();
        } else {
            $("#lia-mortgage-row").show();
            $("#exp-mortgage-row").show();
        }
        if (carLoan === 0) {
            $("#lia-car-row").hide();
            $("#exp-car-row").hide();
        } else {
            $("#lia-car-row").show();
            $("#exp-car-row").show();
        }
        if (creditCard === 0) {
            $("#lia-credit-row").hide();
            $("#exp-credit-row").hide();
        } else {
            $("#lia-credit-row").show();
            $("#exp-credit-row").show();
        }
        if (retail === 0) {
            $("#lia-retail-row").hide();
            $("#exp-retail-row").hide();
        } else {
            $("#lia-retail-row").show();
            $("#exp-retail-row").show();
        }
        if (loans === 0) {
            $("#lia-loans-row").hide();
            $("#exp-loans-row").hide();
        } else {
            $("#lia-loans-row").show();
            $("#exp-loans-row").show();
        }
        if (boatLoan === 0) {
            $("#lia-boatloan-row").hide();
            $("#exp-boat-row").hide();
        } else {
            $("#lia-boatloan-row").show();
            $("#exp-boat-row").show();
        }
		
		// add'$' signs and commas to loan amounts
        document.getElementById("liability-mortgage").innerHTML = APP.display.numWithCommas("$" + mortgage);
        document.getElementById("liability-car").innerHTML = APP.display.numWithCommas("$" + carLoan);
        document.getElementById("liability-credit").innerHTML = APP.display.numWithCommas("$" + creditCard);
        document.getElementById("liability-retail").innerHTML = APP.display.numWithCommas("$" + retail);
        document.getElementById("liability-loans").innerHTML = APP.display.numWithCommas("$" + loans);
        document.getElementById("liability-boat").innerHTML = APP.display.numWithCommas("$" + boatLoan);
	},
    renderAssetTable: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var realEstateAssetArr = player.realEstateAssets;
        var businessAssetArr = player.businessAssets;
        var coinAssetArr = player.coinAssets;

        var incomeInterestTableId = document.getElementById("income-interest-body");
        var incomeRealEstateTableId = document.getElementById("income-real-estate-body");
        var assetTableId = document.getElementById("asset-real-estate-body");

        $(incomeInterestTableId).empty();
        $(incomeRealEstateTableId).empty();
        $(assetTableId).empty();
		
		if (player.position != 19) {
			$("#turn-info").css("box-shadow", "0 0 2px #212121");
			}

        for (var i = 0; i < realEstateAssetArr.length; i++) {
			//insert row for each asset the current player has
            var tag = realEstateAssetArr[i].tag;
            var cost = realEstateAssetArr[i].cost;
            var cashFlow = realEstateAssetArr[i].cashFlow;
			
			var table = document.getElementById("asset-real-estate-body");
			var rows = table.getElementsByTagName("tr");
			var currentRow = table.rows[i];
			
            var incomeRow =
                "<tr class='income-row real-estate-asset" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row'><td>" +
                tag +
                "</td><td>$" +
                cashFlow +
                "</td></tr>";
            var assetRow =
                "<tr class='assets-row real-estate-asset rea-row" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='asset" +
                parseInt(i, 10) +
                "-row'><td>" +
                tag + " / $" +
                cashFlow +
                "</td><td>$" +
                cost +
                "</td></tr>";

            $(incomeRealEstateTableId).append(incomeRow);
            $(assetTableId).append(assetRow);
			
			// row highlight for when the asset is available for deals
            if (realEstateAssetArr[i].highlight === "on") {
                var rowId = "#asset" + parseInt(i, 10) + "-row";
				
				// highlight row if offer matches asset type
                $(rowId).css("background-color", "#FFEB3B");
				
				// highlight card
				$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #0277BD");
				
				var addOnClick = function () {
					var anchor = rows[i];
                    var id = anchor.getAttribute("id");
					
                    anchor.onclick = function () {
                        APP.getSettlement(id, false);
                    };
                };
				
				// when user clicks row show offer
                $(rowId).click(addOnClick());
            }

            if (player.debt == true) {
                var rowId = "#asset" + parseInt(i, 10) + "-row";
	
                $(rowId).css("background-color", "#FFAB91");
				
				var addOnClick = function () {
					var anchor = rows[i];
                    var id = anchor.getAttribute("id");
					
                    anchor.onclick = function () {
                        APP.getSettlement(id, true);
                    };
                };
				
				// when user clicks row show offer
                $(rowId).click(addOnClick());
            }
        }
        for (var j = 0; j < coinAssetArr.length; j++) {
            var amount = coinAssetArr[j].amount;
            var name = coinAssetArr[j].name;
            var cost = coinAssetArr[j].cost;

            var coinAssetRow =
                "<tr class='assets-row coin-asset" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='asset-c" +
                parseInt(j, 10) +
                "-row'><td>" +
                amount +
                " " +
                name +
                "</td><td>$" +
                cost +
                "</td></tr>";

            $(incomeInterestTableId).append(coinAssetRow);
			
			if (coinAssetArr[j].highlight == true) {
				var rowId = "#asset-c" + parseInt(j, 10) + "-row";
				
                $(rowId).css("background-color", "#FFEB3B");
				//highlight card
				$("#turn-info").css("box-shadow", ".2px .2px 3px 3px #0277BD");
				
				switch(coinAssetArr[j].name) {
					case "1500's Spanish":
						var coinOffer = coinAssetArr[j].amount * 5000;	
						document.getElementById("settlement-offer").innerHTML = coinOffer;
						APP.settlementOffer = coinOffer;
						break;
					case "Krugerrands":
						var coinOffer = coinAssetArr[j].amount * 600;
						document.getElementById("settlement-offer").innerHTML = coinOffer;
						APP.settlementOffer = coinOffer;
						break;
					default:
						break;
				}

                $(rowId).click(function () {
                    $("#offer-card").hide();
                    $("#done-btn").hide();

                    $("#settlement-card").show();
                    $("#confirm-settlement-btn").show();
					$("#show-offer-btn").show();
                    $("#settlement-offer").html(APP.settlementOffer);
                });
			}
        }
        for (var k = 0; k < businessAssetArr.length; k++) {
            var tag = businessAssetArr[k].tag;
            var cashFlow = businessAssetArr[k].cashFlow;

            var businessIncomeRow =
                "<tr class='income-row business-asset" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='asset-b" +
                parseInt(k, 10) +
                "-row'><td>" +
                tag +
                "</td><td>$" +
                cashFlow +
                "</td></tr>";

            $(incomeRealEstateTableId).append(businessIncomeRow);
        }
		
		//if table is long keep it a certain width
		if ( 6 <= realEstateAssetArr.length/* + businessAssetArr.length*/) {
			$("#asset-table").css("height", "228px");
		} else {
			$("#asset-table").css("height", "auto");
		}
	},
    renderStockTable: function () {
        var player = APP.players[APP.currentPlayerArrPos()];
        var assetArr = player.stockAssets;
		var incomeInterestTableId = document.getElementById("income-interest-body");
        var tableId = document.getElementById("asset-stock-body");
		
        //Clear old table
		$(incomeInterestTableId).empty();
        $(tableId).empty();

        //cycle through real estate and business assets arr
        for (var i = 0; i < assetArr.length; i++) {
            var symbol = assetArr[i].symbol;
            var cost = this.numWithCommas(assetArr[i].price);
            var shares = this.numWithCommas(assetArr[i].shares);
			
			var incomeRow =
                "<tr class='income-row stock-dividend" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row'><td>" +
                symbol + " (" + shares + ")" +
                "</td><td> ROI: $" +
                assetArr[i].dividend +
                "</td></tr>";
            var stockRow =
                "<tr class='assets-row stock-shares" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='stock" +
                parseInt(i, 10) +
                "-row'><td>" +
                shares +
                " Share of " +
                symbol +
				"</td><td>$" +
                cost +
                "</td></tr>";
			var stockRow2 =
                "<tr class='assets-row stock-shares" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='stock" +
                parseInt(i, 10) +
                "-row'><td>" +
                shares +
                " Share of " +
                symbol +
				" / $" +
                (assetArr[i].dividend * shares) +
                "</td><td>$" +
                cost +
                "</td></tr>";
				
			$(incomeInterestTableId).append(incomeRow);
		if (symbol == ("2BIG" || "1GLO")){
			$(tableId).append(stockRow2);
		} else {
            $(tableId).append(stockRow);
		}	
            if (assetArr[i].highlight === "on") {
                var rowId = "#stock" + parseInt(i, 10) + "-row";

                $(rowId).css("background-color", "#FFEB3B");

                $(rowId).click(function () {
                    $("#sell-shares-form").show();
                    $("#sell-stock-btn").show();

                    var idArr = rowId.split('');
                    var curIndex = Number(idArr[6]);

                    assetArr[curIndex].selected = true;
                    document.getElementById("share-cost-bought").innerHTML = String(assetArr[curIndex].price);
                    document.getElementById("share-amt-input-sell").value = assetArr[curIndex].shares;
                });
            }
        }
    },
	renderFtAssets: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
        var assetArr = player.fastTrackAssets;
        var tableId = document.getElementById("ft-assets-body");
		
		$(tableId).empty();
		$("#right-statement").hide();
		
		for (var i = 0; i < assetArr.length; i++) {
            var title = assetArr[i].title;
            var cost = assetArr[i].cost;
            var cashFlow = assetArr[i].cashFlow;

            var tableRow =
                "<tr class='assets-row ft-assets-row" +
                parseInt(APP.currentPlayerArrPos(), 10) +
                "-row' id='ft-assets-row" +
                parseInt(i, 10) +
                "'><td>" +
                title +
                "</td><td>$" +
                cashFlow +
				"</td><td>$" +
                cost +
                "</td></tr>";

            $(tableId).append(tableRow);
		}
	},
    continueFt: function () {
        //close fast track intro card
		if (APP.players[APP.currentPlayerArrPos()].fastTrack == false){
			$("#fast-track-intro-card").hide();           
            $("#roll2-btn").hide();
			$("#ftic-ok-btn").hide();
			$("#ft-statement").hide();
			
			$("#card-btns").show();
			$("#roll-btn").show();
            $("#turn-instructions").show();
			$("#asset-table").show();
			$("#liability-table").show();
			
		} else {
		//APP.display.clearBtns();
		$("#fast-track-option-card").hide();
		$("#ftic-ok-btn").hide();
		$("#ft-enter-btn").hide();

		$("#ft-turn-instructions").show();
		$("#card-btns").show();
		$("#ft-roll-btn").show();
		}
    },
    numWithCommas: function (num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
	getCurrentSettlementAsset: function() {
	}
};

APP.dreamPhase = {
    dreamPhaseOn: true,
    dreamArrPos: 0,
    openDreamPhase: function () {
        this.dreamPhaseOn = true;
		
        // show dream title and info
        var dream = document.getElementById("dream-text");
        var dreamDescription = document.getElementById("dream-des");

        dream.innerHTML = APP.dreamPhase.dreams[APP.dreamPhase.dreamArrPos];
        dreamDescription.innerHTML =
            APP.dreamPhase.dreamDescriptions[APP.dreamPhase.dreamArrPos];

        // show player job, income and savings
        $("#job-text").show();

        this.showStartScenario(0);
    },
    showStartScenario: function (player) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var playerJob = player.jobTitle[0];
        var vowelRegex = "^[aieouAIEOU].*";
        var matched = playerJob.match(vowelRegex);
        if (matched) {
            //add an n and a space before job title if job begins with vowel
            var job = "n " + playerJob;
        } else {
            //add space before jobtitle
            var job = " " + playerJob;
        }
		
        document.getElementById("dream-job").innerHTML = job;
        document.getElementById("dream-starting-salary").innerHTML =  APP.display.numWithCommas(player.jobTitle[1]);
        document.getElementById("dream-starting-savings").innerHTML = APP.display.numWithCommas(player.cash);
        document.getElementById("dream-starting-cash").innerHTML = APP.display.numWithCommas(player.cash);
    },
    leftDream: function () {
        var id = document.getElementById("dream-text");
        var desId = document.getElementById("dream-des");

        if (this.dreamArrPos === 0) {
            this.dreamArrPos = APP.dreamPhase.dreams.length - 1;
        } else {
            this.dreamArrPos--;
        }

        id.innerHTML = APP.dreamPhase.dreams[APP.dreamPhase.dreamArrPos];
        desId.innerHTML = APP.dreamPhase.dreamDescriptions[this.dreamArrPos];
    },
    rightDream: function () {
        var id = document.getElementById("dream-text");
        var desId = document.getElementById("dream-des");

        if (this.dreamArrPos === APP.dreamPhase.dreams.length - 1) {
            this.dreamArrPos = 0;
        } else {
            this.dreamArrPos++;
        }

        id.innerHTML = APP.dreamPhase.dreams[this.dreamArrPos];
        desId.innerHTML = APP.dreamPhase.dreamDescriptions[this.dreamArrPos];
    },
    dreamChoiceBtn: function () {
        //save dream
        var chosenDream = this.dreams[this.dreamArrPos];
        APP.players[APP.currentPlayerArrPos()].dream = chosenDream;
        //start race phase once last player has dream
        if (APP.currentPlayer == APP.pCount) {
            this.endDreamPhase();
			$("#card-btns").show();
        }
        //show first dream
        var restartDream = document.getElementById("dream-text");
        restartDream.innerHTML = APP.dreamPhase.dreams[0];

        APP.nextTurn();
		//show job and savings info
		APP.dreamPhase.showStartScenario(APP.currentPlayerArrPos()); //+ 1
    },
    endDreamPhase: function () {
        APP.display.hideDreamPhase();
        APP.display.showRacePhase();
        APP.dreamPhase.dreamPhaseOn = false;
        $("#job-text").show();
        $("#finance-box").show();
    },
    dreams: [
        "STOCK MARKET FOR KIDS",
        "YACHT RACING",
        "CANNES FILM FESTIVAL",
        "PRIVATE FISHING CABIN ON A MONTANA LAKE",
        "PARK NAMED AFTER YOU",
        "RUN FOR MAYOR",
        "GIFT OF FAITH",
        "HELI SKI THE SWISS ALPS",
        "DINNER WITH THE PRESIDENT",
        "RESEARCH CENTER FOR CANCER AND AIDS",
        "7 WONDERS OF THE WORLD",
        "SAVE THE OCEAN MAMMALS",
        "BE A JET SETTER",
        "GOLF AROUND THE WORLD",
        "A KIDS LIBRARY",
        "SOUTH SEA ISLAND FANTASY",
        "CAPITALISTS PEACE CORPS",
        "CRUISE THE MEDITERRANEAN",
        "MINI FARM IN THE CITY",
        "AFRICAN PHOTO SAFARI",
        "BUY A FOREST",
        "PRO TEAM BOX SEATS",
        "ANCIENT ASIAN CITIES"
    ],
    dreamDescriptions: [
        "Fund a business and investment school for young capitalists, teaching the the basics of business. School includes a mini stock exchange run by the students.",
        "You and your crew fly to Perth, Australia. Spend one week racing a 12-meter against the fastest boats in the world.",
        "Party with the stars! Tour France, plus one week in Cannes rubbing elbows with celebrities. You even land a starring role!",
        "Fish from the dock of the remote cabin. Enjoy 6 months of solitude. Use of float plane included.",
        "Tear down an abandoned warehouse and build a new recreational park. Donate police sub-station for park safety.",
        "Your financial expertise spurs masses of people to beg you to lead the city. You run and, of course, win. This is the start of your Presidential race.",
        "Your religious organization is growing by leaps and bounds. New buildings are needed.",
        "A winter of helicopter skiing by day and playing at the glamorous hot spots at night. A medieval castle is your accomodation.",
        "Buy a table for 10 friends to dine with te President at a gala ball for visiting dignitaries from around the world.",
        "Your money brings together top researchers & doctors in one place, dedication to eliminating these two diseases.",
        "Go by plane, boat, bicycle, camel, canoe & limo to the 7 Wonders of the World. First class luxury all the way",
        "Fund and be a crew member on a month-long research expedition to protect endangered sea animals.",
        "Have your own personal jet available for one year to whisk you away whenever and wherever your heart desires.",
        "You take 3 friends on a first-class, 5-star resort tour to play the 50 best golf courses in the world.",
        "Add a wing to your city's library devoted to young writers and artists. Art celebrities visit often to support your work.",
        "Pampered in luxury for two full months. Relax, unwind in warm waters, deserted beaches, and romantic nights.",
        "Set up entrepreneurial business schools in 3rd world nations. Instructors are business people donating their knowledge & time.",
        "Visit small harbors in Italy, France, and Greece for a month with 12 friends on your private yacht.",
        "Create a hands-on farm eco-system for city kids to learn and care for animals and plants.",
        "Take 6 friends on a wild safari photographing the most exotic animals in the world. Enjoy 5-star luxury in your tent.",
        "Stop the loss of ancient trees. Donate 1,000 acres of forest and create a nature walk for all to enjoy.",
        "License a 12 person private skybox booth with food and beverage service at your favorite team's stadium.",
        "A private plane and guide take you and 5 friends to the most remote spots of Asia... where no tourists have gone before."
    ]
};

var FASTTRACK = {
    init: function () {
        var playerObj = APP.players[APP.currentPlayerArrPos()];
        var player = APP.currentPlayerArrPos();

        APP.display.clearCards();
        APP.display.clearBtns();
		$("#ft-end-turn-btn").hide();
        $("#fast-track-intro-card").hide();
        $("#ft-enter-btn").hide();
        $("#roll-btn").hide();
        $("#roll2-btn").hide();
		
        $("#fast-track-option-card").show();
        $("#ftic-ok-btn").show();

        playerObj.fastTrack = true;
        playerObj.fastTrackTurn = 1;
		
		// new savings and salary
        playerObj.cash += playerObj.payday * 100;
        playerObj.cashFlowDay = playerObj.payday + 50000;
		playerObj.winPay = playerObj.cashFlowDay + 50000;
		
		//playerObj.totalIncome += APP.display.getExpenses(APP.currentPlayerArrPos());

        // remove assets
        playerObj.stockAssets.splice(0, playerObj.stockAssets.length);
        playerObj.realEstateAssets.splice(0, playerObj.realEstateAssets.length);
        playerObj.businessAssets.splice(0, playerObj.businessAssets.length);
        playerObj.coinAssets.splice(0, playerObj.coinAssets.length);
        playerObj.personalAssets.splice(0, playerObj.personalAssets.length);

        //new current position
        var newPosition = 0;
        switch (player) {
            case 0:
                newPosition += 1;
                break;
            case 1:
                newPosition += 7;
                break;
            case 2:
                newPosition += 14;
                break;
            case 3:
                newPosition += 21;
                break;
            case 4:
                newPosition += 27;
                break;
            case 5:
                newPosition += 34;
                break;
            case 6:
                newPosition += 1;
                break;
            case 7:
                newPosition += 7;
                break;
        }
        //send to board2
        var oldTokenElement = document.getElementById(
            "tokenSection" + parseInt(playerObj.position, 10)
        );
        var playerTokenEle = document.getElementById(
            "player" + parseInt(APP.currentPlayer, 10) + "-piece"
        );
        playerTokenEle.remove();
        // Add token to new section
        playerObj.position = newPosition;
        
        var token = APP.display.tokens[player].ele;
        var newSquare = document.getElementById(
            "tokenSection2-" + parseInt(playerObj.position, 10)
        );
        $(token).appendTo(newSquare);

        APP.finance.statement();
    },
    rollDie: function (dieCount) {
        var die = Math.floor(Math.random() * 6) + 1;
        return die * dieCount;
    },
    movePlayer: function (dieCount) {
        //move player piece the amount of rolledDie
        var player = APP.currentPlayerArrPos();
        var pObj = APP.players[player];
        var previousPosition = pObj.position;
        var dice = this.rollDie(dieCount);

        var token = APP.display.tokens[player];

        //remove old piece
        var playerTokenEle = document.getElementById(
            "player" + parseInt(APP.currentPlayer, 10) + "-piece"
        );
        playerTokenEle.remove();
		
        //update board position
        this.updatePosition(dice);
        // Add token to new section
        var token = APP.display.tokens[player].ele;
        var currentPosition = pObj.position;
        var newSquare = document.getElementById(
            "tokenSection2-" + parseInt(currentPosition, 10)
        );
        $(token).appendTo(newSquare);

        //when player lands on square load card
        APP.loadCard(currentPosition);

        if (previousPosition < 10 && currentPosition >= 10) {
            pObj.cash += pObj.payday;
        } else if (previousPosition < 18 && currentPosition >= 18) {
            pObj.cash += pObj.payday;
        } else if (previousPosition < 30 && currentPosition >= 30) {
            pObj.cash += pObj.payday;
        } else if (previousPosition < 38 && previousPosition + dice >= 38) {
            pObj.cash += pObj.payday;
        }
		
		if (currentPosition == 24) {
			this.dream();
		}

        APP.finance.statement();
    },
    updatePosition: function (dice) {
        var player = APP.players[APP.currentPlayerArrPos()];

        if (player.position + dice <= 40) {
            player.position += dice;
        } else {
            var pos = player.position + dice;
            pos -= 40;
            player.position = pos;
        }
    },
    square: {
        doodad1: {
            title: "Healthcare!",
			info: "<div id='doodad-text'><div><span>Roll one die.</span><br><span>If it's 1-3, you're covered.</span><br><span>If it's 4-6, you're not- Pay all of your cash.</span>"
        },
        charity: {
            title: "CHARITY",
            text: "Donate 10% of CASHFLOW Day Income and use 1 or 2 dice for next 3 turns"
        },
        square3: {
            title: "Burger Shop",
            text: "+9,500/mo Cash Flow 38% Cash-on-Cash return",
            cashFlowText: "$9,500",
            costText: "$300,000",
            cashFlow: 9500,
            cost: 300000
        },
        square4: {
            title: "Heat & A/C Service",
            text: "+10,000/mo Cash Flow 60% Cash-on-Cash return",
            cashFlowText: "$10,000",
            costText: "$200,000",
            cashFlow: 10000,
            cost: 200000
        },
        square5: {
            title: "Quick Food Market",
            text: "+5,000/mo Cash Flow 50% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$120,000",
            cashFlow: 5000,
            cost: 120000
        },
        square6: {
            title: "Assisted Living Center",
            text: "+8,000/mo Cash Flow 24% Cash-on-Cash return",
            cashFlowText: "$8,000",
            costText: "$400,000",
            cashFlow: 8000,
            cost: 400000
        },
        doodad2: {
            title: "Lawsuit!",
			text: "Pay one half of your cash to defend yourself."
        },
        square8: {
            title: "Ticket Sales Company",
            text: "+5,000/mo Cash Flow 40% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$150,000",
            cashFlow: 5000,
            cost: 150000
        },
        square9: {
            title: "Hobby Supply Store",
            text: "+3,000/mo Cash Flow 36% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$100,000",
            cashFlow: 3000,
            cost: 100000
        },
        cashFlowDay1: {
            title: "cashflow day"
        },
        square11: {
            title: "Fried Chicken Restaurant",
            text: "+10,000/mo Cash Flow 40% Cash-on-Cash return",
            cashFlowText: "$10,000",
            costText: "$300,000",
            cashFlow: 10000,
            cost: 300000
        },
        square12: {
            title: "Dry Dock Storage",
            text: "+3,000/mo Cash Flow 36% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$100,000",
            cashFlow: 3000,
            cost: 100000
        },
        square13: {
            title: "Beauty Salon",
            text: "+10,000/mo Cash Flow 48% Cash-on-Cash return",
            cashFlowText: "$10,000",
            costText: "$250,000",
            cashFlow: 10000,
            cost: 250000
        },
        doodad3: {
            title: "Tax Audit!",
			text: "Pay accountants and lawyers one half of your cash."
        },
        square15: {
            title: "Auto Repair Shop",
            text: "+6,000/mo Cash Flow 48% Cash-on-Cash return",
            cashFlowText: "$6,000",
            costText: "$150,000",
            cashFlow: 6000,
            cost: 150000
        },
        square16: {
            title: "Extreme Sports Equipment Rental",
            text: "+5,000/mo Cash Flow 40% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$150,000",
            cashFlow: 5000,
            cost: 150000
        },
        square17: {
            title: "Foreign Oil Deal",
            text: "+75,000/mo Cash Flow if you roll a 6 on one die, or else $0 Cash Flow",
            costText: "$750,000",
            cashFlowText: "$75,000",
            cashFlow: 0,
            cost: 750000
        },
        cashFlowDay2: {
            title: "CASHFLOW DAY"
        },
        square19: {
            title: "Movie Theater",
            text: "+6,000/mo Cash Flow 48% Cash-on-Cash return",
            cashFlowText: "$6,000",
            costText: "$150,000",
            cashFlow: 6000,
            cost: 150000
        },
        square20: {
            title: "Research Disease Center",
            text: "+8,000/mo Cash Flow 32% Cash-on-Cash return",
            cashFlowText: "$8,000",
            costText: "$300,000",
            cashFlow: 8000,
            cost: 300000
        },
        doodad4: {
            title: "Bad Partner!",
			text: "Lose lowest cash-flowing asset",
			lowestAsset: "<div id='lowest-asset'></div>"
        },
        square22: {
            title: "App Development Company",
            text: "+5,000/mo Cash Flow 40% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$150,000",
            cashFlow: 5000,
            cost: 150000
        },
        square23: {
            title: "Software Co. IPO",
            text: "Buy 250,000 shares at 10 cents/share. If you roll a 6 on one die, shares go to $2/share - get $500,000 cash from bank. Roll less than 6, get $0.",
            returnText: "$500,000",
            costText: "$25,000",
            return: 500000,
            cost: 25000
        },
        square24: {
            /*title: "Coffee Shop",
            text: "+5,000/mo Cash Flow 50% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$120,000",
            cashFlow: 5000,
            cost: 120000*/
			title: "Dream",
            text: "A chance to have your dream come true",
            costText: "$150,000",
            cost: 150000
        },
        square25: {
            title: "400-Unit Apartment Building",
            text: "+8,000/mo Cash Flow 48% Cash-on-Cash return",
            cashFlowText: "$8,000",
            costText: "$200,000",
            cashFlow: 8000,
            cost: 200000
        },
        square26: {
            title: "Island Vacation Rentals",
            text: "+3,000/mo Cash Flow 36% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$100,000",
            cashFlow: 3000,
            cost: 100000
        },
        doodad5: {
            title: "Divorce!",
			text: "Lose half of your cash."
        },
        square28: {
            title: "Build Pro Golf Course",
            text: "+6,000/mo Cash Flow 48% Cash-on-Cash return",
            cashFlowText: "$6,000",
            costText: "$150,000",
            cashFlow: 6000,
            cost: 150000
        },
        square29: {
            title: "Pizza Shop",
            text: "+7,000/mo Cash Flow 37.3% Cash-on-Cash return",
            cashFlowText: "$7,000",
            costText: "$225,000",
            cashFlow: 7000,
            cost: 225000
        },
        cashFlowDay3: {
            title: "cashflow day"
        },
        square31: {
            title: "Collectibles Store",
            text: "+3,000/mo Cash Flow 36% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$100,000",
            cashFlow: 3000,
            cost: 100000
        },
        square32: {
            title: "Frozen Yogurt Shop",
            text: "+3,000/mo Cash Flow 30% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$120,000",
            cashFlow: 3000,
            cost: 120000
        },
        square33: {
            title: "Bio Tech Co. IPO",
            text: "If you invest, pay $50,000 and roll one die. If you roll a 5 or 6, collect $500,000! If less, you lose your investment and collect nothing",
            returnText: "$500,000",
            costText: "$50,000",
            return: 500000,
            cost: 50000
        },
        doodad6: {
            title: "Unforseen Repairs!",
			text: "Pay 10x monthly cash flow of lowest cash flowing asset or lose business."
        },
        square35: {
            title: "200-Unit Mini Storage",
            text: "+6,000/mo Cash Flow 36% Cash-on-Cash return",
            cashFlowText: "$6,000",
            costText: "$200,000",
            cashFlow: 6000,
            cost: 200000
        },
        square36: {
            title: "Dry Cleaning Business",
            text: "+3,000/mo Cash Flow 24% Cash-on-Cash return",
            cashFlowText: "$3,000",
            costText: "$150,000",
            cashFlow: 3000,
            cost: 150000
        },
        square37: {
            title: "Mobile Home Park",
            text: "+9,000/mo Cash Flow 27% Cash-on-Cash return",
            cashFlowText: "$9,000",
            costText: "$400,000",
            cashFlow: 9000,
            cost: 400000
        },
        cashFlowDay4: {
            title: "cashflow day"
        },
        square39: {
            title: "Family Restaurant",
            text: "+14,000/mo Cash Flow 56% Cash-on-Cash return",
            cashFlowText: "$14,000",
            costText: "$300,000",
            cashFlow: 14000,
            cost: 300000
        },
        square40: {
            title: "Private Wildlife Reserve",
            text: "+5,000/mo Cash Flow 30% Cash-on-Cash return",
            cashFlowText: "$5,000",
            costText: "$120,000",
            cashFlow: 5000,
            cost: 120000
        }
    },
    printSquares: function () {
        document.getElementById("cell201").innerHTML =
            "<div class ='cellx2'><div id='tokenSection2-1'></div>" +
            "<span class='fast-track-space-title' style='font-size: 7pt;'>HEALTHCARE</span><br><div class='fast-track-cell-info' id='ft-doodad1'> " +
			FASTTRACK.square.doodad1.info
             + "</div>";
        document.getElementById("cell202").innerHTML =
            "<div class ='cellx2'><div id='tokenSection2-2'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.charity.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + FASTTRACK.square.charity.text + "</span></div></div>";
        document.getElementById("cell203").innerHTML =
            "<div class ='cellx2'><div id='tokenSection2-3'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square3.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span> +9,500/mo CF </span><br>" +
            "<span> $300,000 down </span></div></div>";
        document.getElementById("cell204").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-4'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square4.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+10,000/mo CF" + "</span><br>" +
            "<span>" + "$200,000 down" + "</span></div></div>";
        document.getElementById("cell205").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-5'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square5.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+5,000/mo CF" + "</span><br>" +
            "<span>" + "$120,000 down" + "</span></div></div>";
        document.getElementById("cell206").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-6'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square6.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+8,000/mo CF" + "</span><br>" +
            "<span>" + "$400,000 down" + "</span></div></div>";
        document.getElementById("cell207").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-7'></div>" +
            "<span class='fast-track-space-title'>LAWSUIT!</span><br>" +
            "<div class='fast-track-cell-info'><span>Pay one half of your cash to defend yourself.</span></div></div>";
        document.getElementById("cell208").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-8'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square8.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+5,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 down" + "</span></div></div>";
        document.getElementById("cell209").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-9'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square9.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+3,000/mo CF" + "</span><br>" +
            "<span>" + "$100,000 down" + "</span></div></div>";
        document.getElementById("cell210").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-10'></div>" +
            "<span class='fast-track-space-title'><br> CASHFLOW <br> DAY</span>" +
            "</div>";
        document.getElementById("cell211").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-11'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square11.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+10,000/mo CF" + "</span><br>" +
            "<span>" + "$300,000 down" + "</span></div></div>";
        document.getElementById("cell212").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-12'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square12.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+3,000/mo CF" + "</span><br>" +
            "<span>" + "$100,000 down" + "</span></div></div>";
        document.getElementById("cell213").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-13'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square13.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+10,000/mo CF" + "</span><br>" +
            "<span>" + "$250,000 down" + "</span></div></div>";
        document.getElementById("cell214").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-14'></div>" +
            "<span class='fast-track-space-title'>TAX AUDIT!</span><br>" +
            "<div class='fast-track-cell-info'><span>Pay accountants and lawyers one half of your cash.</span></div></div>";
        document.getElementById("cell215").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-15'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square15.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+6,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 down" + "</span></div></div>";
        document.getElementById("cell216").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-16'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square16.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+5,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 down" + "</span></div></div>";
        document.getElementById("cell217").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-17'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square17.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+75,000/mo CF if you roll a 6 on one die, or else $0 CF" + "</span><br>" +
            "<span>" + "$750,000 Investment" + "</span></div></div>";
        document.getElementById("cell218").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-18'></div>" +
            "<span class='fast-track-space-title'><br> CASHFLOW <br> DAY</span>" +
            "</div>";
        document.getElementById("cell219").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-19'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square19.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+6,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 Down" + "</span></div></div>";
        document.getElementById("cell220").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-20'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square20.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+8,000/mo CF" + "</span><br>" +
            "<span>" + "$300,000 Down" + "</span></div></div>";
        document.getElementById("cell221").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-21'></div>" +
            "<span class='fast-track-space-title'>BAD PARTNER</span><br>" +
            "<div class='fast-track-cell-info'><span>Lose lowest cash-flowing asset.</span></div></div>";
        document.getElementById("cell222").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-22'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square22.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+5,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 Down" + "</span></div></div>";
        document.getElementById("cell223").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-23'></div>" +
            "<span class='fast-track-space-title' style='font-size: 10px;'>" + FASTTRACK.square.square23.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span style='font-size: 7px;'>Buy 250,000 shares at 10 cents. Roll a 6, shares go to $2, collect $500,000, else get $0. </span><br>" +
            "<span> $25,000 Investment </span></div></div>";
        document.getElementById("cell224").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-24'></div>" +
            "<span class='fast-track-space-title'>" + 
			FASTTRACK.square.square24.title + "</span><br>" +
            "<div class='fast-track-cell-info'>" +
			"<span>" + this.square.square24.text + "</span>" + 
			"</div></div>";
        document.getElementById("cell225").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-25'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square25.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+8,000/mo CF" + "</span><br>" +
            "<span>" + "$300,000 Down" + "</span></div></div>";
        document.getElementById("cell226").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-26'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square26.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+3,000/mo CF" + "</span><br>" +
            "<span>" + "$100,000 Down" + "</span></div></div>";
        document.getElementById("cell227").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-27'></div>" +
            "<span class='fast-track-space-title'>DIVORCE!</span><br>" +
            "<div class='fast-track-cell-info'><span>Lose half of your cash.</span></div></div>";
        document.getElementById("cell228").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-28'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square28.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+6,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 Down" + "</span></div></div>";
        document.getElementById("cell229").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-29'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square29.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+7,000/mo CF" + "</span><br>" +
            "<span>" + "$225,000 Down" + "</span></div></div>";
        document.getElementById("cell230").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-30'></div>" +
            "<span class='fast-track-space-title'><br> CASHFLOW <br> DAY</span></div>";
        document.getElementById("cell231").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-31'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square31.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+3,000/mo CF" + "</span><br>" +
            "<span>" + "$100,000 Down" + "</span></div></div>";
        document.getElementById("cell232").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-32'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square32.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+5,000/mo CF" + "</span><br>" +
            "<span>" + "$120,000 Down" + "</span></div></div>";
        document.getElementById("cell233").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-33'></div>" +
            "<span class='fast-track-space-title' style='font-size: 10px;'>" + FASTTRACK.square.square33.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span style='font-size: 8px;'>Pay $50,000, if you roll a 5 or 6 collect $500,000, otherwise collect $0 </span><br>" +
            "<span> $50,000 Investment </span></div></div>";
        document.getElementById("cell234").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-34'></div>" +
            "<span class='fast-track-space-title'>UNFORSEEN REPAIRS</span><br>" +
            "<div class='fast-track-cell-info'><span>Pay 10x monthly cash flow of lowest cash flowing asset or lose business.</span></div></div>";
        document.getElementById("cell235").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-35'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square35.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+6,000/mo CF" + "</span><br>" +
            "<span>" + "$200,000 Down" + "</span></div></div>";
        document.getElementById("cell236").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-36'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square36.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+3,000/mo CF" + "</span><br>" +
            "<span>" + "$150,000 Down" + "</span></div></div>";
        document.getElementById("cell237").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-37'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square37.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+9,000/mo CF" + "</span><br>" +
            "<span>" + "$400,000 Down" + "</span></div></div>";
        document.getElementById("cell238").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-38'></div>" +
            "<span class='fast-track-space-title'><br> CASHFLOW <br> DAY</span></div>";
        document.getElementById("cell239").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-39'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square39.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+9,000/mo CF" + "</span><br>" +
            "<span>" + "$400,000 Down" + "</span></div></div>";
        document.getElementById("cell240").innerHTML =
            "<div class ='cellx2'>" +
            "<div id='tokenSection2-40'></div>" +
            "<span class='fast-track-space-title'>" + FASTTRACK.square.square40.title + "</span><br>" +
            "<div class='fast-track-cell-info'><span>" + "+9,000/mo CF" + "</span><br>" +
            "<span>" + "$400,000 Down" + "</span></div></div>";
    },
	opportunity: function(boardPosition) {
		var player = APP.players[APP.currentPlayerArrPos()];
		var currentSquare = "square" + String(boardPosition);
		var asset = this.square[currentSquare];
		
		$("#ft-opp-prompt").hide();
		
		// if dream space
		if(currentSquare == "square24"){
			//show win
			APP.display.clearCards();
			APP.display.clearBtns();
			
			$("#win-game-card").show();
			
			if (APP.remainingPlayers == APP.pCount){
					$("#win-scenario").text(APP.name(APP.currentPlayer) + "wins the game by achieving their dream!");
				} else {
					$("#win-scenario").text(APP.name(APP.currentPlayer) + "has achieved their dream!");
				}
			
			APP.remainingPlayers -= 1;
			
			document.getElementById("win-cash-amount").innerHTML = APP.display.numWithCommas(Math.round(100 * player.cash) / 100);
			document.getElementById("win-income-amount").innerHTML = APP.display.numWithCommas(Math.round(player.cashFlowDay + APP.finance.getIncome(APP.currentPlayerArrPos())));
			//document.getElementById("win-asset-amount").innerHTML = player.fastTrackAssets.length;

		} else	{
			
			//if regular space add asset to array
			
			if (asset.cost <= player.cash) {
				player.cash -= asset.cost;
				player.cashFlowDay += asset.cashFlow;
				
				asset.id = APP.finance.newId();
				
				//add asset to player assets
				player.fastTrackAssets.push(asset);
				
			} /*else {
				// tell them they cannot afford it
				$("#ft-opp-prompt").show();
				document.getElementById("ft-opp-prompt").innerHTML = "You need $" + APP.display.numWithCommas(this.remainder()) + " to get this deal!";
			}*/
			
			this.finishTurn();
		}
		
		APP.finance.statement();
	},
	doodad: function(boardPosition) {
		var player = APP.players[APP.currentPlayerArrPos()];
		var roll = APP.rollDie(1);
		
		switch(boardPosition) {
			case 1:
				var newRoll = APP.rollDie(1);
				if (newRoll >= 4) {
					player.cash = 0;
					document.getElementById("ft-doodad1").innerHTML = "<span>You rolled a " + newRoll + ". </span><span>You spend all of your cash for the expenses.</span>";
				} else {
					document.getElementById("ft-doodad1").innerHTML = "<span>You rolled a " + newRoll + ". </span><span>You're covered.</span>";
				}
				//hide card info
				//load info
				$("#ft-doodad-text2").hide();
				break;
            case 7:
            case 14:
			case 27:
				//show amount paid
				$("#ft-doodad-text2").show();
				document.getElementById("ft-doodad-cost").innerHTML = APP.display.numWithCommas(Math.round(player.cash * 0.5));
				player.cash = player.cash * 0.5;
				break;
            case 21:
				//console.log(player.fastTrackAssets);
				//find lowest number in fastTrackAssets
				var lowestAsset = player.fastTrackAssets[0];
				var lowest = player.fastTrackAssets[0].cashFlow;
				
				player.fastTrackAssets.forEach(function(current){	
					if (current.cashFlow < lowest) {
						lowestAsset = current
					}
									
				});

				player.totalIncome -= lowest;
					
				console.log(player.fastTrackAssets);
				
				$("#ft-doodad-text2").hide();
				$("#lowestAsset").text(lowestAsset);
				
				delete lowestAsset;
				break;
            case 34:
				var lowest = player.fastTrackAssets[0].cashFlow;
					
				player.fastTrackAssets.forEach(function(current){	
					if (current.cashFlow < lowest) {
						lowest = current;
					}					
				});
				
				console.log(lowest);
				// pay ten times lowest asset or lose it
				if ((10 * lowest) < player.cash) {
					player.cash - (lowest * 10);
					//show how much that player paid
					$("#ft-doodad-cost").text(APP.display.numWithCommas(lowest * 10));
				} else {
					//remove asset
					//show the player lost an asset
					$("#ft-doodad-text").text("You lost an asset");
					$("#ft-doodad-text2").hide();
				}	
				break;
		}
		
		$("#ft-end-turn-btn").show();
	},
	dream: function(){
		var roll = APP.rollDie();
		
		if (roll == 2 % 0) {
			$("#ft-opp-buy-btn").show();
			//console.log("You rolled a " + roll + ".");
			
		} else {
			$("#ft-dream-roll-btn").hide();
			//console.log("You rolled a " + roll + ".");
		}
		//console.log(roll)
	},
	roll: function(){
		var playerObj = APP.players[APP.currentPlayerArrPos()];
		var currentPosition = playerObj.position;
		var currentSquare = "square" + String(currentPosition);
		var asset = this.square[currentSquare];
		var dieNum = this.rollDie();
		
		console.log("rolling..." + currentPosition);
		
		switch(currentPosition){
			case 17: 
				if (asset.cost <= playerObj.cash) {
					playerObj.cash -= asset.cost;
					asset.id = APP.finance.newId();
						
					$("ft-opp-prompt").show()
					$("#ft-opp-roll").hide();
					
					//roll
					if (dieNum == 6) {
						$("ft-opp-prompt").html("You rolled a " + dieNum + ".");
						//increase player cash flow
						asset.cashFlow = 75000;
						playerObj.cashFlowDay += asset.cashFlow;
					} else {
						$("ft-opp-prompt").html("You rolled a " + dieNum + ".");
						//do not increase player cash flow
					}
					//add asset to player assets
					playerObj.fastTrackAssets.push(asset);
					
					console.log(dieNum);
				} else {
					//if cannot afford
					this.finishTurn();
				}
			break;
			case 23:
			break;
			case 33:
			break;
		};
	},
	remainder: function(){
		var player = APP.players[APP.currentPlayerArrPos()];
		var square = "square" + String(player.position);
		
		return Math.round(this.square[square].cost - player.cash);
	},
	finishTurn: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
		//hide 
			//opportunity card
			//charity card
			
        $("#ft-opp-buy-btn").hide();

        APP.display.clearCards();
        APP.display.clearBtns();
		
		// check for winning payday
		if (player.cashFlowDay >= player.winPay){
			
			console.log("game won," + "finishTurn(): " + player.winPay);
			
			$("#win-game-card").show();
				
			if (APP.remainingPlayers == APP.pCount){
				$("#win-scenario").text(APP.name(APP.currentPlayer) + "wins the game by adding over $50,000 to their Cash Flow Day!");
			} else {
				$("#win-scenario").text(APP.name(APP.currentPlayer) + "wins the game by adding over $50,000 to their Cash Flow Day!");
			}
			
			APP.remainingPlayers -= 1;
			
			document.getElementById("win-cash-amount").innerHTML = APP.display.numWithCommas(player.cash);
			document.getElementById("win-income-amount").innerHTML = APP.display.numWithCommas(Math.round(player.cashFlowDay + APP.finance.getIncome(APP.currentPlayerArrPos())));
			//document.getElementById("win-asset-amount").innerHTML = APP.display.numWithCommas(player.fastTrackAssets.length);

			$("#win-card-new-game-btn").click(function(){
				window.location.reload(false);
				/*APP.display.hideHomeScreen();
				APP.display.hideGameSelectionScreen();
				$("#game-container").hide();
				$("#finance-box").hide();
				
				APP.display.showGameSetupScreen();
				
				for (var i = APP.pCount; i >= APP.players.length; i--){
					delete APP.players[i];
				}
				
				$("#player-list-table").empty();
				
				setInterval(function(){
					$("#home-screen").hide();
				}, 1);*/
			});
			//highlight stuff
		} else{
			$("#ft-finish-turn-card").show();
			$("#ft-end-turn-btn").show();
		}
		
		if (player.position == 2) {
			$("#ft-finish-alert").show();
			$("#ft-finish-alert").text(APP.randomDealText(player.position));
		} else if (player.position !== (1 || 7 || 10 || 14 || 18 || 21 || 27 || 30 || 34 || 38)) {
			$("#ft-finish-alert").show();
			$("#ft-finish-alert").text(APP.randomDealText(player.position));
		}
		
		//remove card highlight
		$("#turn-info").css("box-shadow", "0 0 2px #212121");
		$(".card-title").css("text-shadow", ".2px .2px .2px #7DCEA0");
		$(".card-title").css("color", "#4E342E");

        APP.finance.statement();
	}
};

APP.scenario = function (
    jobTitle,
    startingSalary,
    startingSavings,
    taxes,
    mortgagePayment,
    carPayment,
    creditCardPayment,
    retailPayment,
    otherExpenses,
    mortgage,
    carLoan,
    creditDebt,
    retailDebt
) {
    this.jobTitle = jobTitle;
    this.startingSalary = startingSalary;
    this.startingSavings = startingSavings;
    this.taxes = taxes;
    this.mortgagePayment = mortgagePayment;

    this.carPayment = carPayment;
    this.creditCardPayment = creditCardPayment;
    this.retailPayment = retailPayment;
    this.otherExpenses = otherExpenses;
    this.cash = 0;

    this.mortgage = mortgage;
    this.carLoan = carLoan;
    this.creditDebt = creditDebt;
    this.retailDebt = retailDebt;
    this.position = 0;

    this.charityTurns = 0;
    this.childExpense = 0;
    this.children = 0;
    this.name = APP.name(APP.currentPlayer);
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
};

APP.scenarioChoices = [
    ["Airline Pilot", 9500, 400, 2350, 1300, 300, 660, 50, 2210, 143000, 15000, 22000, 1000],
    ["Business Manager", 4600, 400, 910, 700, 120, 90, 50, 1000, 75000, 6000, 3000, 1000],
    ["Doctor (MD)", 13200, 400, 3420, 1900, 380, 270, 50, 2880, 202000, 19000, 9000, 1000],
    ["Engineer", 4900, 400, 1050, 700, 140, 120, 50, 1090, 75000, 7000, 4000, 1000], 
    ["Janitor", 1600, 560, 280, 200, 60, 60, 50, 300, 20000, 4000, 2000, 1000],
    ["Lawyer", 7500, 400, 1830, 1100,  220, 180, 50, 1650, 115000, 11000, 6000, 1000],
    ["Mechanic", 2000, 670, 360, 300, 60, 60, 50, 450, 31000, 3000, 2000, 1000],
    ["Nurse", 3100, 480, 600, 400, 100, 90, 50, 710, 47000, 5000, 3000, 1000],
    ["Police Officer", 3000, 520, 580, 400, 100, 60, 50, 690, 46000, 5000, 2000, 1000],
    ["Secretary", 2500, 710, 460, 400, 80, 60, 50, 570, 38000, 4000, 2000, 1000],
    ["Teacher (K-12)", 3300, 400, 630, 500, 100, 90, 50, 760, 50000, 5000, 3000, 1000],
    ["Truck Driver", 2500, 750, 460, 400, 80, 60, 50, 570, 38000, 4000, 2000, 1000],
	["CEO", 24000, 1600000, 7200, 1900, 800, 250, 50, 4200, 750000, 30000, 11000, 1000]
];

APP.board = {
    square: [
        ["OPPORTUNITY", "#21940f"],
        ["LIABILITY", "#cc1f00"],
        ["OPPORTUNITY", "#21940f"],
        ["CHARITY", "gold"],
        ["OPPORTUNITY", "#21940f"],
        ["PAYCHECK", "#e3ce00"],
        ["OPPORTUNITY", "#21940f"],
        ["OFFER", "#0082e3"],
        ["OPPORTUNITY", "#21940f"],
        ["LIABILITY", "#cc1f00"],
        ["OPPORTUNITY", "#21940f"],
        ["CHILD", "#00bd92"],
        ["OPPORTUNITY", "#21940f"],
        ["PAYCHECK", "#e3ce00"],
        ["OPPORTUNITY", "#21940f"],
        ["OFFER", "#0082e3"],
        ["OPPORTUNITY", "#21940f"],
        ["LIABILITY", "#cc1f00"],
        ["OPPORTUNITY", "#21940f"],
        ["DOWNSIZE", "teal"],
        ["OPPORTUNITY", "#21940f"],
        ["PAYCHECK", "#e3ce00"],
        ["OPPORTUNITY", "#21940f"],
        ["OFFER", "#0082e3"]
    ],
    printSquares: function () {
        document.getElementById("cell0").innerHTML =
            "<div id='tokenSection0'><div class ='cellx'><p>" +
            APP.board.square[0][0] +
            " </p></div></div>";
        document.getElementById("cell1").innerHTML =
            "<div id='tokenSection1'><div class ='cellx'><p>" +
            APP.board.square[1][0] +
            " </p></div></div>";
        document.getElementById("cell2").innerHTML =
            "<div id='tokenSection2'><div class ='cellx'><p>" +
            APP.board.square[2][0] +
            " </p></div></div>";
        document.getElementById("cell3").innerHTML =
            "<div id='tokenSection3'><div class ='cellx'><p>" +
            APP.board.square[3][0] +
            " </p></div></div>";
        document.getElementById("cell4").innerHTML =
            "<div id='tokenSection4'><div class ='cellx'><p>" +
            APP.board.square[4][0] +
            " </p></div></div>";
        document.getElementById("cell5").innerHTML =
            "<div id='tokenSection5'><div class ='cellx'><p>" +
            APP.board.square[5][0] +
            " </p></div></div>";
        document.getElementById("cell6").innerHTML =
            "<div id='tokenSection6'><div class ='cellx'><p>" +
            APP.board.square[6][0] +
            " </p></div></div>";
        document.getElementById("cell7").innerHTML =
            "<div id='tokenSection7'><div class ='cellx'><p>" +
            APP.board.square[7][0] +
            " </p></div></div>";
        document.getElementById("cell8").innerHTML =
            "<div id='tokenSection8'><div class ='cellx'><p>" +
            APP.board.square[8][0] +
            " </p></div></div>";
        document.getElementById("cell9").innerHTML =
            "<div id='tokenSection9'><div class ='cellx'><p>" +
            APP.board.square[9][0] +
            " </p></div></div>";
        document.getElementById("cell10").innerHTML =
            "<div id='tokenSection10'><div class ='cellx'><p>" +
            APP.board.square[10][0] +
            " </p></div></div>";
        document.getElementById("cell11").innerHTML =
            "<div id='tokenSection11'><div class ='cellx'><p>" +
            APP.board.square[11][0] +
            " </p></div></div>";
        document.getElementById("cell12").innerHTML =
            "<div id='tokenSection12'><div class ='cellx'><p>" +
            APP.board.square[12][0] +
            " </p></div></div>";
        document.getElementById("cell13").innerHTML =
            "<div id='tokenSection13'><div class ='cellx'><p>" +
            APP.board.square[13][0] +
            " </p></div></div>";
        document.getElementById("cell14").innerHTML =
            "<div id='tokenSection14'><div class ='cellx'><p>" +
            APP.board.square[14][0] +
            " </p></div></div>";
        document.getElementById("cell15").innerHTML =
            "<div id='tokenSection15'><div class ='cellx'><p>" +
            APP.board.square[15][0] +
            " </p></div></div>";
        document.getElementById("cell16").innerHTML =
            "<div id='tokenSection16'><div class ='cellx'><p>" +
            APP.board.square[16][0] +
            " </p></div></div>";
        document.getElementById("cell17").innerHTML =
            "<div id='tokenSection17'><div class ='cellx'><p>" +
            APP.board.square[17][0] +
            " </p></div></div>";
        document.getElementById("cell18").innerHTML =
            "<div id='tokenSection18'><div class ='cellx'><p>" +
            APP.board.square[18][0] +
            " </p></div></div>";
        document.getElementById("cell19").innerHTML =
            "<div id='tokenSection19'><div class ='cellx'><p>" +
            APP.board.square[19][0] +
            " </p></div></div>";
        document.getElementById("cell20").innerHTML =
            "<div id='tokenSection20'><div class ='cellx'><p>" +
            APP.board.square[20][0] +
            " </p></div></div>";
        document.getElementById("cell21").innerHTML =
            "<div id='tokenSection21'><div class ='cellx'><p>" +
            APP.board.square[21][0] +
            " </p></div></div>";
        document.getElementById("cell22").innerHTML =
            "<div id='tokenSection22'><div class ='cellx'><p>" +
            APP.board.square[22][0] +
            " </p></div></div>";
        document.getElementById("cell23").innerHTML =
            "<div id='tokenSection23'><div class ='cellx'><p>" +
            APP.board.square[23][0] +
            " </p></div></div>";
    }
};

var OPTIONS = {
	playerNumber: document.getElementById("player-number"),
    slider: document.getElementById("start-savings-slide"),
    output: document.getElementById("start-savings-option-value"),
    checkbox: document.querySelectorAll("input[type=checkbox]"),
	smallRE: document.getElementById("ao-small-real-estate"),
    bigRE: document.getElementById("ao-big-real-estate"),
    stocks: document.getElementById("ao-stocks"),
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
    checkState: function () {
        if (this.smallRE.checked == true && this.bigRE.checked == true && this.stocks.checked == true && this.mutuals.checked == true && this.cds.checked == true && this.coins.checked == true && this.limitedPartnership.checked == true && this.companies.checked == true && this.startingSavings.value == 1 && this.kids.checked == false && this.paycheckDoodads.checked == false /*&& this.playerLoans.checked == false && this.chooseJob.checked == false && this.oneDealDeck.checked == false*/) {
            $("#default-game-indicator").css("color", "#FDD835");
            $("#custom-game-indicator").css("color", "#4E342E");
        } else {
            $("#default-game-indicator").css("color", "#4E342E");
            $("#custom-game-indicator").css("color", "#FDD835");
        }
    },
    defaultOptions: function () {
        this.smallRE.checked = true;
        this.bigRE.checked = true;
        this.stocks.checked = true;
        this.mutuals.checked = true;
        this.cds.checked = true;
        this.coins.checked = true;
		this.limitedPartnership.checked = true;
		this.companies.checked = true;
        this.startingSavings.value = 1;
        this.kids.checked = false;
        this.paycheckDoodads.checked = false;
        this.playerLoans.checked = false;
        //this.chooseJob.checked = false;
        this.oneDealDeck.checked = false;
		this.paycheckDoodads.checked = false;
		this.mortgagePrepay.checked = false;
        OPTIONS.checkState();
    },
	setup: function(){
		// if an asset is unchecked delete
		if (this.smallRE.checked == false) {
			// remove deals from cards object
			for (var i = 1; i <= 13; i++){
				var deal = "realEstateS" + String(i);
				delete APP.cards.smallDeal[deal];
			}
			delete APP.cards.smallDeal.propertyDamage;
			
			// delete related offers
			delete APP.cards.offer.offer35;
			
		}
		if (this.bigRE.checked == false) {
			for (var i = 1; i <= 33; i++){
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
			delete APP.cards.smallDeal.preferredStock1;
			delete APP.cards.smallDeal.preferredStock2;			
		}
		if (this.mutuals.checked == false) {
			delete APP.cards.smallDeal.mutual01;
			delete APP.cards.smallDeal.mutual02;
			delete APP.cards.smallDeal.mutual03;
			delete APP.cards.smallDeal.mutual04;
			delete APP.cards.smallDeal.mutual05;
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
		
		//starting savings
		for (var j = 0; j < APP.players.length; j++){
			var player = APP.players[j];
			
			//set starting savings
			if (this.startingSavings.value == 0){
				player.cash = 0;
			} else if (this.startingSavings.value == 1){
				player.cash = player.jobTitle[2];
			} else if (this.startingSavings.value == 2){
				player.cash = player.jobTitle[1];
			} else if (this.startingSavings.value == 3){
				player.cash = player.jobTitle[1] * 2;					
			}
			
			//set kid limit on or off
			if (this.kids.checked == true){
				player.kidLimit = false;
			} else {
				player.kidLimit = true;
			}
		}
		
		// 3+ kids option
		for (var k = 1; k <= APP.pCount; k++){
			var playerArrPos = k - 1;
			var player = APP.players[playerArrPos];
			var playerCheck = String("po-insurance-p" + k);
			var check = document.getElementById(playerCheck);
			
			if (check.checked == true) {				
				player.hasInsurance = true;
				
				APP.finance.getInsurance(playerArrPos);
			}
		}
		
		// mortgage prepay
		if (this.mortgagePrepay.checked == true) {
			player.mortgagePrepay = true;
		}
	},
	fastTrackStart:function(){
		
	}
};

/*
//-- testing
/*
// for setting start cash and fast track
document.getElementById("start-game").addEventListener("click", function(){
	APP.players[APP.currentPlayerArrPos()].fastTrack = true;
	APP.players[APP.currentPlayerArrPos()].cash += 99999999;
});
// for setting start income
document.getElementById("ftic-ok-btn").addEventListener("click", function(){
	APP.players[APP.currentPlayerArrPos()].totalIncome += 50999;
});
*/

$(document).ready(function () {
	// init game
	 APP.initGame();
    $("#start-game").on("click", function () {
        $("#window").css("background-image", "");
        $("#window").css("background-color", "white" /*"#4E342E"/*#010410*/ );
    });
    $("#menu-new-game-btn").on("click", function () {
		
		
		window.location.reload(false);
		/*
		APP.display.hideHomeScreen();
		APP.display.hideGameSelectionScreen();
		$("#game-container").hide();
		$("#finance-box").hide();
		
		APP.display.showGameSetupScreen();
		
		for (var i = APP.pCount; i >= APP.players.length; i--){
			delete APP.players[i];
		}
		
		$("#player-list-table").empty();
		
		setInterval(function(){
			$("#home-screen").hide();
		}, 1);
		*/
    });
	
	// options
    OPTIONS.output.innerHTML = "Normal";
    $("#default-game-indicator").css("color", "#FDD835");
    $("#custom-game-indicator").css("color", "#4E342E");

    for (var i = 0; i < OPTIONS.checkbox.length; i++) {
        OPTIONS.checkbox[i].addEventListener('change', function () {
            OPTIONS.checkState();
        });
    }

    OPTIONS.slider.oninput = function () {
        if (this.value == 0) {
            OPTIONS.output.innerHTML = "None";
        } else if (this.value == 1) {
            OPTIONS.output.innerHTML = "Normal";
        } else if (this.value == 2) {
            OPTIONS.output.innerHTML = "Salary";
        } else if (this.value == 3) {
            OPTIONS.output.innerHTML = "2x Salary";
        }
        OPTIONS.checkState();
    };
	
	//--temp hides options checkboxes
	$(".off-options").hide();
	
	// game setup: show player options for selected amount of players
	var playerInputs = document.querySelectorAll("div.player-input");
	
	function showPlayerInputs() {
		var val = OPTIONS.playerNumber.value;
		var options = document.querySelectorAll("option.player-number-option");
		
		for (var i = 1; i <= options.length; i++) {
			var playerInputBox = "#player" + i + "input";
			if ( i <= val) {
				$(playerInputBox).show();
			} else {
				$(playerInputBox).hide();
			}
		}
	}
	OPTIONS.playerNumber.oninput = function () {
		var val = OPTIONS.playerNumber.value;
		var options = document.querySelectorAll("option.player-number-option");
		
		for (var i = 1; i <= options.length; i++) {
			var playerInputBox = "#player" + i + "input";
			if ( i <= val) {
				$(playerInputBox).show();
			} else {
				$(playerInputBox).hide();
			}
		}
	}
	showPlayerInputs();	
});
