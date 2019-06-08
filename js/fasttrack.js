var FASTTRACK = {
    init: function() {
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
    rollDie: function(dieCount) {
        var die = Math.floor(Math.random() * 6) + 1;
        return die * dieCount;
    },
    movePlayer: function(dieCount) {
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
    updatePosition: function(dice) {
        var player = APP.players[APP.currentPlayerArrPos()];
		
		//-- for testing	
		//if (player.position + dice <= 24) {
       //     player.position += dice;
       // } else {
           //player.position = 23;
       // }
		
		
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
            text: "<div id='doodad-text'><div><span>Roll one die.</span><br><span>If it's 1-3, you're covered.</span><br><span>If it's 4-6, you're not- Pay all of your cash.</span>"
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
            possibleReturn: "$500,000",
            costText: "$25,000",
			cashFlow: 0,
            roi: 500000,
            cost: 25000
        },
        square24: {

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
			cashFlow: 0,
            roi: 500000,
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
    printSquares: function() {
        document.getElementById("cell201").innerHTML =
            "<div class ='cellx2'><div id='tokenSection2-1'></div>" +
            "<span class='fast-track-space-title' style='font-size: 7pt;'>HEALTHCARE</span><br><div class='fast-track-cell-info' id='ft-doodad1'> " +
            FASTTRACK.square.doodad1.text +
            "</div>";
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
		
		//subtract cost from cash
		player.cash -= asset.cost;
		//update income
		player.cashFlowDay += asset.cashFlow;
		//give unique id to asset
		asset.id = APP.finance.newId();
		//add asset to player assets
		player.fastTrackAssets.push(asset);
			
		if (currentSquare == "square17") {
			//roll for outcome
			var dieNum = this.rollDie(1);
			
			
			$("#ft-end-turn-btn").show();
			
			$("#ft-opp-buy-btn").hide();
			$("#ft-pass-btn").hide();
			
			if (dieNum == 6) {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>Deal Successful!</p>");
				//increase player cash flow
				asset.cashFlow = 75000;
				player.cashFlowDay += asset.cashFlow;
			} else {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>Deal Unsuccessful</p>");
				//do not increase player cash flow
				asset.cashFlow = 0;
			}	
			
		    APP.finance.statement();
		} else if (currentSquare == "square23"){
			//roll for outcome
			var dieNum = this.rollDie(1);
			
			$("#ft-end-turn-btn").show();
			
			$("#ft-opp-buy-btn").hide();
			$("#ft-pass-btn").hide();
			
			if (dieNum == 6) {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>Stock purchase was a huge success! Purchase yielded $250,000</p>");
				//add cash to player savings
				player.cash += asset.roi;
			} else {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>Stock purchase yielded $0</p>");
			}
			
			APP.finance.statement();
		} else if (currentSquare == "square33"){
			//roll for outcome
			var dieNum = this.rollDie(1);
			
			$("#ft-end-turn-btn").show();
			
			$("#ft-opp-buy-btn").hide();
			$("#ft-pass-btn").hide();
			
			if (dieNum ==  5 || dieNum == 6) {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>IPO was a huge success! Investment yielded $500,000</p>");
				//add cash to player savings
				player.cash += asset.roi;
			} else {
				$("#ft-opp-prompt").show();
				$("#ft-opp-prompt").html("<p>You rolled a " + dieNum + ".</p><p>IPO floped due to high costs and debt. Investment yielded $0</p>");
			}
			
			APP.finance.statement();
		} else {
			APP.finance.statement();
			this.finishTurn();
		}
    },
    doodad: function(boardPosition) {
        var player = APP.players[APP.currentPlayerArrPos()];
        var roll = APP.rollDie(1);
		var doodadText = document.getElementById("ft-doodad-text");
		var doodadNode = document.getElementById("doodad-node");

        switch (boardPosition) {
            case 1:
                var newRoll = APP.rollDie(1);
				
				// Roll for outcome
                if (newRoll >= 4) {
					doodadNode.innerHTML = "You rolled a " + newRoll + ". You spend all of your cash for the expenses.";
									
					player.cash = 0;
                } else {
					doodadNode.innerHTML = "You rolled a " + newRoll + ". You're covered.";
                }

                $("#ft-doodad-text2").hide();
				$("#ft-doodad-roll-btn").hide();
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
                var assets = player.fastTrackAssets.sort(function(a, b){
					return a.cashFlow - b.cashFlow;
				});
				// find lowest asset 
				var lowestAssetId = assets[0].id;

                console.log("sorted array: ", assets);

                $("#ft-doodad-text2").hide();
                $("#lowestAsset").text(assets[0].title);
				
				console.log("before: ", player.fastTrackAssets);
				
				player.totalIncome -= assets[0].cashFlow;
                delete player.fastTrackAssets.id;
				
				console.log("after: ", player.fastTrackAssets);
                break;
            case 34:
                var lowest = player.fastTrackAssets[0].cashFlow;

                player.fastTrackAssets.forEach(function(current) {
                    if (current.cashFlow < lowest) {
                        lowest = current;
                    }
                });

                console.log(lowest);
				
				var assets = player.fastTrackAssets.sort(function(a, b){
					return a.cashFlow - b.cashFlow;
				});
				// find lowest asset 
				var lowestAssetId = assets[0].id;
				
				lowest= lowestAsse
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
		
		APP.finance.statement();
    },
    dream: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
		var dreamCost = Math.floor(Math.random() * 125000) + 50000;
		var node = document.createElement("div"); 
		var textNode = document.createElement("h2");
				
		this.dreamCost = dreamCost;
		
		node.setAttribute("id", "dream-roll-text");		
		textNode.setAttribute("id", "dream-header-node-text");
		
		document.getElementById("ft-card-text").appendChild(node);

		document.getElementById("dream-roll-text").innerHTML = "Your dream will cost $" + APP.display.numWithCommas(dreamCost);
		
		if (player.cash < dreamCost) {
			$("#ft-end-turn-btn").show();
			$("#ft-dream-roll-btn").hide();
			$("#ft-pass-btn").hide();
			
			node.appendChild(textNode);
			document.getElementById("dream-header-node-text").innerText = "Insufficient funds";	
		} else {
			$("#ft-dream-roll-btn").show();
			$("#ft-pass-btn").show();
		}
	},
	dreamRoll: function(){
		var roll = APP.rollDie(1);
		var player = APP.players[APP.currentPlayerArrPos()];
		
		document.getElementById("dream-roll-text").innerHTML = "Congratulations!";
		
		$("#ft-deal-cost-table").hide();
		$("#ft-pass-btn").hide();
		$("#ft-dream-roll-btn").hide();
		
		player.cash -= this.dreamCost;
		 			
		if (roll % 2 == 0) {
			$("#ft-opp-title").text("Dream Successful");
			
			$(".card-title").css("color", "#43A047");

			$("#ft-win-continue-btn").show();
			
			var rollTextNode = document.createElement("div"); 
			var textNode = document.createTextNode("You rolled a " + roll + ".");    
			
			rollTextNode.setAttribute("id", "dream-roll-text");				
			rollTextNode.appendChild(textNode);                          
			
			document.getElementById("ft-card-text").appendChild(rollTextNode);
		} else {
			$("#ft-opp-title").text("Dream Unsuccessful");
			
			$(".card-title").css("color", "#212121");
			
			$("#ft-end-turn-btn").show();
			
			/*	
			//card 
				//show instructions 
				//show roll btn , message saying 'no going back if if successful'
				//show chance for success
			
			//after roll
				//show success or failure
					//success - win game
					//failure - get random event with outcome
				
			*/

			var scenarioText;
			var outcomeText;
			
			function outcomeScenario(occupation, dream){
				var playerInfo = [occupation];
				var lifeVars = function(
					occupation,
					children, 
					assets
				) {
					this.children = children;
					this.assets = assets;
					this.occupation = occupation;
				}
				
				//check if player has children and add to array
				if (player.children > 0) {
					playerInfo.push(true);
				} else { 
					playerInfo.push(false);
				}
				
				//check if player has assets
				if (player.fastTrackAssets.length > 0) {
					playerInfo.push(true);
				} else { 
					playerInfo.push(false);
				}
				
				var playerStatus = new lifeVars(playerInfo);
				
				var scenarioObj = FASTTRACK.dreamScenarios;
				
				//functions for outcome event; 
					//types of outcome events;
						//universal 
						//family 
						//occupation
					
				function universalEvent(){
					// Get the size of scenario object
					Object.size = function(obj) {
						var size = 0, key;
						
						for (key in obj) {
							if (obj.hasOwnProperty(key)) size++;
							console.log(size);
						}
						
						return size;
					};
					
					// get random event scenario from obj
					var eventsLength = Object.size(scenarioObj.universal);
					var selectedEvent = 'event' + String(Math.floor(Math.random() * eventsLength) + 1);

					// check type of scenario
					if (scenarioObj.universal[selectedEvent].type == 'income'){
						var income = Math.floor(Math.random() * 500000);
						
						outcomeText = " You receive $" + APP.display.numWithCommas(income) + " from the deal";
						
						player.cash += income;
					}
					
					if (scenarioObj.universal[selectedEvent].type == 'expense'){
						var expense = Math.floor(Math.random() * 500000);
						
						outcomeText = " You pay $" + APP.display.numWithCommas(expense) + " to cover the venture and losses.";
						
						if (player.cash <= expense){
							player.cash = 0;
						} else {
							player.cash -= expense;
						}
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'nothing'){
						outcomeText = "Conditions were unfavorable for the plan you had. Good luck next time.";
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'asset gain'){
						outcomeText = "Receive a business";
						
						//get random asset
						var assetsLength = Object.size(scenarioObj.assets);
						var selectedAsset = 'asset' + String(Math.floor(Math.random() * assetsLength) + 1);
						//add to player.fastTrackAssets
						player.fastTrackAssets.push(scenarioObj.assets[selectedAsset]);
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'asset loss'){
						outcomeText = "Lose one business. After covering sunk costs with the cash from the deal, you come out even.";
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'asset loss, nothing'){
						outcomeText = "After covering sunk costs with the cash from the deal, you come out even.";
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'roll'){
						outcomeText = "You get one more attempt.";
						$("#ft-dream-roll-btn").show();
						
					}
					
					if (scenarioObj.universal[selectedEvent].type ==  'charity'){
						outcomeText = "You receive three charity rolls.";
						player.charityTurns += 3;
					}
					// Other outcomes 
						// lose next turn outcome - lose next turn(s)
						
						// insurance - insured for next doodad
					
					
					//print heading and save scenario text 
					document.getElementById("ft-card-text").innerHTML = "You rolled a " + roll + "." + "<h2>" + scenarioObj.universal[selectedEvent].name + "</h2>";
					
					scenarioText = scenarioObj.universal[selectedEvent].text;
				}
				
				function occupationEvent(){
					var occupationEventObj = scenarioObj.occupation;
					
					switch (occupation) {
						case "Airline Pilot":
						case "Business Manager":
						case "Doctor (MD)":
						case "Engineer":
						case "Janitor":
						case "Lawyer": 
						case "Mechanic":
						case "Nurse":
						case "Police Officer":
						case "Secretary":
						case "Teacher (K-12)":
						case "Truck Driver":
						case "CEO":
							break;
					}	
				}
				
				function familyEvent(){
					var familyEventObj = scenarioObj.family;
				}
				
				//determine type of event and run associated function
				if (playerStatus.family == true){
					//make scenarios available
				}
				
				if (playerStatus.assets == true){
					//make scenarios available
				}
				
				universalEvent();
				
				return scenarioText;
					
			}
			
			//create nodes for dream outcome
			var rollTextNode = document.createElement("p"); 
			var dreamTextNode = document.createElement("p");
			var breakNode = document.createElement("br");
			
			//set ids for nodes
			rollTextNode.setAttribute("id", "dream-roll-text");
			dreamTextNode.setAttribute("id", "dream-outcome-text");
			
			//create and add text nodes
			var eventNode = document.createTextNode(outcomeScenario(player.jobTitle[0], APP.players[APP.currentPlayerArrPos()].dream)); 
			var outcomeNode = document.createTextNode(outcomeText);
			
			dreamTextNode.appendChild(eventNode);   
			dreamTextNode.appendChild(breakNode); 
			dreamTextNode.appendChild(outcomeNode);   	
						
			//add nodes to page			
			document.getElementById("ft-card-text").appendChild(rollTextNode);
			document.getElementById("ft-card-text").appendChild(dreamTextNode);
			
			APP.finance.statement();
		}
    },
    dreamScenarios: {
		universal: {
			event1: {
				type: "income",
				name: "Another Success ",
				text: "You pass on your dream opportunity to land a huge real estate deal. Your friends and family throw a big celebration! "
			},
			event2: {
				type: "asset loss, nothing",
				name: "Sold Restaurant",
				text: "Popular but struggling restaurant finds new opportunities and ownership with successful chef."
			},
			event3: {
				type: "asset loss",
				name: "Company Merger",
				text: "Software company you owned innovated popular webservice and tech conglomerate offered a price you couldn't refuse."
			},
			event4: {
				type: "asset gain",
				name: "Company Merger",
				text: "One of your companys acquires promising startup."
			},
			event5: {
				type: "expense",
				name: "Mission Failed",
				text: "You retreat to your office to make new plans, vowing to try again someday."
			},
			event6: {
				type: "income",
				name: "Business Sold",
				text: "You sold a company to finance the venture and free up time."
			},
			event7: {
				type: "nothing",
				name: "Back to drawing Board",
				text: "Your efforts have led you right back to where you began."
			},
			event8: {
				type: "roll",
				name: "One More Attempt",
				text: "You and your team's efforts have led you right to the brink of seeing your wildest passion come to fruition. You can barely sleep knowing you get one more try at your dream in the morning."
			},
			event9: {
				type: "charity",
				name: "Fundraiser",
				text: "Fundraising opportunity for coinsides whith dream, but you decide to wait another week."
			}
		},
		family: {
			event1:{
				type: "expense",
				name: "Daughter's Wedding",
				text: "A day to remember. You take time from your pursuits to see your daughter get married."
			}/*,
			event2: {
				type: "charity",
				name: "Honorary Award for Charity",
				text: "Opportunity to conduct research to combat a disease presented itself while you sought your dream. Your research and sponsorhip has led to a breakthrough that has already saved many lives.
				
				Research you sponsored to help combat a dangerous disease has led to a breakthrough and the majority of patients in the study have gone into remission."
			}*/
		},
		occupation: {
			event1:{
				type: "income",
				name: "",
				text: ""
			}
		},
		assets: {
			asset1: {
				title: "Food Truck",
				text: "+10,000/mo Cash Flow 80% Cash-on-Cash return",
				cashFlowText: "$10,000",
				costText: "$200,000",
				cashFlow: 10000,
				cost: 200000
			},
		asset2: {
				title: "Online Marketplace",
				text: "+5,000/mo Cash Flow 70% Cash-on-Cash return",
				cashFlowText: "$5,000",
				costText: "$100,000",
				cashFlow: 5000,
				cost: 80000
			},
			asset3: {
				title: "Clothing Store",
				text: "+9,000/mo Cash Flow 60% Cash-on-Cash return",
				cashFlowText: "$9,000",
				costText: "$270,000",
				cashFlow: 9000,
				cost: 270000
			},
			asset4: {
				title: "Video Game",
				text: "+3,000/mo Cash Flow 40% Cash-on-Cash return",
				cashFlowText: "$3,000",
				costText: "$80,000",
				cashFlow: 3000,
				cost: 80000
			},
			asset5: {
				title: "Coffee Shop",
				text: "+5,000/mo Cash Flow 50% Cash-on-Cash return",
				cashFlowText: "$5,000",
				costText: "$120,000",
				cashFlow: 5000,
				cost: 120000
			}
			
		}
	},
	roll: function() {
        var playerObj = APP.players[APP.currentPlayerArrPos()];
        var currentPosition = playerObj.position;
        var currentSquare = "square" + String(currentPosition);
        var asset = this.square[currentSquare];
        var dieNum = this.rollDie();

        console.log("rolling..." + currentPosition);

        switch (currentPosition) {
            case 23:
                break;
            case 33:
                break;
        };
    },
    remainder: function() {
        var player = APP.players[APP.currentPlayerArrPos()];
        var square = "square" + String(player.position);

        return Math.round(this.square[square].cost - player.cash);
    },
    finishTurn: function() {
        var player = APP.players[APP.currentPlayerArrPos()];

        APP.display.clearCards();
        APP.display.clearBtns();
		
        // check for winning payday
        if (player.cashFlowDay >= player.winPay) {
            this.winGame();
        } else {
            $("#ft-finish-turn-card").show();
            $("#ft-end-turn-btn").show();
        }

        if (player.position == 2) {
            $("#ft-finish-alert").show();
        } else if (player.position !== (1 || 7 || 10 || 14 || 18 || 21 || 27 || 30 || 34 || 38)) {
            $("#ft-finish-alert").show();
        }

        //remove card highlight
        $("#turn-info").css("box-shadow", "0 0 2px #212121");
        $(".card-title").css("text-shadow", ".2px .2px .2px #7DCEA0");
        $(".card-title").css("color", "#4E342E");

        APP.finance.statement();
    },
	winGame: function() {
		var player = APP.players[APP.currentPlayerArrPos()];
		
		APP.display.clearCards();
		APP.display.clearBtns();

		$("#win-game-card").show();

		if (APP.remainingPlayers == APP.pCount) {
			$("#win-scenario").text(APP.name(APP.currentPlayer) + " wins the game by adding over $50,000 to their Cash Flow Day!");
		} else {
			$("#win-scenario").text(APP.name(APP.currentPlayer) + " wins the game by adding over $50,000 to their Cash Flow Day!");
		}

		APP.remainingPlayers -= 1;
		player.finished = true;
					
			//remove player
			//skip player if they finished game
			//add player to finished players array

		document.getElementById("win-cash-amount").innerHTML = APP.display.numWithCommas(player.cash);
		document.getElementById("win-income-amount").innerHTML = APP.display.numWithCommas(player.cashFlowDay + Math.round(APP.finance.getIncome(APP.currentPlayerArrPos())));
		if (player.realEstateAssets.length > 0) {
			document.getElementById("win-asset-amount").innerHTML = APP.display.numWithCommas(player.realEstateAssets.length);

		}
		
		if (APP.remainingPlayers > 0) {
			$("#ft-end-turn-btn").show();
		} else {
			$("#win-card-new-game-btn").click(function() {
				window.location.reload(false);
			});
		}
	}
};