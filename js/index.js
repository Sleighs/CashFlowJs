// Game Phases
//   Phase 1 - select dream
//   Phase 2 - race
//     starting out - 0 assets, pay off liabilities, buy low sell high
//     middle/the race - 1st big acquisition
//     end game - paid off liabilities and looking for a big deal
//   Phase 3 - dream

var APP = APP || {
  players: [],
  pCount: 1,
  turnCount: 1,
  currentPlayer: 1,
  currentPlayerArrPos: function() {
    return APP.currentPlayer - 1;
  },
  previousPlayer: function() {
    var prevPlayer;

    if (this.currentPlayer === 1) {
      prevPlayer = this.pCount;
    } else {
      prevPlayer = APP.currentPlayerArrPos();
    }

    return prevPlayer;
  },
  name: function(playerNumber) {
    var player = "player" + parseInt(playerNumber, 10) + "name";
    var name = document.getElementById(player).value;
    return name;
  },
  initGame: function() {
    $("#home-play-button").click(function() {
      APP.display.hideHomeScreen();
      APP.display.showGameSelectionScreen();
    });
    $("#new-room-button").click(function() {
      APP.display.hideGameSelectionScreen();
      APP.display.showGameSetupScreen();
    });
    $("#start-game").click(function() {
      APP.display.hideSetup();
      APP.display.renderBoard();
    });
  },
  setup: function() {
    var pn = document.getElementById("player-number");
    APP.pCount = pn.options[pn.selectedIndex].value;

    //Create players
    for (var i = 1; i <= APP.pCount; i++) {
      var randomScenario = Math.floor(
        Math.random() * APP.scenarioChoices.length
      );
      //add each player and job to the players array
      var playerObj = new APP.scenario(APP.scenarioChoices[randomScenario]);

      playerObj.name = APP.name(i);
      APP.players.push(playerObj);

      //send list of players to board
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
    //highlight first player
    var curPlayerRowId = document.getElementById(
      "table-row-player" + parseInt(APP.currentPlayer, 10)
    );
    curPlayerRowId.style.border = "3pt groove #FDD835";

    //start dream phase (phase 1)
    APP.dreamPhase.openDreamPhase();
    APP.dreamPhase.dreamPhaseOn = true;

    //starting cash
    if (APP.turnCount <= 1) {
      for (var i = 0; i < APP.players.length; i++) {
        APP.players[i].cash += APP.players[i].jobTitle[2];
      }
    }

    APP.display.clearBtns();
    APP.display.clearCards();

    $("#end-turn-btn").hide();

    $("#opp-card-btns").hide();
    $("#buy-opp-button").hide();
    $("#doodad-pay-button").hide();
    $("#ds-pay-button").hide();
    $("#charity-donate-btn").hide();
    $("#done-btn").hide();
    $("#pass-button").hide();
    $("#roll2-btn").hide();
    $("#confirm-pay-btn").hide();
    $("#exp-child-row").hide();

    $("#finish-instructions").hide();
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
    //if charity is selected roll twice

    var token = APP.display.tokens[player];

    //remove old piece
    var oldTokenElement = document.getElementById(
      "tokenSection" + parseInt(pObj.position, 10)
    );
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

    //when player lands on square load card
    APP.loadCard(currentPosition);

    //if pass paycheck get payday - currently set to salary
    if (previousPosition < 5 && currentPosition >= 5) {
      pObj.cash += pObj.payday;
    } else if (previousPosition < 13 && currentPosition >= 13) {
      pObj.cash += pObj.payday;
    } else if (previousPosition < 21 && currentPosition + dice >= 21) {
      pObj.cash += pObj.payday;
    }

    APP.finance.statement(APP.currentPlayerArrPos());
  },
  updatePosition: function(dice) {
    var p = APP.players[APP.currentPlayerArrPos()];

    if (p.position + dice <= 23) {
      p.position += dice;
    } else {
      var x = p.position + dice;
      x -= 23;
      p.position = x;
    }
  },
  nextTurn: function() {
    var player = APP.players[this.currentPlayerArrPos()];
    $("#finish-instructions").hide();
    $("#finish-turn-container").hide();

    APP.display.clearBtns();
    APP.display.clearCards();
    APP.clearAmounts();
    //hide prev assets and show current assets
    if (player.stockAssets.length >= 0) {
      var stockRowId =
        ".stock-shares" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
      $(stockRowId).hide();
    }
    if (player.realEstateAssets.length >= 0) {
      var rowClass =
        ".real-estate-asset" + parseInt(APP.currentPlayerArrPos(), 10) + "-row";
      $(rowClass).hide();
    }

    $("#turn-instructions").show();
    $("#card-btns").show();
    $("#roll-btn").show();
    $("#roll2-btn").hide();

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

    var playerNameId = document.getElementById("player-name");
    playerNameId.innerHTML = APP.name(APP.currentPlayer);

    APP.turnCount++;

    APP.finance.statement(APP.currentPlayerArrPos());

    if (player.charityTurns === 0) {
      $("#roll2-btn").hide();
    } else {
      $("#roll2-btn").show();
      player.charityTurns--;
      //--
      APP.finance.statement(APP.currentPlayerArrPos());
    }

    if (player.downsizedTurns != 0) {
      player.downsizedTurns--;
      //--
      APP.finance.statement(APP.currentPlayerArrPos());
      if (APP.pCount != 1) {
        this.nextTurn();
      }
    }

    //if player cannot afford his bills even after selling assets, player loses
    //load bankruptcy card if player has assets to sell
    //allow player to sell assets if they have any
    //else load you lose card if cash flow is negative and there are no assets to sell
  },
  finishTurn: function() {
    //hide opportunity card
    $("#card-btns").hide();
    $("#turn-instructions").hide();
    $("#cancel-btn").hide();
    $("#done-repay-btn").hide();
    $("#done-btn").hide();
    APP.display.clearCards();

    $("#finish-turn-container").show();
    $("#finish-instructions").show();
    $("#end-turn-btn").show();
    $("#repay-borrow-btns").show();

    APP.finance.statement(APP.currentPlayerArrPos());
    this.clearAmounts();
  },
  currentDoodad: "",
  doodadCost: 0,
  getDoodad: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    //random doodad
    var obj = APP.cards.doodad;
    var keys = Object.keys(obj);
    var randDoodad = function(object) {
      return object[keys[Math.floor(keys.length * Math.random())]];
    };
    var currentDoodad = randDoodad(obj);

    //set doodad
    this.currentDoodad = currentDoodad.name;
    this.doodadCost = currentDoodad.cost;
    var text = currentDoodad.text;

    //if boat
    if (this.currentDoodad == "New Boat" && player.boatLoan == 0) {
      //--fix
      player.boatLoan = 17000;
      player.boatPayment = 340;
    } else if (this.currentDoodad == "New Boat") {
      text = "You already own one.";
    }
    //if credit card
    if (this.currentDoodad == "Buy Big Screen TV") {
      //--test
      player.creditDebt = 4000;
      player.tvPayment = 120;
    }
    //display doodad
    document.getElementById("doodad-title").innerHTML = this.currentDoodad;
    document.getElementById("doodad-text").innerHTML = text;
  },
  smallDeal: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    //get random deal
    var obj = APP.cards.smallDeal;
    var keys = Object.keys(obj);
    var randDeal = function(object) {
      return object[keys[Math.floor(keys.length * Math.random())]];
    };
    var currentDeal = randDeal(obj);
    var dealType = currentDeal.type;

    this.currentDeal = currentDeal;

    $("#opp-card").hide();
    $("#small-deal-btn").hide();
    $("#big-deal-btn").hide();

    //show deal card
    switch (dealType) {
      case "Stock":
        $("#deal-card-stock").show();
        $("#show-stock-form-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-text").innerHTML =
          currentDeal.description;
       // document.getElementById("deal-stock-rule").innerHTML =
         // currentDeal.rule;
        document.getElementById("deal-stock-cost").innerHTML =
          currentDeal.price;
        document.getElementById("deal-stock-cash-flow").innerHTML = "0";
        document.getElementById("deal-stock-trading-range").innerHTML =
          currentDeal.range;
        //shares owned
        document.getElementById("share-cost").innerHTML = currentDeal.price;
        break;
      case "Mutual Fund":
        $("#deal-card-stock").show();
        $("#show-stock-form-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-text").innerHTML =
          currentDeal.description;
       // document.getElementById("deal-stock-rule").innerHTML =
         // currentDeal.rule;
        document.getElementById("deal-stock-cost").innerHTML =
          currentDeal.price;
        document.getElementById("deal-stock-cash-flow").innerHTML = "0";
        document.getElementById("deal-stock-trading-range").innerHTML =
          currentDeal.range;
        //shares owned
        document.getElementById("share-cost").innerHTML = currentDeal.price;
        break;
      case "Real Estate":
        $("#deal-card-real-estate").show();
        $("#buy-real-estate-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML =
          currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        document.getElementById("deal-re-cost").innerHTML = currentDeal.cost;
        document.getElementById("deal-re-cash-flow").innerHTML =
          currentDeal.cashFlow;
        document.getElementById("deal-re-down-payment").innerHTML =
          currentDeal.downPayment;
        break;
      case "Property Damage":
        $("#deal-card-real-estate").show();
        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML =
          currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        
        //--Need to make pay for damages button
        $("#buy-real-estate-btn").show(); 
        $("#pass-btn").show();
        break;
      case "Stock Split":
        $("#deal-card-stock").show();
        
        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-text").innerHTML =
          currentDeal.description;
       // document.getElementById("deal-stock-rule").innerHTML =
         // currentDeal.rule;
        
        $("#done-btn").show();
        break;
      case "Reverse Split":
        $("#deal-card-stock").show();
        
        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-text").innerHTML =
          currentDeal.description;
        document.getElementById("deal-stock-rule").innerHTML =
          currentDeal.rule;
        
        $("#done-btn").show();
        break;
    }
  },
  bigDeal: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var obj = APP.cards.bigDeal;
    var keys = Object.keys(obj);
    var randDeal = function(object) {
      return object[keys[Math.floor(keys.length * Math.random())]];
    };
    var currentDeal = randDeal(obj);
    var dealType = currentDeal.type;

    this.currentDeal = currentDeal;

    $("#opp-card").hide();
    $("#small-deal-btn").hide();
    $("#big-deal-btn").hide();

    //show deal card
    switch (dealType) {
      case "Real Estate":
        $("#deal-card-real-estate").show();
        $("#buy-real-estate-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML =
          currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        document.getElementById("deal-re-cost").innerHTML = currentDeal.cost;
        document.getElementById("deal-re-cash-flow").innerHTML =
          currentDeal.cashFlow;
        document.getElementById("deal-re-down-payment").innerHTML =
          currentDeal.downPayment;
        break;
      case "Property Damage":
        $("#pass-btn").show();

        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML =
          currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        break;
      case "Business Investment":
        $("#pass-btn").show();

        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML =
          currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        break;
      default:
        break;
    }
  },
  clearAmounts: function() {
    APP.finance.loanAmount = 1000;
    APP.finance.shareAmount = 1;
    document.getElementById("loan-amt-input").value = 1000;
    document.getElementById("loan-amt-input2").value = 1000;
    document.getElementById("share-amt-input").value = 1;
  }
};

APP.loadCard = function(boardPosition) {
  var playerObj = APP.players[APP.currentPlayerArrPos()];

  //hide turn instructions
  $("#turn-instructions").hide();
  $("#repay-borrow-btns").hide();
  $("#roll-btn").hide();
  $("#roll2-btn").hide();
  $("#end-turn-btn").hide();
  $("#confirm-pay-btn").hide();

  //opportunity
  if (boardPosition % 2 === 0 || boardPosition === 0) {
    $("#opp-card").show();

    $("#card-btns").show();
    $("#small-deal-btn").show();
    $("#big-deal-btn").show();

    //--
    $("#finish-turn-container").show();
  }

  //doodad aka expense
  if (boardPosition === 1 || boardPosition === 9 || boardPosition === 17) {
    $("#doodad-card").show();
    $("#doodad-pay-button").show();
    APP.getDoodad();
  }

  //offer
  if (boardPosition === 7 || boardPosition === 15 || boardPosition === 23) {
    $("#offer-card").show();
    $("#done-btn").show();
  }

  //paycheck
  if (boardPosition === 5 || boardPosition === 13 || boardPosition === 21) {
    this.finishTurn();
  }

  //charity
  if (boardPosition === 3) {
    $("#charity-card").show();
    $("#charity-donate-btn").show();
    $("#pass-btn").show();
  }

  //kid
  if (boardPosition === 11) {
    $("#kid-card").show();
    $("#done-btn").show();
    var expense = Math.round(parseInt(playerObj.totalIncome) * 0.056);
    var eTable = document.getElementById("expense-table");

    if (playerObj.children == 0) {
      //add row to expenses table
      $("#exp-child-row").show();
      /*var expenseTableRow =
        "<tr class='expenses-row'><td>Child</td><td>$<span id='expenses-child'></span></td></tr>";
        eTable.insertAdjacentHTML("beforeend", expenseTableRow);*/
      document.getElementById("child-cost").innerHTML = expense;

      //children count ++
      playerObj.children += 1;
    } else if (playerObj.children == 4) {
      //
    } else {
      playerObj.children += 1;
    }
    var children = playerObj.children;
    var childCost = children * expense;
    playerObj.childExpense = childCost;
    document.getElementById("expenses-child").innerHTML = parseInt(
      playerObj.childExpense,
      10
    );

    APP.finance.statement(APP.currentPlayerArrPos());
  }

  //downsize
  if (boardPosition === 19) {
    var downsizedAmount = playerObj.totalExpenses;
    //show pay button
    $("#ds-pay-button").show();
    //show downsize card
    $("#downsize-card").show();

    document.getElementById("downsized-amt").innerHTML = downsizedAmount;
  }
};

APP.finance = {
  loanAmount: 1000,
  shareAmount: 1,
  statement: function(currentPlayer) {
    var player = APP.players[currentPlayer];
    //income
    document.getElementById("player-job-income").innerHTML = player.jobTitle[0];
    document.getElementById("player-salary-income").innerHTML =
      player.jobTitle[1];
    //expenses
    document.getElementById("expenses-taxes").innerHTML = player.jobTitle[3];
    document.getElementById("expenses-mortgage").innerHTML = player.jobTitle[4];
    document.getElementById("expenses-car").innerHTML = player.jobTitle[5];
    document.getElementById("expenses-credit").innerHTML = player.jobTitle[6];
    document.getElementById("expenses-retail").innerHTML = player.jobTitle[7];
    document.getElementById("expenses-other").innerHTML = player.jobTitle[8];
    this.loanPayment(APP.currentPlayerArrPos());
    document.getElementById("expenses-loans").innerHTML = player.loanPayment;
    document.getElementById("expenses-boatloan").innerHTML = player.boatLoan;
    //Summary
    this.getExpenses(APP.currentPlayerArrPos());
    this.getIncome(APP.currentPlayerArrPos());
    this.getPayday(APP.currentPlayerArrPos());
    document.getElementById("bar-passive-income").innerHTML =
      player.assetIncome;
    document.getElementById("summary-cash").innerHTML = player.cash;
    document.getElementById("summary-total-income").innerHTML =
      player.totalIncome;
    document.getElementById("summary-total-expenses").innerHTML =
      player.totalExpenses;
    document.getElementById("summary-total-expenses-bar").innerHTML =
      player.totalExpenses;
    document.getElementById("summary-payday").innerHTML = player.payday;    
    //assets
    var aTable = document.getElementById("assets-table");
    for (var i = 0; i < player.stockAssets.length; i++) {
      var sharesId = "stock-shares";
      var nameId = "stock-name";
      var priceId = "stock-cost";

      var name = player.stockAssets[i]["name"].substr(0, 6);
      document.getElementById(sharesId).innerHTML =
        player.stockAssets[i]["shares"];
      document.getElementById(nameId).innerHTML = name;
      document.getElementById(priceId).innerHTML =
        player.stockAssets[i]["price"];
    }
    for (var j = 0; j < player.realEstateAssets.length; j++) {
      var nameId = "real-estate-name";
      var costId = "real-estate-cost";

      var name = player.realEstateAssets[j]["tag"].substr(0, 6);
      document.getElementById(nameId).innerHTML = name;
      document.getElementById(costId).innerHTML = 
        player.realEstateAssets[j]["cost"];
    }
    
    //liabilities
    var lTable = document.getElementById("liability-table");

    var mortgage = player.jobTitle[9];
    var carLoan = player.jobTitle[10];
    var creditCard = player.jobTitle[11];
    var retail = player.jobTitle[12];
    var loans = player.loans;
    var boatLoan = player.boatLoan;
    //if paid off remove rows, if no loans hide row
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
      $("#exp-boatloan-row").hide();
    } else {
      $("#lia-boatloan-row").show();
      $("#exp-boatloan-row").show();
    }

    document.getElementById("liability-mortgage").innerHTML = mortgage;
    document.getElementById("liability-car").innerHTML = carLoan;
    document.getElementById("liability-credit").innerHTML = creditCard;
    document.getElementById("liability-retail").innerHTML = retail;
    document.getElementById("liability-loans").innerHTML = loans;
    document.getElementById("liability-boatloan").innerHTML = boatLoan;

    this.progressBar();

    APP.test();
  },
  progressBar: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var expenseBarEle = document.getElementById("income-expense-bar");
    var expenses = this.getExpenses();
    var width = 100 * (player.assetIncome / expenses);

    expenseBarEle.style.width = Math.round(width) + "%";
  },
  getIncome: function(currentPlayer) {
    //total income = salary + assets
    var player = APP.players[currentPlayer];
    var salary = player.jobTitle[1];
    var assetIncome = player.assetIncome;

    player.totalIncome = salary + assetIncome;

    //include assets
    return player.totalIncome;
  },
  getExpenses: function(currentPlayer) {
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

    player.totalExpenses =
      taxes +
      mortgage +
      car +
      credit +
      retail +
      other +
      children +
      loanPayment +
      boatPayment;

    //include assets

    return player.totalExpenses;
  },
  getPayday: function(currentPlayer) {
    var player = APP.players[currentPlayer];
    var income = this.getIncome(currentPlayer);
    var expenses = this.getExpenses(currentPlayer);
    var pay = income - expenses;
    player.payday = pay;
  },
  payDoodad: function() {
    var player = APP.players[APP.currentPlayerArrPos()];

    if (APP.currentDoodad == "New Boat") {
      player.boatLoan = 17000;
      player.boatPayment = 340;
      APP.finishTurn();
      APP.doodadCost = 0;
    } else if (APP.doodadCost <= player.cash) {
      player.cash -= APP.doodadCost;
      APP.finishTurn();
      APP.doodadCost = 0;
    } else {
      this.loanOffer(APP.doodadCost);
    }
    APP.currentDoodad = "";
  },
  payDownsize: function() {
    //show liability card
    var player = APP.players[APP.currentPlayerArrPos()];
    var boardPosition = player.position;
    var downsizedAmount = player.totalExpenses;
    var payment;

    if (boardPosition === 19) {
      if (player.cash < downsizedAmount) {
        this.loanOffer(downsizedAmount);
       
      } else {
        player.cash -= downsizedAmount;
        player.downsizedTurns += 3;
      }
    }

    APP.finishTurn();
  },
  donate: function() {
    var dPlayer = APP.players[APP.currentPlayerArrPos()];
    var donation = dPlayer.totalIncome * 0.1;

    if (dPlayer.cash >= donation) {
      dPlayer.cash = dPlayer.cash - donation;
      dPlayer.charityTurns += 3;
      APP.finishTurn();
    } else {
      $("#charity-donate-btn").hide();
      $("#charity-card").hide();
      $("#pass-btn").hide();
      $("#cannot-afford-card").show();
      $("#done-repay-btn").show();
    }
  },
  increaseLoan: function() {
    var value = parseInt(document.getElementById("loan-amt-input").value, 10);
    var value = parseInt(document.getElementById("loan-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value += 1000;
    document.getElementById("loan-amt-input").value = value;
    document.getElementById("loan-amt-input2").value = value;
  },
  decreaseLoan: function() {
    var value = parseInt(document.getElementById("loan-amt-input").value, 10);
    var value = parseInt(document.getElementById("loan-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    if (value > 1000) {
      value -= 1000;
    } else {
      value = 1000;
    }
    document.getElementById("loan-amt-input").value = value;
    document.getElementById("loan-amt-input2").value = value;
  },
  takeOutLoan: function() {
    var loan = parseInt(document.getElementById("loan-amt-input").value, 10);
    var player = APP.players[APP.currentPlayerArrPos()];
    loan = isNaN(loan) ? 0 : loan;
    player.loans += loan;
    player.cash += loan;

    APP.finishTurn();
  },
  repayLoan: function() {
    var loan = parseInt(document.getElementById("loan-amt-input2").value, 10);
    var player = APP.players[APP.currentPlayerArrPos()];
    loan = isNaN(loan) ? 0 : loan;
    player.loans -= loan;
    player.cash -= loan;

    //APP.finishTurn();
    $("#confirm-pay-btn").hide();
  },
  loanPayment: function(currentPlayer) {
    var player = APP.players[currentPlayer];
    var loanPayment = player.loans * 0.1;
    player.loanPayment = loanPayment;
    return loanPayment;
  },
  pay: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var loanId = player.loanId;

    switch (loanId) {
      case "liability-mortgage":
        if (player.cash < player.jobTitle[9]) {
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
      case "liability-boatloan":
        if (player.cash < 17000) {
          $("#repay-card").hide();
          $("#pay-confirm-card").hide();
          $("#confirm-pay-btn").hide();

          $("#cannot-afford-loan-card").show();
        } else {
          player.cash -= 17000;
          player.boatLoan = 0;
          player.boatPayment = 0;

          $("#pay-confirm-card").hide();
          $("#confirm-pay-btn").hide();
          $("#cancel-btn").hide();

          $("#done-repay-btn").show();
          $("#repay-card").show();
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
      default:
        APP.finishTurn();
        break;
    }
    APP.finance.statement(APP.currentPlayerArrPos());
  },
  buyStock: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    this.shareAmount = Number(document.getElementById("share-amt-input").value);
    var price = APP.currentDeal.price;
    var shares = this.shareAmount;
    var cost = price * shares;

    if (cost <= player.cash) {
      player.cash -= cost;
      APP.currentDeal.shares = this.shareAmount;
      var arr = player.stockAssets;

      //if deal is already in array update share amount
      if (arr.includes(APP.currentDeal)) {
        //get array location of the stock
        //var index = player.stockAssets.indexOf(APP.currentDeal);
        //player.stockAssets[index]['shares'] += this.shareAmount;
      } else {
        player.stockAssets.push(APP.currentDeal);
      }

      function newStockRow() {
        var stockAssetRow = [
          "<td><span id='stock-shares'></span> Share of <span id='stock-name'></span></td>",
          "<td><span id='stock-cost'></span></td>"
        ];
        var newRow =
          "<tr class='assets-row stock-shares" +
          parseInt(APP.currentPlayerArrPos(), 10) +
          "-row'>" +
          stockAssetRow.join("") +
          "</tr>";
        return newRow;
      }
      var row = newStockRow();
      /*
      //stock already exists add current share count to old share count
      let idCheck = arr.filter(function(value){        return value.id === APP.currentDeal.id;
      });
      
     if (!idCheck){  
        $("tr#asset-stock-title").after(row);
      }  else {
        //add new shares to old shares
      }*/

      $("tr#asset-stock-title").after(row);
      APP.finishTurn();
    } else {
      this.loanOffer(cost);
    }
  },
  buyRealEstate: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var downPayment = APP.currentDeal.downPayment;
    var arr = player.realEstateAssets;
    
    if (downPayment <= player.cash) {
      player.cash -= downPayment;
      player.assetIncome += APP.currentDeal.cashFlow;

      if (arr.includes(APP.currentDeal)) {
        //get array location of the stock
        //var index = player.stockAssets.indexOf(APP.currentDeal);
        //player.stockAssets[index]['shares'] += this.shareAmount;
      } else {
        arr.push(APP.currentDeal);
      }

      function newRealEstateRow() {
        var realEstateAssetRow = [
          "<td><span id='real-estate-name'></span></td>",
          "<td><span id='real-estate-cost'></span></td>"
        ];
        var newRow =
          "<tr class='assets-row real-estate-asset" +
          parseInt(APP.currentPlayerArrPos(), 10) +
          "-row'>" +
          realEstateAssetRow.join("") +
          "</tr>";
        return newRow;
      }
      
      if (APP.currentDeal.tag == false) {
        APP.finishTurn()
      } else { 
      var row = newRealEstateRow();
      $("tr#asset-real-estate-title").after(row);
      
      APP.finishTurn();
      }
    } else {
      this.loanOffer(downPayment);
    }
  },
  loanOffer: function(cost) {
    var player = APP.players[APP.currentPlayerArrPos()];

    APP.display.clearCards();
    APP.display.clearBtns();
    $("#cannot-afford-loan-card").show();
    $("#borrow-offer-loan-btn").show();
    $("#no-loan-btn").show();

    if (APP.doodadCost > 0) {
      //--$("#no-loan-btn").hide();
    }
    this.roundLoan(cost);
    var loan = this.loanAmount;

    document.getElementById("loan-offer").innerHTML = loan;
    document.getElementById("loan-offer-monthly-payment").innerHTML =
      loan * 0.1;
  },
  roundLoan: function(cost) {
    var player = APP.players[APP.currentPlayerArrPos()];
    var a = cost - player.cash;

    if (a < 1000) {
      this.loanAmount = 1000;
    } else {
      var b = a.toString(10).split("");
      for (var i = 1; i < b.length; i++) {
        b[i] = 0;
      }
      b[0] = Number(b[0]) + 1;
      this.loanAmount = Number(b.join(""));
    }
  },
  getLoan: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var boardPosition = player.position;
    var downsizedAmount = player.totalExpenses;
    
    if (APP.doodadCost > 0) {
      var costD = APP.doodadCost;
      this.loanOffer(costD);
    }
    if (boardPosition == 19) {
      var costDS = downsizedAmount;
      this.loanOffer(costDS);
      player.downsizedTurns += 3;
    }

    player.loans += this.loanAmount;
    player.cash += this.loanAmount;

    if (boardPosition % 2 === 0 || boardPosition === 0) {
      //return to deal
      APP.display.clearCards();
      APP.display.clearBtns();

      var dealType = APP.currentDeal.type;

      switch (dealType) {
        case "Stock":
          $("#deal-card-stock").show();
          $("#show-stock-form-btn").show();
          $("#pass-btn").show();
          break;
        case "Mutual Fund":
          $("#deal-card-stock").show();
          $("#show-stock-form-btn").show();
          $("#pass-btn").show();
          break;
        case "Real Estate":
          $("#deal-card-real-estate").show();
          $("#buy-real-estate-btn").show();
          $("#pass-btn").show();
          break;
        default:
          $("#pass-btn").show();
          break;
      }

      this.statement(APP.currentPlayerArrPos());
    }
  }
};

APP.scenario = function(
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
  this.loans = 0;
  this.loanPayment = 0;

  this.boatLoan = 0;
  this.boatPayment = 0;
  this.downsizedTurns = 0;
  this.stockAssets = [];
  this.realEstateAssets = [];

  this.cashFlow = function() {};
};

APP.scenarioChoices = [
  [
    "Airline Pilot",
    9500,
    400,
    2350,
    1300,
    300,
    660,
    50,
    2210,
    143000,
    15000,
    22000,
    1000
  ],
  [
    "Business Manager",
    4600,
    400,
    910,
    700,
    120,
    90,
    50,
    1000,
    75000,
    6000,
    3000,
    1000
  ],
  [
    "Doctor (MD)",
    13200,
    400,
    3420,
    1900,
    380,
    270,
    50,
    2880,
    202000,
    19000,
    9000,
    1000
  ],
  [
    "Engineer",
    4900,
    400,
    1050,
    700,
    140,
    120,
    50,
    1090,
    75000,
    7000,
    4000,
    1000
  ],
  ["Janitor", 1600, 560, 280, 200, 60, 60, 50, 300, 20000, 4000, 2000, 1000],
  [
    "Lawyer",
    7500,
    400,
    1830,
    1100,
    220,
    180,
    50,
    1650,
    115000,
    11000,
    6000,
    1000
  ],
  ["Mechanic", 2000, 670, 360, 300, 60, 60, 50, 450, 31000, 3000, 2000, 1000],
  ["Nurse", 3100, 480, 600, 400, 100, 90, 50, 710, 47000, 5000, 3000, 1000],
  [
    "Police Officer",
    3000,
    520,
    580,
    400,
    100,
    60,
    50,
    690,
    46000,
    5000,
    2000,
    1000
  ],
  ["Secretary", 2500, 710, 460, 400, 80, 60, 50, 570, 38000, 4000, 2000, 1000],
  [
    "Teacher (K-12)",
    3300,
    400,
    630,
    500,
    100,
    90,
    50,
    760,
    50000,
    5000,
    3000,
    1000
  ],
  [
    "Truck Driver",
    2500,
    750,
    460,
    400,
    80,
    60,
    50,
    570,
    38000,
    4000,
    2000,
    1000
  ]
];

APP.cards = {
  smallDeal: {
    mutual01: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Lower interest rates drive market and fund to strong showing.",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 30,
      range: "$10 to $30",
      dividend: false,
      id: "m01"
    },
    mutual02: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Brilliant young fund manager. Everyone believes he has the Midas touch",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 20,
      range: "$10 to $30",
      dividend: false,
      id: "m02"
    },
    mutual03: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Weak earnings by most companies lead to weak price of mutual fund",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 10,
      range: "$10 to $30",
      dividend: false,
      id: "m03"
    },
    mutual04: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Lower interest rates drive market and fund to strong showing.",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 5,
      range: "$10 to $30",
      dividend: false,
      id: "m04"
    },
    mutual05: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Powerhouse market drives strong fund's price up to record high",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 40,
      range: "$10 to $30",
      dividend: false,
      id: "m05"
    },
    stock001: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Booming market leads to record share price of this home electronics seller!",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 40,
      range: "$5 to $30",
      dividend: false,
      id: "s001"
    },
    stock002: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "High inflation leads to poor share price for this home electronics seller.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 5,
      range: "$5 to $30",
      dividend: false,
            id: "s002"
    },
    stock003: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Record interest rates lead to substandard share price for this home electronics seller",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 5,
      range: "$5 to $30",
      dividend: false,
            id: "s003"
    },
    stock004: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Strong market leads to strong share price for this home electronics seller",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 30,
      range: "$5 to $30",
      dividend: false,
            id: "s004"
    },
    stock005: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Trade war panic leads to record low share price for this home electronics seller.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 1,
      range: "$5 to $30",
      dividend: false,
            id: "s005"
    },
    stock006: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Weak market leads to sagging share price for this home electronics seller.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 10,
      range: "$5 to $30",
      dividend: false,
            id: "s006"
    },
    stock007: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Fast growing seller of home electronics headed by 32 year old Harvard grad.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 20,
      range: "$5 to $30",
      dividend: false,
            id: "s007"
    },
    stock008: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Low interest rates lead to substantial share price for this home electronics seller.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 30,
      range: "$5 to $30",
      dividend: false,
            id: "s008"
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
            id: "s101"
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
      id: "s102"
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
      id: "s103"
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
      id: "s104"
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
      id: "s105"
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
      id: "s106"
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
      id: "s107"
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
      id: "s108"
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
      id: "s201"
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
      id: "s202"
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
      id: "s203"
    },
    stock204: {
      type: "Stock",
      name: "ON2U Entertainment Co.",
      description: "Movie buyer fired after third mega-flop! Shares sink. CHairman's bonus canceled.",
      rule: "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "ON2U",
      price: 5,
      range: "$5 to $40",
      dividend: false,
      id: "s204"
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
      id: "s205"
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
      id: "s206"
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
      id: "s207"
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
      id: "s208"
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
    //preferredStock1: {},
    realEstateS1: {
      type: "Real Estate",
      name: "You Find a Great Deal!",
      description:
        "Older 3/2 house, repossessed by government agency. Ready to go with government financing and a tenant.",
      rule:
        "Borrow from the Bank if you must, but... BUY THIS! 132% ROI, may sell for $65,000 to $135,000.",
      cost: 35000,
      downPayment: 2000,
      mortgage: 33000,
      cashFlow: 220,
      tag: "3Br/2Ba"    
    },
    realEstateS2: {
      type: "Real Estate",
      name: "Condo for Sale - 2 Br/1 Ba",
      description:
        "Nice 2/1 condo available due to marriage of owner. Bad area. Needs work.",
      rule:
        "Use {this yourself or sell to another player. 24% ROI, may sell for $45,000 to $65,000.",
      cost: 50000,
      downPayment: 5000,
      mortgage: 45000,
      cashFlow: 100,
      tag: "2Br/1Ba"
    },
    realEstateS3: {
      type: "Real Estate",
      name: "Condo For Sale - 2 Br/1 Ba",
      description:
        "Parents selling 2/1 condo used by their chil in college town. Lots of demand for rentals in this area.",
      rule:
        "Use this yourself or sell to another player. 42% ROI, may sell for $45,000 to $65,000.",
      cost: 40000,
      downPayment: 4000,
      mortgage: 36000,
      cashFlow: 140,
      tag: "2Br/1Ba"
    },
    realEstateS4: {
      name: "Condo For Sale - 2 Br/1 Ba",
      type: "Real Estate",
      description:
        "Older 2/1 condo offered by young couple who want to move up to a 3/2 house due to growing family. Available soon.",
      cost: 50000,
      downPayment: 5000,
      mortgage: 45000,
      cashFlow: 100,
      tag: "2Br/1Ba"
    },
    realEstateS5: {
      name: "Condo For Sale - 2 Br/1 Ba",
      type: "Real Estate",
      description:
        "Excellent 2/1 condo with many extras. For sale due to business success of owner. She's moving up, so can you.",
      rule: "Use this yourself or sell to another player",
      cost: 60000,
      downPayment: 5000,
      mortgage: 55000,
      cashFlow: -100,
      tag: "2Br/1Ba"
    },
    realEstateS6: {
      name: "Condo For Sale - 2 Br/1 Ba",
      type: "Real Estate",
      description:
        "Bank foreclosure! 2/1 condo in desirable neighborhood close to jobs and stores. Make offer, favorable financing by bank.",
      rule:
        "Use this yourself or sell to another player. 53% ROI/ may sell for $45,000 to $65,000",
      cost: 40000,
      downPayment: 5000,
      mortgage: 35000,
      cashFlow: 220,
      tag: "2Br/1Ba"
    },
    realEstateS7: {
      name: "House For Sale - 3 Br/2 Ba",
      type: "Real Estate",
      description:
        "Not lived in for 6 months, this bank-foreclosed house just reduced. Loan includes estimated repair costs.",
      rule:
        "Use this yourself or sell to another player. May sell for $65,000 to $135,000.",
      cost: 50000,
      downPayment: 0,
      mortgage: 50000,
      cashFlow: 100,
      tag: "3Br/2Ba"
    },
    realEstateS8: {
      name: "House For Sale - 3 Br/2 Ba",
      type: "Real Estate",
      description:
        "Not lived in for 6 months, this bank-foreclosed house just reduced. Loan includes estimated repair costs.",
      rule:
        "Use this yourself or sell to another player. May sell for $65,000 to $135,000",
      cost: 50000,
      downPayment: 5000,
      mortgage: 35000,
      cashFlow: 220,
      tag: "3Br/2Ba"
    },
    propertyDamage: {
      name: "Tenant Damages Your Property",
      type: "Property Damage",
      description: "Tenant fails to pay rent for 2 months and then skips town leaving damage to your rental property. Insurance covers most damage and costs, but you are still out of pocket $500.",
      rule: "Pay $500 if you own any rental property",
      cost: 500
    }
  },
  bigDeal: {
    realEstate1: {
      name: "8-plex for Sale",
      type: "Real Estate",
      description:
        "Reinvesting owner offers 8-plex for sale at reasonable price. Financing already in place. All it needs is your down payment.",
      rule:
        "Use this yourself or sell to another pl;ayer. 51% ROI, may sell for $200,000 to $280,000.",
      cost: 220000,
      downPayment: 40000,
      mortgage: 180000,
      cashFlow: 1700,
      tag: "8PLEX"
    },
    realEstate2: {
      name: "House for Sale - 3 Br/2 Ba",
      type: "Real Estate",
      decription:
        "Divorce leads to sale of this 3/2 house in an area full of owner occupied homes. Has been on the market 5 months.",
      rule:
        "Use this yourself or sell to another player. 30% ROI, may sell for $65,000 to $135,000.",
      cost: 70000,
      downPayment: 20000,
      mortgage: 50000,
      cashFlow: 500,
      tag: "3Br/2ba"
    },
    realEstate3: {
      name: "House for Sale - 3 Br/2 Ba",
      type: "Real Estate",
      description:
        "Good investment potential in this 3/2 house if you can be patient. Positive cash flow even though rents are weak.",
      rule:
        "Use this yourself or sell to another player. 45% ROI, may sell for $65,000 to $135,000.",
      cost: 65000,
      downPayment: 8000,
      mortgage: 57000,
      cashFlow: 300,
      tag: "3Br/2Ba"
    },
    realEstate4: {
      name: "4-plex for Sale",
      type: "Real Estate",
      description:
        "4-plex available - forced sale. Out-of-state, financially distressed owner years behind on taxes. Some records available.",
      rule:
        "Use this yourself or sell to another player. 56% ROI, may sell for $100,00 to $140,000.",
      cost: 80000,
      downPayment: 16000,
      mortgage: 64000,
      cashFlow: 750,
      tag: "4PLEX"
    },
    realEstate5: {
      name: "8-plex for Sale",
      type: "Real Estate",
      description:
        "Professional person urgently needs cash to save partnership. 8-plex sale to raise capital, good opportunity for right person.",
      rule: "Use this yourself or sell to another player.",
      cost: 16000,
      downPayment: 32000,
      mortgage: 128000,
      cashFlow: 1700,
      tag: "8PLEX"
    },
    realEstate6: {
      name: "Automated Business for Sale",
      type: "Real Estate",
      description:
        "Successful 4 bay coin operated auto wash near busy intersection. Seller is moving to retirement community out of state.",
      rule: "Use this yourself or sell to another player.",
      cost: 125000,
      downPayment: 25000,
      liability: 100000,
      cashFlow: 1800,
      tag: "CarWash"
    },
    realEstate7: {
      name: "20 Acres for Sale",
      type: "Real Estate",
      description:
        " 20 acres of vacant land, currently zoned residential. Possibly of good appreciation if rezoned commercial.",
      rule:
        " Use this yourself or sell to another player. 0% ROI, may sell for ??.",
      cost: 20000,
      downPayment: 20000,
      mortgage: 0,
      cashFlow: 0,
      tag: "20Acres"
    },
    realEstate8: {
      name: "8-plex for Sale",
      type: "Real Estate",
      description:
        "Retiring investor/owner offers his 8-plex at current appraisal value. Professional lawn service and management. Full records.",
      rule:
        "Use this yourself or sell to another player. 29% ROI, may sell for $200,000 to $280,000.",
      cost: 240000,
      downPayment: 40000,
      mortgage: 200000,
      cashFlow: 950,
      tag: "8PLEX"
    },
    realEstate9: {
      name: "Tenant Damages Your Property",
      type: "Property Damage",
      description:
        "Tenant refuses to pay rent after losing job. When you get him evicted you discover significant damages to your property. <br> Insurance covers most damages and costs, but you still are out of pocket $1,000. Pay $1,000",
      rule: "Pay $1,000 if you own any rental real estate",
      cost: 1000,
      tag: false
    },
    realEstate10: {
      name: "Limited Partner Wanted",
      type: "Business Investment",
      description:
        "Non-franchise sandwich shop doubling the number of locations. Owner needs additional equity capital to get operating loan.",
      rule:
        "Use this yourself or sell to another player. 60% ROI, owner may buy you out for $60,000 to $90,000.",
      cost: 30000,
      downPayment: 30000,
      liability: 0,
      cashFlow: 1500,
      tag: "FOODSHOP"
    }
  },
  offer: [],
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
    doodad6: {
      name: "Buy Big Screen TV",
      cost: 4000,
      text: "Pay $4000",
      loan: 4000,
      payment: 120
    },
    doodad7: {
      name: "Your Anniversary!",
      cost: 200,
      text: "Spend 200"
    },
    doodad8: {
      name: "Son's College Tuition",
      cost: 1500,
      text: "Pay $1500"
      //if player has child
    },
    doodad9: {
      name: "Buy Toys for Your Kids",
      cost: 50,
      text: "Spend $50"
      //per child
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
      text:
        "Pay $150 \n" +
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
      text:
        "Pay $10 \n" + "\n" + "Buy a Cafe Latte & Cappuccino for You & a Friend"
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
      text:
        "Costs you $200 \n" + "\n Couldn't Resist New Painting By Local Artist"
    },
    doodad30: {
      name: "Your Child Needs Braces",
      cost: 2000,
      text: "Pay $2000"
      //if player has child
    },
    doodad31: {
      name: "Buy New Music CDs",
      cost: 100,
      text: "Take kids to the Amusement Park and spend $100"
      //if player has child
    },
    doodad32: {
      name: "Buy Cappuccino Machine",
      cost: 150,
      text: "Pay $150"
    },
    doodad33: {
      name: "Your Daughter's Wedding",
      cost: 2000,
      text: "Costs you $2000"
      //if player has child
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
      text:
        "Pay $220 for tuition & books \n" +
        "\n" +
        "Go back to school for added skills."
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
    }
  }
};

APP.dreamPhase = {
  dreamPhaseOn: false,
  dreamArrPos: 0,
  openDreamPhase: function() {
    //show dream
    var dream = document.getElementById("dream-text");
    var dreamDescription = document.getElementById("dream-des");
    dream.innerHTML = APP.dreamPhase.dreams[APP.dreamPhase.dreamArrPos];
    dreamDescription.innerHTML =
      APP.dreamPhase.dreamDescriptions[APP.dreamPhase.dreamArrPos];
    //show player job, income and savings

    var jobTextId = document.getElementById("job-text");
    jobTextId.insertAdjacentHTML(
      "afterbegin",
      "<div>You are a<span id='dream-job'></span>.</div><div>Your starting salary is $<span id='dream-starting-salary'></span>.</div><div>You have $<span id='dream-starting-savings'></span> in your savings.</div><div>That means your starting cash is $<span id='dream-starting-cash'></span></div>"
    );

    this.showStartScenario(0);
  },
  showStartScenario: function(player) {
    var player = APP.currentPlayerArrPos();
    var playerJob = APP.players[player].jobTitle[0];
    var vowelRegex = "^[aieouAIEOU].*";
    var matched = playerJob.match(vowelRegex);
    if (matched) {
      //add an n and a space before job title
      var job = "n " + playerJob;
    } else {
      //add space before jobtitle
      var job = " " + playerJob;
    }
    var playerSalary = APP.players[player].jobTitle[1];
    var playerSavings = APP.players[player].jobTitle[2];
    var playerCash = playerSavings;

    document.getElementById("dream-job").innerHTML = job;
    document.getElementById("dream-starting-salary").innerHTML = playerSalary;
    document.getElementById("dream-starting-savings").innerHTML = playerSavings;
    document.getElementById("dream-starting-cash").innerHTML = playerCash;
  },
  leftDream: function() {
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
  rightDream: function() {
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
  dreamChoiceBtn: function() {
    //save dream
    var chosenDream = this.dreams[this.dreamArrPos];
    APP.players[APP.currentPlayerArrPos()].dream = chosenDream;

    //start race phase once last player has dream
    if (APP.currentPlayer == APP.pCount) {
      this.endDreamPhase();
    }
    //show first dream
    var restartDream = document.getElementById("dream-text");
    restartDream.innerHTML = APP.dreamPhase.dreams[0];

    //show job, savings, starting cash for current player
    this.showStartScenario(APP.currentPlayerArrPos());

    APP.nextTurn();
  },
  endDreamPhase: function() {
    APP.display.hideDreamPhase();
    APP.display.showRacePhase();
    APP.dreamPhase.dreamPhaseOn = false;
    $("#finance-box").show();
  }
};
APP.dreamPhase.dreams = [
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
];
APP.dreamPhase.dreamDescriptions = [
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
];

APP.display = {
  tokens: [
    { ele: "<div id='player1-piece'>1</div>" },
    { ele: "<div id='player2-piece'>2</div>" },
    { ele: "<div id='player3-piece'>3</div>" },
    { ele: "<div id='player4-piece'>4</div>" },
    { ele: "<div id='player5-piece'>5</div>" },
    { ele: "<div id='player6-piece'>6</div>" },
    { ele: "<div id='player7-piece'>7</div>" },
    { ele: "<div id='player8-piece'>8</div>" }
  ],
  renderBoard: function() {
    $("#board").show();
    $("#board-container").show();
    $("#info").show();
    $("#player-list").show();

    APP.display.showPlayerList();
    APP.display.showTurnInfo();
    APP.board.printSquares();
    APP.display.showTokens();
  },
  showTokens: function() {
    for (var i = 0; i < APP.pCount; i++) {
      var token = this.tokens[i].ele;
      var startSpace = document.getElementById("tokenSection0");
      startSpace.insertAdjacentHTML("beforeend", token);
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
  showStockForm: function() {
    //get which form to show
    //show form
    $("#buy-shares-form").show();
    $("#show-stock-form-btn").hide();
    $("#buy-stock-btn").show();
    //clear current asset
  },
  increaseShares: function() {
    var value = parseInt(document.getElementById("share-amt-input").value, 10);
    //var value = parseInt(document.getElementById("share-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value += 1;
    document.getElementById("share-amt-input").value = value;
    //document.getElementById("share-amt-input2").value = value;
  },
  decreaseShares: function() {
    var value = parseInt(document.getElementById("share-amt-input").value, 10);
    //var value = parseInt(document.getElementById("share-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value -= 1;
    if (value > 1) {
      value -= 1;
    } else {
      value = 1;
    }
    document.getElementById("share-amt-input").value = value;
    //document.getElementById("share-amt-input2").value = value;
  },
  clearBtns: function() {
    $("#repay-borrow-btns").hide();
    $("#small-deal-btn").hide();
    $("#big-deal-btn").hide();
    $("#buy-asset-btn").hide(); //--?
    $("#buy-stock-btn").hide();
    $("#doodad-pay-button").hide();
    $("#ds-pay-button").hide();
    $("#charity-donate-btn").hide();
    $("#pass-btn").hide();
    $("#no-loan-btn").hide();
    //$("#done-btn").hide();
    $("#cancel-btn").hide();
    $("#borrow-loan-btn").hide();
    $("#borrow-doodad-loan-btn").hide();
    $("#borrow-offer-loan-btn").hide();
    $("#confirm-pay-btn").hide();
    $("#done-repay-btn").hide();
    $("#show-stock-form-btn").hide();
    $("#buy-real-estate-btn").hide();
  },
  clearCards: function() {
    $("#opp-card").hide();
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
    $("#deal-card-real-estate").hide();
    $("#deal-card-stock").hide();
    $("#buy-shares-form").hide();
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
  highlightLiabilities: function(option) {
    var player = APP.players[APP.currentPlayerArrPos()];
    var table = document.getElementById("liability-table");
    var rows = table.getElementsByTagName("tr");

    for (var i = 1; i < rows.length; i++) {
      var currentRow = table.rows[i];

      if (option === 1) {
        currentRow.style.backgroundColor = "#FFEB3B";

        var addOnClick = function(row) {
          var anchor = rows[i];
          var cell = row.getElementsByTagName("td")[1];
          var id = cell.getAttribute("id");

          anchor.onclick = function() {
            player.loanId = id;

            if (id === "liability-loans") {
              $("#repay-loan-card").show();
              $("#cancel-btn").show();

              $("#done-repay-btn").hide();
              $("#repay-card").hide();
            } else {
              $("#repay-loan-card").hide();
              $("#confirm-pay-btn").show();
              $("#cancel-btn").show();
              $("#pay-confirm-card").show();

              $("#done-repay-btn").hide();
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
    APP.finance.statement(APP.currentPlayerArrPos());
  }
};

APP.board = {
  square: [
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["CHARITY", "gold"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"],
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["CHILD", "#00bd92"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"],
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["DOWNSIZE", "teal"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"]
  ],
  printSquares: function() {
    document.getElementById("cell0").innerHTML =
      "<div id='tokenSection0'><div class ='cellx'><p>" +
      APP.board.square[0][0] +
      " </p></div>";
    document.getElementById("cell1").innerHTML =
      "<div id='tokenSection1'><div class ='cellx'><p>" +
      APP.board.square[1][0] +
      " </p></div>";
    document.getElementById("cell2").innerHTML =
      "<div id='tokenSection2'><div class ='cellx'><p>" +
      APP.board.square[2][0] +
      " </p></div>";
    document.getElementById("cell3").innerHTML =
      "<div id='tokenSection3'><div class ='cellx'><p>" +
      APP.board.square[3][0] +
      " </p></div>";
    document.getElementById("cell4").innerHTML =
      "<div id='tokenSection4'><div class ='cellx'><p>" +
      APP.board.square[4][0] +
      " </p></div>";
    document.getElementById("cell5").innerHTML =
      "<div id='tokenSection5'><div class ='cellx'><p>" +
      APP.board.square[5][0] +
      " </p></div>";
    document.getElementById("cell6").innerHTML =
      "<div id='tokenSection6'><div class ='cellx'><p>" +
      APP.board.square[6][0] +
      " </p></div>";
    document.getElementById("cell7").innerHTML =
      "<div id='tokenSection7'><div class ='cellx'><p>" +
      APP.board.square[7][0] +
      " </p></div>";
    document.getElementById("cell8").innerHTML =
      "<div id='tokenSection8'><div class ='cellx'><p>" +
      APP.board.square[8][0] +
      " </p></div>";
    document.getElementById("cell9").innerHTML =
      "<div id='tokenSection9'><div class ='cellx'><p>" +
      APP.board.square[9][0] +
      " </p></div>";
    document.getElementById("cell10").innerHTML =
      "<div id='tokenSection10'><div class ='cellx'><p>" +
      APP.board.square[10][0] +
      " </p></div>";
    document.getElementById("cell11").innerHTML =
      "<div id='tokenSection11'><div class ='cellx'><p>" +
      APP.board.square[11][0] +
      " </p></div>";
    document.getElementById("cell12").innerHTML =
      "<div id='tokenSection12'></div><div class ='cellx'><p>" +
      APP.board.square[12][0] +
      " </p></div>";
    document.getElementById("cell13").innerHTML =
      "<div id='tokenSection13'><div class ='cellx'><p>" +
      APP.board.square[13][0] +
      " </p></div>";
    document.getElementById("cell14").innerHTML =
      "<div id='tokenSection14'><div class ='cellx'><p>" +
      APP.board.square[14][0] +
      " </p></div>";
    document.getElementById("cell15").innerHTML =
      "<div id='tokenSection15'><div class ='cellx'><p>" +
      APP.board.square[15][0] +
      " </p></div>";
    document.getElementById("cell16").innerHTML =
      "<div id='tokenSection16'><div class ='cellx'><p>" +
      APP.board.square[16][0] +
      " </p></div>";
    document.getElementById("cell17").innerHTML =
      "<div id='tokenSection17'><div class ='cellx'><p>" +
      APP.board.square[17][0] +
      " </p></div>";
    document.getElementById("cell18").innerHTML =
      "<div id='tokenSection18'><div class ='cellx'><p>" +
      APP.board.square[18][0] +
      " </p></div>";
    document.getElementById("cell19").innerHTML =
      "<div id='tokenSection19'><div class ='cellx'><p>" +
      APP.board.square[19][0] +
      " </p></div>";
    document.getElementById("cell20").innerHTML =
      "<div id='tokenSection20'><div class ='cellx'><p>" +
      APP.board.square[20][0] +
      " </p></div>";
    document.getElementById("cell21").innerHTML =
      "<div id='tokenSection21'><div class ='cellx'><p>" +
      APP.board.square[21][0] +
      " </p></div>";
    document.getElementById("cell22").innerHTML =
      "<div id='tokenSection22'><div class ='cellx'><p>" +
      APP.board.square[22][0] +
      " </p></div>";
    document.getElementById("cell23").innerHTML =
      "<div id='tokenSection23'><div class ='cellx'><p>" +
      APP.board.square[23][0] +
      " </p></div>";
  }
};

$(document).ready(function() {
  APP.initGame();
});

APP.test = function() {
  //--loads in finance statement function
  document.getElementById("small-opp-test1").innerHTML = APP.currentDeal.name;
  document.getElementById("small-opp-test2").innerHTML = APP.currentDeal.shares;
};


var APP = APP || {
  players: [],
  pCount: 1,
  turnCount: 1,
  currentPlayer: 1,
  currentPlayerArrPos: function() {
    return APP.currentPlayer - 1;
  },
  previousPlayer: function() {
    var prevPlayer;
    if (this.currentPlayer === 1) {
      prevPlayer = this.pCount;
    } else {
      prevPlayer = APP.currentPlayerArrPos();
    }
    return prevPlayer;
  },
  name: function(playerNumber) {
    var player = "player" + parseInt(playerNumber, 10) + "name";
    var name = document.getElementById(player).value;
    return name;
  },
  initGame: function() {
    $("#home-play-button").click(function() {
      APP.display.hideHomeScreen();
      APP.display.showGameSelectionScreen();
    });
    $("#new-room-button").click(function() {
      APP.display.hideGameSelectionScreen();
      APP.display.showGameSetupScreen();
    });
    $("#start-game").click(function() {
      APP.display.hideSetup();
      APP.display.renderBoard();
    });
  },
  setup: function() {
    var pn = document.getElementById("player-number");
    APP.pCount = pn.options[pn.selectedIndex].value;

    //Create players
    for (var i = 1; i <= APP.pCount; i++) {
      var randomScenario = Math.floor(
        Math.random() * APP.scenarioChoices.length
      );
      //add each player and job to the players array
      var playerObj = new APP.scenario(APP.scenarioChoices[randomScenario]);

      playerObj.name = APP.name(i);
      APP.players.push(playerObj);

      //send list of players to board
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
    //highlight first player
    var curPlayerRowId = document.getElementById(
      "table-row-player" + parseInt(APP.currentPlayer, 10)
    );
    curPlayerRowId.style.border = "3pt groove #FDD835";

    //start dream phase (phase 1)
    APP.dreamPhase.openDreamPhase();
    APP.dreamPhase.dreamPhaseOn = true;

    //starting cash
    if (APP.turnCount <= 1) {
      for (var i = 0; i < APP.players.length; i++) {
        APP.players[i].cash += APP.players[i].jobTitle[2];
      }
    }

    APP.display.clearBtns();
    APP.display.clearCards();

    $("#end-turn-btn").hide();

    $("#opp-card-btns").hide();
    $("#buy-opp-button").hide();
    $("#doodad-pay-button").hide();
    $("#ds-pay-button").hide();
    $("#charity-donate-btn").hide();
    $("#done-btn").hide();
    $("#pass-button").hide();
    $("#roll2-btn").hide();
    $("#confirm-pay-btn").hide();
    $("#exp-child-row").hide();

    $("#finish-instructions").hide();
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
    //if charity is selected roll twice

    var token = APP.display.tokens[player];

    //remove old piece
    var oldTokenElement = document.getElementById(
      "tokenSection" + parseInt(pObj.position, 10)
    );
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

    //when player lands on square load card
    APP.loadCard(currentPosition);

    //if pass paycheck get payday - currently set to salary
    if (previousPosition < 5 && currentPosition >= 5) {
      pObj.cash += pObj.payday;
    } else if (previousPosition < 13 && currentPosition >= 13) {
      pObj.cash += pObj.payday;
    } else if (previousPosition < 21 && currentPosition + dice >= 21) {
      pObj.cash += pObj.payday;
    }

    APP.finance.statement(APP.currentPlayerArrPos());
  },
  updatePosition: function(dice) {
    var p = APP.players[APP.currentPlayerArrPos()];

    if (p.position + dice <= 23) {
      p.position += dice;
    } else {
      var x = p.position + dice;
      x -= 23;
      p.position = x;
    }
  },
  nextTurn: function() {
    $("#finish-instructions").hide();
    $("#finish-turn-container").hide();

    APP.display.clearBtns();
    APP.display.clearCards();
    APP.clearAmounts();
    
    $("#turn-instructions").show();
    $("#card-btns").show();
    $("#roll-btn").show();
    $("#roll2-btn").hide();

    if (APP.currentPlayer < APP.pCount) {
      APP.currentPlayer++;
    } else {
      APP.currentPlayer = 1;
    }
    var player = APP.players[APP.currentPlayerArrPos()];

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

    var playerNameId = document.getElementById("player-name");
    playerNameId.innerHTML = APP.name(APP.currentPlayer);

    APP.turnCount++;

    APP.finance.statement(APP.currentPlayerArrPos());

    if (player.charityTurns === 0) {
      $("#roll2-btn").hide();
    } else {
      $("#roll2-btn").show();
      player.charityTurns--;
      //--
      APP.finance.statement(APP.currentPlayerArrPos());
    }

    if (player.downsizedTurns != 0) {
      player.downsizedTurns--;
      //--
      APP.finance.statement(APP.currentPlayerArrPos());
      if (APP.pCount != 1) {
        this.nextTurn();
      }
    }

    //if player cannot afford his bills even after selling assets, player loses
    //load bankruptcy card if player has assets to sell
    //allow player to sell assets if they have any
    //else load you lose card if cash flow is negative and there are no assets to sell
  },
  finishTurn: function() {
    //hide opportunity card
    $("#card-btns").hide();
    $("#turn-instructions").hide();
    $("#cancel-btn").hide();
    $("#done-repay-btn").hide();
    $("#done-btn").hide();
    APP.display.clearCards();

    $("#finish-turn-container").show();
    $("#finish-instructions").show();
    $("#end-turn-btn").show();
    $("#repay-borrow-btns").show();

    APP.finance.statement(APP.currentPlayerArrPos());
    this.clearAmounts();
  },
  currentDoodad: "",
  doodadCost: 0,
  getDoodad: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    //random doodad
    var obj = APP.cards.doodad;
    var keys = Object.keys(obj);
    var randDoodad = function(object) {
      return object[keys[Math.floor(keys.length * Math.random())]];
    };
    var currentDoodad = randDoodad(obj);

    //set doodad
    this.currentDoodad = currentDoodad.name;
    this.doodadCost = currentDoodad.cost;
    var text = currentDoodad.text;

    //if boat
    if (this.currentDoodad == "New Boat" && player.boatLoan == 0) {
      //--fix
      player.boatLoan = 17000;
      player.boatPayment = 340;
    } else if (this.currentDoodad == "New Boat") {
      text = "You already own one.";
    }
    //if credit card
    if (this.currentDoodad == "Buy Big Screen TV") {
      //--test
      player.creditDebt = 4000;
      player.tvPayment = 120;
    }
    //display doodad
    document.getElementById("doodad-title").innerHTML = this.currentDoodad;
    document.getElementById("doodad-text").innerHTML = text;
  },
  smallDeal: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    //get random deal
    var obj = APP.cards.smallDeal;
    var keys = Object.keys(obj);
    var randDeal = function(object) {
      return object[keys[Math.floor(keys.length * Math.random())]];
    };
    var currentDeal = randDeal(obj);
    var dealType = currentDeal.type;

    this.currentDeal = currentDeal;

    $("#opp-card").hide();
    $("#small-deal-btn").hide();
    $("#big-deal-btn").hide();

    //show deal card
    switch (dealType) {
      case "Stock":
        $("#deal-card-stock").show();
        $("#show-stock-form-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-cost").innerHTML =
          currentDeal.price;
        document.getElementById("deal-stock-cash-flow").innerHTML = "0";
        document.getElementById("deal-stock-trading-range").innerHTML =
          currentDeal.range;
        //shares owned
        document.getElementById("share-cost").innerHTML = currentDeal.price;
        break;
      case "Mutual Fund":
        $("#deal-card-stock").show();
        $("#show-stock-form-btn").show();
        $("#pass-btn").show();

        document.getElementById("deal-stock-type").innerHTML = currentDeal.type;
        document.getElementById("deal-stock-name").innerHTML = currentDeal.name;
        document.getElementById("deal-stock-text").innerHTML =
          currentDeal.description;
        document.getElementById("deal-stock-cost").innerHTML =
          currentDeal.price;
        document.getElementById("deal-stock-cash-flow").innerHTML = "0";
        document.getElementById("deal-stock-trading-range").innerHTML =
          currentDeal.range;
        //shares owned
        document.getElementById("share-cost").innerHTML = currentDeal.price;
        break;
      case "Real Estate":
        $("#deal-card-real-estate").show();
        $("#buy-real-estate-btn").show();
        $("#pass-btn").show();
        
        document.getElementById("deal-re-name").innerHTML = currentDeal.name;
        document.getElementById("deal-re-description").innerHTML = currentDeal.description;
        document.getElementById("deal-re-rule").innerHTML = currentDeal.rule;
        document.getElementById("deal-re-cost").innerHTML = currentDeal.cost;
        document.getElementById("deal-re-cash-flow").innerHTML = currentDeal.cashFlow;
        document.getElementById("deal-re-down-payment").innerHTML = currentDeal.downPayment;
        break;
      case "Other":
        //show card
        break;
    }
  },
  clearAmounts: function(){
    APP.finance.loanAmount = 1000;
    APP.finance.shareAmount = 1;
    document.getElementById("loan-amt-input").value = 1000;
    document.getElementById("loan-amt-input2").value = 1000;
    document.getElementById("share-amt-input").value = 1;
  }
};

APP.loadCard = function(boardPosition) {
  var playerObj = APP.players[APP.currentPlayerArrPos()];

  //hide turn instructions
  $("#turn-instructions").hide();
  $("#repay-borrow-btns").hide();
  $("#roll-btn").hide();
  $("#roll2-btn").hide();
  $("#end-turn-btn").hide();
  $("#confirm-pay-btn").hide();

  //opportunity
  if (boardPosition % 2 === 0 || boardPosition === 0) {
    $("#opp-card").show();

    $("#card-btns").show();
    $("#small-deal-btn").show();
    $("#big-deal-btn").show();

    //--
    $("#finish-turn-container").show();
  }

  //doodad aka expense
  if (boardPosition === 1 || boardPosition === 9 || boardPosition === 17) {
    $("#doodad-card").show();
    $("#doodad-pay-button").show();
    APP.getDoodad();
  }

  //offer
  if (boardPosition === 7 || boardPosition === 15 || boardPosition === 23) {
    $("#offer-card").show();
    $("#done-btn").show();
  }

  //paycheck
  if (boardPosition === 5 || boardPosition === 13 || boardPosition === 21) {
    this.finishTurn();
  }

  //charity
  if (boardPosition === 3) {
    $("#charity-card").show();
    $("#charity-donate-btn").show();
    $("#pass-btn").show();
  }

  //kid
  if (boardPosition === 11) {
    $("#kid-card").show();
    $("#done-btn").show();
    var expense = Math.round(parseInt(playerObj.totalIncome) * 0.056);
    var eTable = document.getElementById("expense-table");

    if (playerObj.children == 0) {
      //add row to expenses table
      $("#exp-child-row").show();
      /*var expenseTableRow =
        "<tr class='expenses-row'><td>Child</td><td>$<span id='expenses-child'></span></td></tr>";
        eTable.insertAdjacentHTML("beforeend", expenseTableRow);*/
      document.getElementById("child-cost").innerHTML = expense;

      //children count ++
      playerObj.children += 1;
    } else if (playerObj.children == 4) {
      //
    } else {
      playerObj.children += 1;
    }
    var children = playerObj.children;
    var childCost = children * expense;
    playerObj.childExpense = childCost;
    document.getElementById("expenses-child").innerHTML = parseInt(
      playerObj.childExpense,
      10
    );

    APP.finance.statement(APP.currentPlayerArrPos());
  }

  //downsize
  if (boardPosition === 19) {
    var downsizedAmount = playerObj.totalExpenses;
    //show pay button
    $("#ds-pay-button").show();
    //show downsize card
    $("#downsize-card").show();

    document.getElementById("downsized-amt").innerHTML = downsizedAmount;
  }
};

APP.finance = {
  loanAmount: 1000,
  shareAmount: 1,
  statement: function(currentPlayer) {
    var player = APP.players[currentPlayer];
    //income
    document.getElementById("player-job-income").innerHTML = player.jobTitle[0];
    document.getElementById("player-salary-income").innerHTML =
      player.jobTitle[1];
    //expenses
    document.getElementById("expenses-taxes").innerHTML = player.jobTitle[3];
    document.getElementById("expenses-mortgage").innerHTML = player.jobTitle[4];
    document.getElementById("expenses-car").innerHTML = player.jobTitle[5];
    document.getElementById("expenses-credit").innerHTML = player.jobTitle[6];
    document.getElementById("expenses-retail").innerHTML = player.jobTitle[7];
    document.getElementById("expenses-other").innerHTML = player.jobTitle[8];
    this.loanPayment(APP.currentPlayerArrPos());
    document.getElementById("expenses-loans").innerHTML = player.loanPayment;
    document.getElementById("expenses-boatloan").innerHTML = player.boatLoan;
    //Summary
    this.getExpenses(APP.currentPlayerArrPos());
    this.getIncome(APP.currentPlayerArrPos());
    this.getPayday(APP.currentPlayerArrPos());
    document.getElementById("bar-passive-income").innerHTML =
      player.assetIncome;
    document.getElementById("summary-cash").innerHTML = player.cash;
    document.getElementById("summary-total-income").innerHTML =
      player.totalIncome;
    document.getElementById("summary-total-expenses").innerHTML =
      player.totalExpenses;
    document.getElementById("summary-total-expenses-bar").innerHTML =
      player.totalExpenses;
    document.getElementById("summary-payday").innerHTML = player.payday;

    //assets
    var aTable = document.getElementById("assets-table");
    
    for (var i = 0; i < player.stockAssets.length; i++){
      var sharesId = "stock-shares" + parseInt(i, 10);
      var nameId = "stock-name" + parseInt(i,10);
      var priceId = "stock-cost" + parseInt(i, 10);
      
      //if row exists update data else create row
      
      document.getElementById(sharesId).innerHTML = player.stockAssets[i]['shares'];
      document.getElementById(nameId).innerHTML = player.stockAssets[i]['name'];
      document.getElementById(priceId).innerHTML = player.stockAssets[i]['price'];
    }
      //show stocks, funds, and cds to the stocks part with the amount owned and purchase price
      //show real estate and businesses with cost, cash flow and value
   
    //liabilities
    var lTable = document.getElementById("liability-table");

    var mortgage = player.jobTitle[9];
    var carLoan = player.jobTitle[10];
    var creditCard = player.jobTitle[11];
    var retail = player.jobTitle[12];
    var loans = player.loans;
    var boatLoan = player.boatLoan;

    //if paid off remove rows, if no loans hide row
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
      $("#exp-boatloan-row").hide();
    } else {
      $("#lia-boatloan-row").show();
      $("#exp-boatloan-row").show();
    }

    document.getElementById("liability-mortgage").innerHTML = mortgage;
    document.getElementById("liability-car").innerHTML = carLoan;
    document.getElementById("liability-credit").innerHTML = creditCard;
    document.getElementById("liability-retail").innerHTML = retail;
    document.getElementById("liability-loans").innerHTML = loans;
    document.getElementById("liability-boatloan").innerHTML = boatLoan;

    this.progressBar();

    APP.test();
  },
  progressBar: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var expenseBarEle = document.getElementById("income-expense-bar");

    var width = 100 * (player.assetIncome / player.totalExpenses);

    expenseBarEle.style.width = Math.round(width) + "%";
  },
  getIncome: function(currentPlayer) {
    //total income = salary + assets
    var player = APP.players[currentPlayer];
    var salary = player.jobTitle[1];

    player.totalIncome = salary;

    //include assets
    return player.totalIncome;
  },
  getExpenses: function(currentPlayer) {
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

    player.totalExpenses =
      taxes +
      mortgage +
      car +
      credit +
      retail +
      other +
      children +
      loanPayment +
      boatPayment;

    //include assets

    return player.totalExpenses;
  },
  getPayday: function(currentPlayer) {
    var player = APP.players[currentPlayer];
    var income = this.getIncome(currentPlayer);
    var expenses = this.getExpenses(currentPlayer);
    var pay = income - expenses;
    player.payday = pay;
  },
  payDoodad: function() {
    var player = APP.players[APP.currentPlayerArrPos()];

    if (APP.currentDoodad == "New Boat") {
      player.boatLoan = 17000;
      player.boatPayment = 340;
      APP.finishTurn();
      APP.doodadCost = 0;
    } else if (APP.doodadCost <= player.cash) {
      player.cash -= APP.doodadCost;
      APP.finishTurn();
      APP.doodadCost = 0;
    } else {
      this.loanOffer(APP.doodadCost);
      /*APP.display.clearCards();
      APP.display.clearBtns();
      $("#cannot-afford-card").show();

      $("#borrow-doodad-loan-btn").show();
      //--replace with outside function
      var loanAmt = function() {
        var doodadCost = APP.doodadCost;
        var remainder = doodadCost % 1000;
        doodadCost = doodadCost - remainder + 1000;
        return doodadCost;
      };
      //offer loan for the amount needed to pay for doodad
      document.getElementById("loan-offer").innerHTML =
        "Take out a loan of $" + parseInt(loanAmt(), 10);
      this.loanAmt = loanAmt();
      this.getLoan();*/
    }
    APP.currentDoodad = "";
  },
  payDownsize: function() {
    //show liability card
    var player = APP.players[APP.currentPlayerArrPos()];
    var boardPosition = player.position;
    var downsizedAmount = player.totalExpenses;
    var payment;

    if (boardPosition === 19) {
      if (player.cash < downsizedAmount) {
        this.loanOffer(downsizedAmount);
        /*$("#cannot-afford-card").show();

        $("#borrow-doodad-loan-btn").show();
        var loanAmt = function() {
          var doodadCost = APP.doodadCost;
          var remainder = doodadCost % 1000;
          doodadCost = doodadCost - remainder + 1000;
          return doodadCost;
        };
        //offer loan for the amount needed to pay for doodad
        document.getElementById("loan-offer").innerHTML =
          "Take out a loan of $" + parseInt(loanAmt(), 10);
        this.loanAmt = loanAmt();
        this.getLoan();*/
      } else {
        player.cash -= downsizedAmount;
        player.downsizedTurns += 3;
      }
    }

    APP.finishTurn();
  },
  donate: function() {
    var dPlayer = APP.players[APP.currentPlayerArrPos()];
    var donation = dPlayer.totalIncome * 0.1;

    if (dPlayer.cash >= donation) {
      dPlayer.cash = dPlayer.cash - donation;
      dPlayer.charityTurns += 3;
      APP.finishTurn();
    } else {
      $("#charity-donate-btn").hide();
      $("#charity-card").hide();
      $("#pass-btn").hide();
      $("#cannot-afford-card").show();
      $("#done-repay-btn").show();
    }
  },
  increaseLoan: function() {
    var value = parseInt(document.getElementById("loan-amt-input").value, 10);
    var value = parseInt(document.getElementById("loan-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value += 1000;
    document.getElementById("loan-amt-input").value = value;
    document.getElementById("loan-amt-input2").value = value;
  },
  decreaseLoan: function() {
    var value = parseInt(document.getElementById("loan-amt-input").value, 10);
    var value = parseInt(document.getElementById("loan-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    if (value > 1000) {
      value -= 1000;
    } else {
      value = 1000;
    }
    document.getElementById("loan-amt-input").value = value;
    document.getElementById("loan-amt-input2").value = value;
  },
  takeOutLoan: function() {
    var loan = parseInt(document.getElementById("loan-amt-input").value, 10);
    var player = APP.players[APP.currentPlayerArrPos()];
    loan = isNaN(loan) ? 0 : loan;
    player.loans += loan;
    player.cash += loan;

    APP.finishTurn();
  },
  repayLoan: function() {
    var loan = parseInt(document.getElementById("loan-amt-input2").value, 10);
    var player = APP.players[APP.currentPlayerArrPos()];
    loan = isNaN(loan) ? 0 : loan;
    player.loans -= loan;
    player.cash -= loan;

    //APP.finishTurn();
    $("#confirm-pay-btn").hide();
  },
  loanPayment: function(currentPlayer){
    var player = APP.players[currentPlayer];
    var loanPayment = player.loans * 0.1;
    player.loanPayment = loanPayment;
    return loanPayment;
  },
  pay: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var loanId = player.loanId;

    switch (loanId) {
      case "liability-mortgage":
        if (player.cash < player.jobTitle[9]) {
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
      case "liability-boatloan":
        if (player.cash < 17000) {
          $("#repay-card").hide();
          $("#pay-confirm-card").hide();
          $("#confirm-pay-btn").hide();

          $("#cannot-afford-loan-card").show();
        } else {
          player.cash -= 17000;
          player.boatLoan = 0;
          player.boatPayment = 0;

          $("#pay-confirm-card").hide();
          $("#confirm-pay-btn").hide();
          $("#cancel-btn").hide();

          $("#done-repay-btn").show();
          $("#repay-card").show();
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
      default:
        APP.finishTurn();
        break;
    }
    APP.finance.statement(APP.currentPlayerArrPos());
  },
  buyStock: function() { 
    var player = APP.players[APP.currentPlayerArrPos()];
    this.shareAmount = Number(document.getElementById("share-amt-input").value);
    var price = APP.currentDeal.price;
    var shares = this.shareAmount;
    var cost = price * shares;

    if (cost < player.cash) {
      player.cash -= cost;
      APP.currentDeal.shares = this.shareAmount;
      player.stockAssets.push(APP.currentDeal);
      
      //if currentdeal type at the current share price is already in the players array add shares else add new row 

      //--make dynamic
    function newStockRow(key) {
      var stockAssetRow = [
        "<td><span id='stock-shares" + parseInt(key, 10) + "'></span> Share of <span id='stock-name" + parseInt(key, 10) + "'></span></td>",
        "<td><span id='stock-cost" + parseInt(key, 10) + "'></span></td>"
    ];
      return "<tr class='assets-row'>" + stockAssetRow.join('') + "</tr>";
    }   
      var aTable = document.getElementById("asset-table");
     var row = newStockRow(0);

      //--test row

      aTable.insertAdjacentHTML('beforeend', row);

      //--
      APP.finishTurn();
    } else {

    if (cost < player.cash) {
      player.cash -= cost;
      APP.currentDeal.shares = this.shareAmount;
      player.stockAssets.push(APP.currentDeal);
      
      //if currentdeal type at the current share price is already in the players array add shares else add new row 
      //--make dynamic
    function newStockRow(key) {
      var stockAssetRow = [
        "<td><span id='stock-shares" + parseInt(key, 10) + "'></span> Share of <span id='stock-name" + parseInt(key, 10) + "'></span></td>",
        "<td><span id='stock-cost" + parseInt(key, 10) + "'></span></td>"
    ];
      return "<tr id='stock-row'>" + stockAssetRow.join('') + "</tr>";
    }   
      var aTable = document.getElementById("asset-table");
      var row = newStockRow(0);
      //--test row
      aTable.insertAdjacentHTML('beforeend', row);
      //--
      APP.finishTurn();
    } else {
      this.loanOffer(cost);
    }
    }
  },
  buyRealEstate: function() {
    
  },
  loanOffer: function(cost) {
    var player = APP.players[APP.currentPlayerArrPos()];
    var price = cost;
    
    APP.display.clearCards();
    APP.display.clearBtns();
    $("#cannot-afford-loan-card").show();
    $("#borrow-offer-loan-btn").show();
    $("#no-loan-btn").show();

    if (APP.doodadCost > 0) {
      //--$("#no-loan-btn").hide();
    }
    //round up loan to nearest 1000
    this.roundLoan(price);
    var loan = this.loanAmount;
    
    document.getElementById("loan-offer").innerHTML = loan;
    document.getElementById("loan-offer-monthly-payment").innerHTML = loan * 0.1;
  },
  roundLoan: function(cost){
    var player = APP.players[APP.currentPlayerArrPos()];
    var a = cost - player.cash;
    
    if (a < 1000) {
      this.loanAmount = 1000;
    } else {
      var b = a.toString(10).split('');
      for (var i = 1; i < b.length; i++) {
        b[i] = 0;
      }
      b[0] = Number(b[0]) + 1;
      this.loanAmount = Number(b.join(''));
    }
    
  },
  getLoan: function() {
    var player = APP.players[APP.currentPlayerArrPos()];
    var boardPosition = player.position;
    var downsizedAmount = player.totalExpenses;

    if (APP.doodadCost > 0) {
      var costD = APP.doodadCost;
      this.loanOffer(costD);
      //APP.doodadCost = 0;
    }
    if (boardPosition == 19) {
      var costDS = downsizedAmount;
      this.loanOffer(costDS);
      player.downsizedTurns += 3;
    }
    /* (boardPosition % 2 === 0 || boardPosition === 0) {
      var costO = APP.currentDeal.price
      this.loanOffer(costO);
    }*/

    player.loans += this.loanAmount;
    player.cash += this.loanAmount;

    if (boardPosition % 2 === 0 || boardPosition === 0) {
      //return to deal
      APP.display.clearCards();
      APP.display.clearBtns();
      $("#deal-card-stock").show();
      $("#show-stock-form-btn").show();
      $("#pass-btn").show();
    }
    
    this.statement(APP.currentPlayerArrPos());
  }
};

APP.scenario = function(
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
  this.loans = 0;
  this.loanPayment = 0;

  this.boatLoan = 0;
  this.boatPayment = 0;
  this.downsizedTurns = 0;
  this.stockAssets = [];
  this.realEstateAssets = [];
};

APP.scenarioChoices = [
  [
    "Airline Pilot",
    9500,
    400,
    2350,
    1300,
    300,
    660,
    50,
    2210,
    143000,
    15000,
    22000,
    1000
  ],
  [
    "Business Manager",
    4600,
    400,
    910,
    700,
    120,
    90,
    50,
    1000,
    75000,
    6000,
    3000,
    1000
  ],
  [
    "Doctor (MD)",
    13200,
    400,
    3420,
    1900,
    380,
    270,
    50,
    2880,
    202000,
    19000,
    9000,
    1000
  ],
  [
    "Engineer",
    4900,
    400,
    1050,
    700,
    140,
    120,
    50,
    1090,
    75000,
    7000,
    4000,
    1000
  ],
  ["Janitor", 1600, 560, 280, 200, 60, 60, 50, 300, 20000, 4000, 2000, 1000],
  [
    "Lawyer",
    7500,
    400,
    1830,
    1100,
    220,
    180,
    50,
    1650,
    115000,
    11000,
    6000,
    1000
  ],
  ["Mechanic", 2000, 670, 360, 300, 60, 60, 50, 450, 31000, 3000, 2000, 1000],
  ["Nurse", 3100, 480, 600, 400, 100, 90, 50, 710, 47000, 5000, 3000, 1000],
  [
    "Police Officer",
    3000,
    520,
    580,
    400,
    100,
    60,
    50,
    690,
    46000,
    5000,
    2000,
    1000
  ],
  ["Secretary", 2500, 710, 460, 400, 80, 60, 50, 570, 38000, 4000, 2000, 1000],
  [
    "Teacher (K-12)",
    3300,
    400,
    630,
    500,
    100,
    90,
    50,
    760,
    50000,
    5000,
    3000,
    1000
  ],
  [
    "Truck Driver",
    2500,
    750,
    460,
    400,
    80,
    60,
    50,
    570,
    38000,
    4000,
    2000,
    1000
  ]
];

APP.cards = {
  smallDeal: {
    mutual1: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Lower interest rates drive market and fund to strong showing.",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 30,
      range: "$10 to $30",
      dividend: false
    },
    mutual2: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Brilliant young fund manager. Everyone believes he has the Midas touch",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 20,
      range: "$10 to $30",
      dividend: false
    },
    mutual3: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Weak earnings by most companies lead to weak price of mutual fund",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 10,
      range: "$10 to $30",
      dividend: false
    },
    mutual4: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Lower interest rates drive market and fund to strong showing.",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 5,
      range: "$10 to $30",
      dividend: false
    },
    mutual5: {
      type: "Mutual Fund",
      name: "GRO4US Fund",
      description:
        "Powerhouse market drives strong fund's price up to record high",
      rule:
        "Only you may buy as many units as you want at this price. Everyone may sell at this price",
      symbol: "GRO4US",
      price: 40,
      range: "$10 to $30",
      dividend: false
    },
    stock1: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Booming market leads to record share price of this home electronics seller!",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 40,
      range: "$5 to $30",
      dividend: false
    },
    stock2: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "High inflation leads to poor share price for this home electronics seller.",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 5,
      range: "$5 to $30",
      dividend: false
    },
    stock3: {
      type: "Stock",
      name: "MYT4U Electronics Co.",
      description:
        "Record interest rates lead to substandard share price for this home electronics seller",
      rule:
        "Only you may buy as many shares as you want at this price. Everyone may sell at this price.",
      symbol: "MYT4U",
      price: 5,
      range: "$5 to $30",
      dividend: false
    },
    realEstate1: {
      type: "Real Estate",
      name: "You Find a Great Deal!",
      description:
        "Older 3/2 house, repossessed by government agency. Ready to go with government financing and a tenant.",
      rule:
        "Borrow from the Bank if you must, but... BUY THIS! 132% ROI, may sell for $65,000 to $135,000.",
      cost: 35000,
      downPayment: 2000,
      mortgage: 33000,
      cashFlow: 220
    },
  },
  bigDeal: [],
  offer: [],
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
    doodad6: {
      name: "Buy Big Screen TV",
      cost: 4000,
      text: "Pay $4000",
      loan: 4000,
      payment: 120
    },
    doodad7: {
      name: "Your Anniversary!",
      cost: 200,
      text: "Spend 200"
    },
    doodad8: {
      name: "Son's College Tuition",
      cost: 1500,
      text: "Pay $1500"
      //if player has child
    },
    doodad9: {
      name: "Buy Toys for Your Kids",
      cost: 50,
      text: "Spend $50"
      //per child
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
      text:
        "Pay $150 \n" +
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
      text:
        "Pay $10 \n" + "\n" + "Buy a Cafe Latte & Cappuccino for You & a Friend"
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
      text:
        "Costs you $200 \n" + "\n Couldn't Resist New Painting By Local Artist"
    },
    doodad30: {
      name: "Your Child Needs Braces",
      cost: 2000,
      text: "Pay $2000"
      //if player has child
    },
    doodad31: {
      name: "Buy New Music CDs",
      cost: 100,
      text: "Take kids to the Amusement Park and spend $100"
      //if player has child
    },
    doodad32: {
      name: "Buy Cappuccino Machine",
      cost: 150,
      text: "Pay $150"
    },
    doodad33: {
      name: "Your Daughter's Wedding",
      cost: 2000,
      text: "Costs you $2000"
      //if player has child
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
      text:
        "Pay $220 for tuition & books \n" +
        "\n" +
        "Go back to school for added skills."
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
    }
  }
};

APP.dreamPhase = {
  dreamPhaseOn: false,
  dreamArrPos: 0,
  openDreamPhase: function() {
    //show dream
    var dream = document.getElementById("dream-text");
    var dreamDescription = document.getElementById("dream-des");
    dream.innerHTML = APP.dreamPhase.dreams[APP.dreamPhase.dreamArrPos];
    dreamDescription.innerHTML =
      APP.dreamPhase.dreamDescriptions[APP.dreamPhase.dreamArrPos];
    //show player job, income and savings

    var jobTextId = document.getElementById("job-text");
    jobTextId.insertAdjacentHTML(
      "afterbegin",
      "<div>You are a<span id='dream-job'></span>.</div><div>Your starting salary is $<span id='dream-starting-salary'></span>.</div><div>You have $<span id='dream-starting-savings'></span> in your savings.</div><div>That means your starting cash is $<span id='dream-starting-cash'></span></div>"
    );

    this.showStartScenario(0);
  },
  showStartScenario: function(player) {
    var player = APP.currentPlayerArrPos();
    var playerJob = APP.players[player].jobTitle[0];
    var vowelRegex = "^[aieouAIEOU].*";
    var matched = playerJob.match(vowelRegex);
    if (matched) {
      //add an n and a space before job title
      var job = "n " + playerJob;
    } else {
      //add space before jobtitle
      var job = " " + playerJob;
    }
    var playerSalary = APP.players[player].jobTitle[1];
    var playerSavings = APP.players[player].jobTitle[2];
    var playerCash = playerSavings;

    document.getElementById("dream-job").innerHTML = job;
    document.getElementById("dream-starting-salary").innerHTML = playerSalary;
    document.getElementById("dream-starting-savings").innerHTML = playerSavings;
    document.getElementById("dream-starting-cash").innerHTML = playerCash;
  },
  leftDream: function() {
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
  rightDream: function() {
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
  dreamChoiceBtn: function() {
    //save dream
    var chosenDream = this.dreams[this.dreamArrPos];
    APP.players[APP.currentPlayerArrPos()].dream = chosenDream;

    //start race phase once last player has dream
    if (APP.currentPlayer == APP.pCount) {
      this.endDreamPhase();
    }
    //show first dream
    var restartDream = document.getElementById("dream-text");
    restartDream.innerHTML = APP.dreamPhase.dreams[0];

    //show job, savings, starting cash for current player
    this.showStartScenario(APP.currentPlayerArrPos());

    APP.nextTurn();
  },
  endDreamPhase: function() {
    APP.display.hideDreamPhase();
    APP.display.showRacePhase();
    APP.dreamPhase.dreamPhaseOn = false;
    $("#finance-box").show();
  }
};
APP.dreamPhase.dreams = [
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
];
APP.dreamPhase.dreamDescriptions = [
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
];

APP.display = {
  tokens: [
    { ele: "<div id='player1-piece'>1</div>" },
    { ele: "<div id='player2-piece'>2</div>" },
    { ele: "<div id='player3-piece'>3</div>" },
    { ele: "<div id='player4-piece'>4</div>" },
    { ele: "<div id='player5-piece'>5</div>" },
    { ele: "<div id='player6-piece'>6</div>" },
    { ele: "<div id='player7-piece'>7</div>" },
    { ele: "<div id='player8-piece'>8</div>" }
  ],
  renderBoard: function() {
    $("#board").show();
    $("#board-container").show();
    $("#info").show();
    $("#player-list").show();

    APP.display.showPlayerList();
    APP.display.showTurnInfo();
    APP.board.printSquares();
    APP.display.showTokens();
  },
  showTokens: function() {
    for (var i = 0; i < APP.pCount; i++) {
      var token = this.tokens[i].ele;
      var startSpace = document.getElementById("tokenSection0");
      startSpace.insertAdjacentHTML("beforeend", token);
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
  showStockForm: function() {
    //get which form to show
    //show form
    $("#buy-shares-form").show();
    $("#show-stock-form-btn").hide();
    $("#buy-stock-btn").show();
    //clear current asset
  },
  increaseShares: function() {
    var value = parseInt(document.getElementById("share-amt-input").value, 10);
    //var value = parseInt(document.getElementById("share-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value += 1;
    document.getElementById("share-amt-input").value = value;
    //document.getElementById("share-amt-input2").value = value;
  },
  decreaseShares: function() {
    var value = parseInt(document.getElementById("share-amt-input").value, 10);
    //var value = parseInt(document.getElementById("share-amt-input2").value, 10);
    value = isNaN(value) ? 0 : value;
    value -= 1;
    if (value > 1) {
      value -= 1;
    } else {
      value = 1;
    }
    document.getElementById("share-amt-input").value = value;
    //document.getElementById("share-amt-input2").value = value;
  },
  clearBtns: function() {
    $("#repay-borrow-btns").hide();
    $("#small-deal-btn").hide();
    $("#big-deal-btn").hide();
    $("#buy-asset-btn").hide(); //--?
    $("#buy-stock-btn").hide();
    $("#doodad-pay-button").hide();
    $("#ds-pay-button").hide();
    $("#charity-donate-btn").hide();
    $("#pass-btn").hide();
    $("#no-loan-btn").hide();
    //$("#done-btn").hide();
    $("#cancel-btn").hide();
    $("#borrow-loan-btn").hide();
    $("#borrow-doodad-loan-btn").hide();
    $("#borrow-offer-loan-btn").hide();
    $("#confirm-pay-btn").hide();
    $("#done-repay-btn").hide();
    $("#show-stock-form-btn").hide();
    $("#buy-real-estate-btn").hide();
  },
  clearCards: function() {
    $("#opp-card").hide();
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
    $("#deal-card-real-estate").hide();
    $("#deal-card-stock").hide();
    $("#buy-shares-form").hide();
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
  highlightLiabilities: function(option) {
    var player = APP.players[APP.currentPlayerArrPos()];
    var table = document.getElementById("liability-table");
    var rows = table.getElementsByTagName("tr");

    for (var i = 1; i < rows.length; i++) {
      var currentRow = table.rows[i];

      if (option === 1) {
        currentRow.style.backgroundColor = "#FFEB3B";

        var addOnClick = function(row) {
          var anchor = rows[i];
          var cell = row.getElementsByTagName("td")[1];
          var id = cell.getAttribute("id");

          anchor.onclick = function() {
            player.loanId = id;

            if (id === "liability-loans") {
              $("#repay-loan-card").show();
              $("#cancel-btn").show();

              $("#done-repay-btn").hide();
              $("#repay-card").hide();
            } else {
              $("#repay-loan-card").hide();
              $("#confirm-pay-btn").show();
              $("#cancel-btn").show();
              $("#pay-confirm-card").show();

              $("#done-repay-btn").hide();
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
    APP.finance.statement(APP.currentPlayerArrPos());
  }
};

APP.board = {
  square: [
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["CHARITY", "gold"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"],
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["CHILD", "#00bd92"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"],
    ["OPPURTUNITY", "#21940f"],
    ["LIABILITY", "#cc1f00"],
    ["OPPURTUNITY", "#21940f"],
    ["DOWNSIZE", "teal"],
    ["OPPURTUNITY", "#21940f"],
    ["PAYCHECK", "#e3ce00"],
    ["OPPURTUNITY", "#21940f"],
    ["OFFER", "#0082e3"]
  ],
  printSquares: function() {
    document.getElementById("cell0").innerHTML =
      "<div id='tokenSection0'><div class ='cellx'><p>" +
      APP.board.square[0][0] +
      " </p></div>";
    document.getElementById("cell1").innerHTML =
      "<div id='tokenSection1'><div class ='cellx'><p>" +
      APP.board.square[1][0] +
      " </p></div>";
    document.getElementById("cell2").innerHTML =
      "<div id='tokenSection2'><div class ='cellx'><p>" +
      APP.board.square[2][0] +
      " </p></div>";
    document.getElementById("cell3").innerHTML =
      "<div id='tokenSection3'><div class ='cellx'><p>" +
      APP.board.square[3][0] +
      " </p></div>";
    document.getElementById("cell4").innerHTML =
      "<div id='tokenSection4'><div class ='cellx'><p>" +
      APP.board.square[4][0] +
      " </p></div>";
    document.getElementById("cell5").innerHTML =
      "<div id='tokenSection5'><div class ='cellx'><p>" +
      APP.board.square[5][0] +
      " </p></div>";
    document.getElementById("cell6").innerHTML =
      "<div id='tokenSection6'><div class ='cellx'><p>" +
      APP.board.square[6][0] +
      " </p></div>";
    document.getElementById("cell7").innerHTML =
      "<div id='tokenSection7'><div class ='cellx'><p>" +
      APP.board.square[7][0] +
      " </p></div>";
    document.getElementById("cell8").innerHTML =
      "<div id='tokenSection8'><div class ='cellx'><p>" +
      APP.board.square[8][0] +
      " </p></div>";
    document.getElementById("cell9").innerHTML =
      "<div id='tokenSection9'><div class ='cellx'><p>" +
      APP.board.square[9][0] +
      " </p></div>";
    document.getElementById("cell10").innerHTML =
      "<div id='tokenSection10'><div class ='cellx'><p>" +
      APP.board.square[10][0] +
      " </p></div>";
    document.getElementById("cell11").innerHTML =
      "<div id='tokenSection11'><div class ='cellx'><p>" +
      APP.board.square[11][0] +
      " </p></div>";
    document.getElementById("cell12").innerHTML =
      "<div id='tokenSection12'></div><div class ='cellx'><p>" +
      APP.board.square[12][0] +
      " </p></div>";
    document.getElementById("cell13").innerHTML =
      "<div id='tokenSection13'><div class ='cellx'><p>" +
      APP.board.square[13][0] +
      " </p></div>";
    document.getElementById("cell14").innerHTML =
      "<div id='tokenSection14'><div class ='cellx'><p>" +
      APP.board.square[14][0] +
      " </p></div>";
    document.getElementById("cell15").innerHTML =
      "<div id='tokenSection15'><div class ='cellx'><p>" +
      APP.board.square[15][0] +
      " </p></div>";
    document.getElementById("cell16").innerHTML =
      "<div id='tokenSection16'><div class ='cellx'><p>" +
      APP.board.square[16][0] +
      " </p></div>";
    document.getElementById("cell17").innerHTML =
      "<div id='tokenSection17'><div class ='cellx'><p>" +
      APP.board.square[17][0] +
      " </p></div>";
    document.getElementById("cell18").innerHTML =
      "<div id='tokenSection18'><div class ='cellx'><p>" +
      APP.board.square[18][0] +
      " </p></div>";
    document.getElementById("cell19").innerHTML =
      "<div id='tokenSection19'><div class ='cellx'><p>" +
      APP.board.square[19][0] +
      " </p></div>";
    document.getElementById("cell20").innerHTML =
      "<div id='tokenSection20'><div class ='cellx'><p>" +
      APP.board.square[20][0] +
      " </p></div>";
    document.getElementById("cell21").innerHTML =
      "<div id='tokenSection21'><div class ='cellx'><p>" +
      APP.board.square[21][0] +
      " </p></div>";
    document.getElementById("cell22").innerHTML =
      "<div id='tokenSection22'><div class ='cellx'><p>" +
      APP.board.square[22][0] +
      " </p></div>";
    document.getElementById("cell23").innerHTML =
      "<div id='tokenSection23'><div class ='cellx'><p>" +
      APP.board.square[23][0] +
      " </p></div>";
  }
};

$(document).ready(function() {
  APP.initGame();
});

APP.test = function() {
  //--loads in finance statement function
  document.getElementById("small-opp-test1").innerHTML = APP.currentDeal.name;
  document.getElementById("small-opp-test2").innerHTML =
    APP.currentDeal.shares;
};
