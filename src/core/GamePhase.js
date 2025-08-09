class GamePhase {
    constructor(game) {
        this.game = game;
        this.currentPhase = 'dream';
        this.dreamPhaseActive = true;
        this.dreams = [
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
        this.dreamDescriptions = [
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
    }

    startDreamPhase() {
        this.currentPhase = 'dream';
        this.dreamPhaseActive = true;
    }

    endDreamPhase() {
        this.dreamPhaseActive = false;
        this.currentPhase = 'ratRace';
    }

    startFastTrack() {
        this.currentPhase = 'fastTrack';
        const player = this.game.players[this.game.currentPlayerIndex];
        player.fastTrack = true;
        player.cashFlowDay = player.passiveIncome * 100;
    }

    getCurrentDream() {
        return {
            title: this.dreams[this.game.currentPlayerIndex],
            description: this.dreamDescriptions[this.game.currentPlayerIndex]
        };
    }

    selectDream(dreamIndex) {
        const player = this.game.players[this.game.currentPlayerIndex];
        player.dream = this.dreams[dreamIndex];
        
        if (this.game.currentPlayer === this.game.playerCount) {
            this.endDreamPhase();
        }
    }

    isFastTrackEligible(player) {
        return player.passiveIncome >= player.totalExpenses;
    }
}

export default GamePhase; 