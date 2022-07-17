(function(){
    "use strict"
    function PutComplete(period, currentTurn, boardStack, rule, ruleName){
        this.status = "ok";
        this.code = 0;
        this.period = period;
        this.currentTurn = currentTurn ? "b" : "w";
        this.boardStack = boardStack;
        this.rule ={
            "ruleName" : ruleName,
            "rule" : rule
        }
    }

    function BlackWins(period, currentTurn, boardStack, rule, ruleName){
        PutComplete.call(this, period, currentTurn, boardStack, rule, ruleName)
        this.status = "bWins";
        this.code = 5;
    }

    function WhiteWins(period, currentTurn, boardStack, rule, ruleName){
        PutComplete.call(this, period, currentTurn, boardStack, rule, ruleName)
        this.status = "wWins"
        this.code = 5;
    }

    function Forbid(period, currentTurn, boardStack, rule, ruleName){
        this.status = "error";
        this.code = 0;
        this.reason = "";
        this.period = period;
        this.currentTurn = currentTurn ? "b" : "w";
        this.boardStack = boardStack;
        this.rule = {
            "ruleName" : ruleName,
            "rule" : rule
        }

    }

    function Forbid33(){
        Forbid.call(this, period, currentTurn, boardStack, rule, ruleName)
        this.code = 3;
        this.reason = "33";
    }

    function Forbid44(){
        Forbid.call(this, period, currentTurn, boardStack, rule, ruleName)
        this.code = 4;
        this.reason = "44";
    }

    function Forbid6(){
        Forbid.call(this, period, currentTurn, boardStack, rule, ruleName)
        this.code = 6;
        this.reason = "6";
    }

    function InvalidPosition(){
        this.status = "error";
        this.code = -2
        this.reason = "Coordinate is not valid"
    }

    function Occupied(){
        this.status = "error";
        this.code = -3
        this.reason = "Stone is already existed"
    }

    function Undo(){
        this.status = "UNDO";
        this.code = -1;
        this.currentTurn = "";
        this.boardStack = [];
        this.period = 0;
        this.rule = {
            "ruleName" : "",
            "rule" : {},
        }
        this.removePos = "";
    }

    module.exports = {
        PutComplete: PutComplete,
        BlackWins : BlackWins,
        WhiteWins : WhiteWins,
        Forbid : Forbid,
        Forbid33 : Forbid33,
        Forbid44: Forbid44,
        Forbid6 : Forbid6,
        InvalidPosition : InvalidPosition,
        Occupied : Occupied,
        Undo : Undo
    }
})();