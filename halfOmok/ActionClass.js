(function(){
    "use strict"
    function PutComplete(){
        this.status = "ok";
        this.code = 0;
        this.period = 0;
        this.currentTurn = 0;
        this.boardStack = [];
        this.rule ={
            "ruleName" : "",
            "rule" : {}
        }
    }

    function BlackWins(){
        PutComplete.call(this)
        this.status = "bWins";
        this.code = 5;
    }

    function WhiteWins(){
        PutComplete.call(this)
        this.status = "wWins"
        this.code = 5;
    }

    function Forbid(){
        this.status = "error";
        this.code = 0;
        this.reason = "";
        this.period = 0;
        this.currentTurn = "";
        this.boardStack = [];
        this.rule ={
            "ruleName" : "",
            "rule" : {}
        }

    }

    function Forbid33(){
        Forbid.call(this)
        this.code = 3;
        this.reason = "33";
    }

    function Forbid44(){
        Forbid.call(this)
        this.code = 4;
        this.reason = "44";
    }

    function Forbid6(){
        Forbid.call(this)
        this.code = 6;
        this.reason = "6";
    }

    function PutError(){
        this.status = "error";
        this.code = 0;
        this.reason = "";
    }

    function InvalidPosition(){
        PutError.call(this)
        this.code = -2
        this.reason = "Coordinate is not valid"
    }

    function Occupied(){
        PutError.call(this)
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
        PutError : PutError,
        InvalidPosition : InvalidPosition,
        Occupied : Occupied,
        Undo : Undo
    }
})();