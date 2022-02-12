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
    playerColors: [
        // Green
        'background: rgb(20,232,85); background: radial-gradient(circle, rgba(20,232,85,1) 0%, rgba(38,85,66,1) 55%, rgba(15,66,46,1) 97%);',
        // Red
        'background: rgb(232,20,20); background: radial-gradient(circle, rgba(232,20,20,1) 0%, rgba(80,36,36,1) 55%, rgba(60,13,13,1) 97%);',
        // Blue
        'background: rgb(40,89,235); background: radial-gradient(circle, rgba(40,89,235,1) 0%, rgba(6,32,94,1) 58%, rgba(6,25,96,1) 97%);',
        // Black
        'background: rgb(102,126,125); background: radial-gradient(circle, rgba(102,126,125,1) 4%, rgba(32,34,57,1) 67%, rgba(33,6,6,0.98) 88%);',
        //Pink
        'background: rgb(233,16,123); background: radial-gradient(circle, rgba(233,16,123,1) 0%, rgba(109,11,117,1) 55%, rgba(41,3,23,1) 97%);',
        // Teal
        'background: rgb(0,194,195); background: radial-gradient(circle, rgba(0,194,195,1) 0%, rgba(27,99,102,1) 54%, rgba(9,4,46,1) 97%);',
        // Orange 
        'background: rgb(238,146,25); background: radial-gradient(circle, rgba(238,146,25,1) 0%, rgba(117,50,11,1) 55%, rgba(34,26,3,1) 97%);',
        // White
        'background: rgb(212,212,212); background: radial-gradient(circle, rgba(212,212,212,1) 0%, rgba(246,246,246,1) 0%, rgba(255,255,255, 0.98) 93%);'
    ],
    colorGamePiece: function(num, color){
        var p = 'player' + parseInt(num, 10) + '-piece';
        var player = document.getElementById(p);

        switch(color){
            case 'Green':
                player.style.cssText += this.playerColors[0];
                break;
            case 'Red':
                player.style.cssText += this.playerColors[1];
                break;
            case 'Blue':
                player.style.cssText += this.playerColors[2];
                break;
            case 'Black':
                player.style.cssText += this.playerColors[3];
                break;
            case 'Pink':
                player.style.cssText += this.playerColors[4];
                break;
            case 'Aqua':
                player.style.cssText += this.playerColors[5];
                break;
            case 'Orange':
                player.style.cssText += this.playerColors[6];
                break;
            case 'White':
                player.style.cssText += this.playerColors[7];
                break;
            default:
                player.style.cssText += this.playerColors[7];

        }

    },
    updatePlayerColor: function(type, player){
        if (type === 'menu'){
            var p = document.getElementById('color-input-player' + parseInt( player, 10));
            
            switch(p.options[p.selectedIndex].value){
                case 'Random Color':
                    p.style.cssText += 'background: white';
                    p.style.cssText += 'color: black';
                    break;
                case 'Green':
                    p.style.cssText += this.playerColors[0];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Red':
                    p.style.cssText += this.playerColors[1];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Blue':
                    p.style.cssText += this.playerColors[2];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Black':
                    p.style.cssText += this.playerColors[3];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Pink':
                    p.style.cssText += this.playerColors[4];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Aqua':
                    p.style.cssText += this.playerColors[5];
                    p.style.cssText += 'color: white;';
                    break;
                case 'Orange':
                    p.style.cssText += this.playerColors[6];
                    p.style.cssText += 'color: white;';
                    break;
                case 'White':
                    p.style.cssText += this.playerColors[7];
                    p.style.cssText += 'color: #23232b;';
                    break;
            }
        }

        if (type === 'table row'){    
            var row = document.getElementById(("table-row-player" + parseInt(player, 10)));

            switch(APP.players[player-1].color){
                case 'Green':
                    row.style.cssText += this.playerColors[0];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Red':
                    row.style.cssText += this.playerColors[1];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Blue':
                    row.style.cssText += this.playerColors[2];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Black':
                    row.style.cssText += this.playerColors[3];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Pink':
                    row.style.cssText += this.playerColors[4];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Aqua':
                    row.style.cssText += this.playerColors[5];
                    row.style.cssText += 'color: white;';
                    break;
                case 'Orange':
                    row.style.cssText += this.playerColors[6];
                    row.style.cssText += 'color: white;';
                    break;
                case 'White':
                    row.style.cssText += this.playerColors[7];
                    row.style.cssText += 'color: #23232b;';
                    break;
            }
        }
    },
    renderBoard: function() {
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
    showTokens: function() {
        for (var i = 0; i < APP.players.length; i++) {
            var token = this.tokens[i].ele;
            var startSpace = document.getElementById("tokenSection0");
            startSpace.insertAdjacentHTML("beforeend", token);
            
            // Add color to game piece
            APP.display.colorGamePiece((i+1), APP.players[i].color);
        }
    },
    hideHomeScreen: function() {
        var hhs = document.getElementById("home-screen");
        hhs.style.display = hhs.style.display === "none" ? "" : "none";
    },
    showGameSelectionScreen: function() {
        var sgss = document.getElementById("game-selection-screen");
        sgss.style.display = sgss.style.display === "block" ? "block" : "block";
    },
    hideGameSelectionScreen: function() {
        var hgss = document.getElementById("game-selection-screen");
        hgss.style.display = hgss.style.display === "none" ? "" : "none";
    },
    hideSetup: function() {
        var hs = document.getElementById("setup-screen");
        hs.style.display = hs.style.display === "none" ? "" : "none";
    },
    showGameSetupScreen: function() {
        var sgss = document.getElementById("setup-screen");
        sgss.style.display = sgss.style.display === "block" ? "block" : "block";
    },
    showPlayerList: function() {
        var spl = document.getElementById("player-list");
        spl.style.display =
            spl.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showTurnInfo: function() {
        var st = document.getElementById("turn-info");
        st.style.display =
            st.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showFinanceBox: function() {
        var fb = document.getElementById("finance-box");
        fb.style.display =
            fb.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    hideDreamPhase: function() {
        var ds = document.getElementById("dream-choices");
        ds.style.display = ds.style.display === "none" ? "" : "none";
    },
    showRacePhase: function() {
        var sp = document.getElementById("turn-info-box");
        sp.style.display =
            sp.style.display === "inline-block" ? "inline-block" : "inline-block";
    },
    showStockCard: function() {
        $("#show-stock-form-btn").show();
        //$("#show-stock-sell-form-btn").show();
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
    showBuyStockForm: function() {
        $("#show-stock-form-btn").hide();
        $("#show-stock-sell-form-btn").hide();
        $("#sell-shares-form").hide();
        $("#sell-stock-btn").hide();
        $("#done-btn").hide();

        $("#done-buy-sell-btn").show();
        $("#buy-shares-form").show();
        $("#buy-stock-btn").show();
    },
    showSellStockForm: function() {
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
	showOffer: function() {
        var player = APP.players[APP.currentPlayerArrPos()];
        
		/*if (player.debt == true) {
            $("br-settlement-text").hide();
            $("#show-offer-btn").hide();
            $("#bankrupt-card").show();
        } else {*/
            $("#confirm-settlement-btn").hide();
            $("#settlement-card").hide();
            $("#show-offer-btn").hide();

            $("#offer-card").show();
            $("#done-btn").show();
        /*}*/
    },
	returnToCard: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
        var boardPosition = player.position;
		
		if (boardPosition % 2 === 0 || boardPosition === 0) {
            //return to deal
            APP.display.clearCards();
            APP.display.clearBtns();
			
			if (APP.currentDeal) {
				APP.display.showCurrentDeal();
				$("done-btn").show();
			} else {
				APP.finishTurn();
			}

            if (APP.currentDeal.downPayment <= player.cash) {
                $("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
				APP.display.showCurrentDeal();
            }	
        } else if (boardPosition === 19) {
            APP.display.clearCards();
            APP.display.clearBtns();
            $("#downsize-card").show();
            $("#ds-pay-button").show();
            $("#no-loan-btn").hide();
			
            player.downsizedTurns += 3;
            APP.finance.statement();
        } else if (boardPosition === 1 || boardPosition === 9 || boardPosition === 17) {
            APP.display.clearCards();
            APP.display.clearBtns();
			
            $("#doodad-card").show();
            $("#doodad-pay-button").show();

            APP.finance.statement();
        } else {
			APP.finishTurn();
		}
		
		if (document.getElementById("bankrupt-card").offestParent == null){
			player.debtSale = false;
		}
		
		APP.checkBankruptcy();
	},
	showCurrentDeal: function(){
		var player = APP.players[APP.currentPlayerArrPos()];
		
		//get currentdeal type
		var currentDeal = APP.currentDeal;
		var dealType = APP.currentDeal.type;
		
		APP.display.clearCards();
		APP.display.clearBtns();
		
		APP.finance.statement();
		
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

                if (APP.currentDeal.downPayment <= player.cash) {
                    $("#turn-info").css("box-shadow", ".2px .2px 3px 3px #43A047");
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

                if (APP.currentDeal.downPayment <= player.cash) {
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

                if (APP.currentDeal.downPayment <= player.cash) {
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
			case "Stock":
            case "Mutual Fund":
                $("#deal-card-stock").show();
				$("#deal-stock-name").show();
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
			case "Certificate of Deposit":
				$("#deal-card-stock").show();
                $("#show-stock-form-btn").show();
                $("#done-btn").show();
                $("#stock-cost-table").show();
				
                $("#deal-stock-rule").hide();
				$("#deal-stock-name").hide();
                $("#stock-table-trading-range-row").hide();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
				document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML = currentDeal.description;
                document.getElementById("deal-stock-rule").innerHTML = currentDeal.rule;
				
				document.getElementById("deal-stock-cost").innerHTML = currentDeal.price;
                document.getElementById("deal-stock-cash-flow").innerHTML = "Dividend: $" + currentDeal.dividend;
                document.getElementById("deal-stock-trading-range").innerHTML = currentDeal.range;
                document.getElementById(
                    "deal-stock-shares-owned"
                ).innerHTML = APP.display.numWithCommas(APP.ownedShares());
                document.getElementById("share-cost").innerHTML = currentDeal.price;
                document.getElementById("share-cost-sell").innerHTML = currentDeal.price;
				break;
			case "Preferred Stock":
                $("#deal-card-stock").show();
				$("#deal-stock-name").show();
                $("#show-stock-form-btn").show();
                $("#done-btn").show();
                $("#stock-cost-table").show();
                $("#deal-stock-rule").hide();
                $("#stock-table-trading-range-row").hide();

                document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
                document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
                document.getElementById("deal-stock-text").innerHTML = currentDeal.description;
                document.getElementById("deal-stock-cost").innerHTML = currentDeal.price;
                document.getElementById("deal-stock-cash-flow").innerHTML = "Dividend: $" + currentDeal.dividend;
                document.getElementById("deal-stock-trading-range").innerHTML = currentDeal.range;
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
									"Mansion" ||
                                    "duplex" ||
                                    "4-plex" ||
                                    "8-plex" ||
                                    "plex")) ||
                            obj.type === 
								("Real Estate" ||
									"plex")
                        ) {
                            document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
                            
							$("#pd-pay-button").show();
							
							$(".card-title").css("color", "#D32F2F");
                        } else if (damageType === "8-plex") {
							document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
                            
							$("#pd-pay-button").show();
							
							$(".card-title").css("color", "#D32F2F");
						}							
                    }
                }
                break;
            case "Stock Split":
                $("#deal-card-stock").show();
                $("#deal-stock-rule").show();
				$("#deal-stock-name").show();
				
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
				$("#deal-stock-name").show();
				
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
        }
	},
    increaseShares: function(option) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var arr = player.stockAssets;

		if (option == 1) {
			if (document.getElementById("share-amt-input").value){
				document.getElementById("share-amt-input").stepUp(1);
			}
        } else if (option == 2) {
			var index;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].selected != "undefined") {
					index = i;
				}
			}
			var shares = Number(arr[index].shares);
			if (document.getElementById("share-amt-input-sell").value < shares){
				document.getElementById("share-amt-input-sell").stepUp(1);
			}
        }
    },
    decreaseShares: function(option) {		
        if (option == 1) {
			if (document.getElementById("share-amt-input").value > 0){
				document.getElementById("share-amt-input").stepDown(1);
			}
        } else if (option == 2) {
			if (document.getElementById("share-amt-input-sell").value > 0){
				document.getElementById("share-amt-input-sell").stepDown(1);
			}
        }
    },
    clearBtns: function() {
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
		$("#return-to-card-btn").hide();
        $("#borrow-loan-btn").hide();
        $("#borrow-doodad-loan-btn").hide();
        $("#borrow-offer-loan-btn").hide();
        $("#confirm-pay-btn").hide();
        $("#done-repay-btn").hide();
        $("#show-stock-form-btn").hide();
        $("#show-stock-sell-form-btn").hide();
		$("#buy-stock-btn").hide();
        $("#sell-stock-btn").hide();
        $("#confirm-settlement-btn").hide();
        $("#show-offer-btn").hide();
		
        $("#ftic-ok-btn").hide();
        $("#ft-enter-btn").hide();
        $("#ft-dream-roll-btn").hide();
        $("#ft-doodad-roll-btn").hide();
        $("#ft-opp-buy-btn").hide();
        $("#ft-opp-roll-btn").hide();
		$("#ft-roll2-btn").hide()
        $("#ft-pass-btn").hide();
        $("#ft-end-turn-btn").hide();
		$("#ft-dream-roll-btn").hide();
		$("#ft-win-continue-btn").hide();

        $("#buy-real-estate-btn").hide();
        $("#buy-business-btn").hide();
    },
    clearCards: function() {
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
		$("#ft-opp-prompt").hide();
        $("#win-game-card").hide();

        $("#automated-cost-table").hide();
        $("#limited-cost-table").hide();
    },
    repay: function() {
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
    borrow: function() {
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
    highlightLiabilities: function(option) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var table = document.getElementById("liability-table");
        var rows = table.getElementsByTagName("tr");

        for (var i = 1; i < rows.length; i++) {
            var currentRow = table.rows[i];

            if (option === 1) {
                $('#fast-track-intro-card').hide();
                $('#fast-track-option-card').hide();
                
                currentRow.style.backgroundColor = "#FFEB3B";

                var addOnClick = function(row) {
                    var anchor = rows[i];
                    var cell = row.getElementsByTagName("td")[1];
                    var id = cell.getAttribute("id");

                    anchor.onclick = function() {
                        player.loanId = id;

                        var loanName;
                        var loanAmt;

                        switch (id) {
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
							$("#repay-loan-input").show();

                            $("#done-repay-btn").hide();
                            $("#pay-confirm-card").hide();
                            $("#confirm-pay-btn").hide();
                            $("#repay-card").hide();
							

							if (player.cash < 1000) {
								document.getElementById("loan-amt-input2").value = player.loans = 0;
								$("#repay-loan-input").hide();
							} else {
								
                            // form val is set to the highest amount the player can pay
								var maxVal = function(cash){
									if (cash < player.loans){
										return cash;
									} else {
										return player.loans;
									}
								};
								
								for (var i = 0; i < maxVal(player.cash); i += 1000) {
									document.getElementById("loan-amt-input2").value = i;
								}
                            }
                        } else if (id == "liability-mortgage") {
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
                            } else {
								$("#confirm-pay-btn").show();
								$("#cancel-btn").show();
								$("#pay-confirm-card").show();
								$("#pay-loan-confirmation").html("Are you sure?");
								// show loan info in card
								$("#repay-loan-name").text(loanName);
								$("#repay-loan-amt").text(loanAmt);

								$("#done-repay-btn").hide();
								$("#repay-loan-card").hide();
								$("#repay-card").hide();
							}

                            for (var i = 0; i < player.cash - 1000; i += 1000) {
                                document.getElementById("loan-amt-input2").value = 1000;
                            }

                        } else if (id == "liability-boat") {
                            $("#repay-loan-card").show();
                            $("#cancel-btn").show();

                            $("#done-repay-btn").hide();
                            $("#pay-confirm-card").hide();
                            $("#confirm-pay-btn").hide();
                            $("#repay-card").hide();

                            $("#repay-loan-name").text(loanName);
                            $("#repay-loan-amt").text(loanAmt);


                            for (var i = 0; i < player.cash - 1000; i += 1000) {
								var loanB = APP.finance.roundLoan(loanAmt);
                                document.getElementById("loan-amt-input2").value = loanB;
                            }
                        } else {
                            $("#confirm-pay-btn").show();
                            $("#cancel-btn").show();
                            $("#pay-confirm-card").show();
							$("#pay-loan-confirmation").html("Are you sure?");
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

                var removeOnClick = function() {
                    var table = document.getElementById("liability-table");
                    var rows = table.getElementsByTagName("tr");

                    for (var i = 1; i < rows.length; i++) {
                        var anchor = rows[i];

                        anchor.onclick = function() {
                            return 0;
                        };
                    }
                };
                removeOnClick(currentRow);
            }
        }
    },
    renderLiabilitiesTable: function() {
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
    renderAssetTable: function() {
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

            // row highlight for when the asset is available to be sold
			if (player.debtSale == true) {
                var rowId = "#asset" + parseInt(i, 10) + "-row";

                $(rowId).css("background-color", "#FFAB91");

                var addOnClick = function() {
                    var anchor = rows[i];
                    var id = anchor.getAttribute("id");

                    anchor.onclick = function() {
                        APP.getSettlement(id, true);
                    };
                };

                // when user clicks row show offer
                $(rowId).click(addOnClick());
            }
			
            if (realEstateAssetArr[i].highlight === "on") {
                var rowId = "#asset" + parseInt(i, 10) + "-row";

                // highlight row if offer matches asset type
                $(rowId).css("background-color", "#FFEB3B");

                // highlight card
                $("#turn-info").css("box-shadow", ".2px .2px 3px 3px #0277BD");

                var addOnClick = function() {
                    var anchor = rows[i];
                    var id = anchor.getAttribute("id");

                    anchor.onclick = function() {
                        APP.getSettlement(id, false);
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
			
			if (player.debt == true) {
                var rowId = "#asset" + parseInt(i, 10) + "-row";

                $(rowId).css("background-color", "#FFAB91");

                var addOnClick = function() {
                    var anchor = rows[i];
                    var id = anchor.getAttribute("id");

                    anchor.onclick = function() {
                        APP.getSettlement(id, true);
                    };
                };

                // when user clicks row show offer
                $(rowId).click(addOnClick());
            }
			
            if (coinAssetArr[j].highlight == true) {
                var rowId = "#asset-c" + parseInt(j, 10) + "-row";

                $(rowId).css("background-color", "#FFEB3B");
                //highlight card
                $("#turn-info").css("box-shadow", ".2px .2px 3px 3px #0277BD");

                switch (coinAssetArr[j].name) {
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

                $(rowId).click(function() {
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
    },
    renderStockTable: function() {
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
            if (symbol == "2BIG" || symbol == "1GLO" || symbol == "CD-A" || symbol == "CD-B") {
                $(tableId).append(stockRow2);
            } else {
                $(tableId).append(stockRow);
            }
            if (assetArr[i].highlight === "on") {
                var rowId = "#stock" + parseInt(i, 10) + "-row";

                $(rowId).css("background-color", "#FFEB3B");

                $(rowId).click(function() {
                    $("#sell-shares-form").show();
                    $("#sell-stock-btn").show();

                    var idArr = rowId.split('');
                    var curIndex = Number(idArr[6]);

                    assetArr[curIndex].selected = true;
                    document.getElementById("share-cost-bought").innerHTML = String(assetArr[curIndex].price);
                    document.getElementById("share-amt-input-sell").value = assetArr[curIndex].shares;
					
					/*document.getElementById("share-sell-total").innerHTML = APP.display.numWithCommas(
						assetArr[curIndex].price * assetArr[curIndex].shares
					);*/	
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
    continueFt: function() {
        //close fast track intro card
        if (APP.players[APP.currentPlayerArrPos()].fastTrack == false) {
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
    numWithCommas: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
	newGame: function() {
	//hide game board
		$("#board").hide();
        $("#board2").hide();
        $("#board-container").hide();
        $("#game-container").hide();
        $("#info").hide();
        $("#player-list").hide();
		
	//show game setup
		APP.display.showGameSetupScreen();
	
	//clear player list
		var tableId = document.getElementById("player-list-table");
		for (var i = tableId.children.length; i >= tableId.children.length; i--) {
			tableId.removeChild(tableId.childNodes[0]);
		}

		//clear APP.players
		for (var i = APP.players.length; i >= 0; i--){
			delete APP.players[i];
			console.log(APP.players);
		}
		
		//reset vars
		APP.pCount = 1;
		APP.turnCount = 1;
		APP.currentPlayer = 1;
	}
};
