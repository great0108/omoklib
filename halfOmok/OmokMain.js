(function() {
    "use strict"
    const {Occupied, InvalidPosition, PutError, Forbid33, Forbid44, Forbid6, Forbid, BlackWins, WhiteWins, PutComplete, Undo} = require("./ActionClass");
    const EMPTYSTONE = 0;
    const BLACKSTONE = 1;
    const WHITESTONE = 2;
    const BOARDSIZE = 15;
    const CODE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const DIRECTION = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1]
    ]

    function Omok() {
        this.turn = 1;
        this.board = Array(BOARDSIZE).fill().map(v => Array(BOARDSIZE).fill(0));
        this.boardStack = [];
        this.forbidZone = [];
        this.rule = {
            "sixWin" : [false,true],
            "allow6" : [false,true],
            "allow44" : [false,true],
            "allow33" : [false,true]
        }
        this.ruleName = "renju";
        this.isBlackTurn = true;
        this.isWin = false
    }

    /**
    * 보드 초기화 할때 사용
    * @return void
    */
    Omok.prototype.reset = function() {
        this.turn = 1
        this.board = Array(BOARDSIZE).fill().map(v => Array(BOARDSIZE).fill(0));
        this.boardStack = []
        this.isBlackTurn = true
        this.isWin = false
    }

    /**
    * 착수 할 수 있는 위치인지 확인
    * @param {number} x
    * @param {number} y
    */
    Omok.prototype.isSetStone = function(x, y) {
        return x >= 0 && y >= 0 && x < BOARDSIZE && y < BOARDSIZE
    }

    /**
    * 비어있는지 확인
    * @param {number} x
    * @param {number} y
    */
    Omok.prototype.isEmpty = function(x, y) {
        return this.isSetStone(x, y) && this.board[x][y] === EMPTYSTONE
    }

    /**
    * 33 인지 검사
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @return {boolean}
    */
    Omok.prototype.isDoubleThree = function(x, y, stone) {
        if(!this.isEmpty(x, y)) {
            return false
        }
        else if(this.isFive(x, y, stone)) {
            return false
        }
        else if(this.isOverLine(x, y, stone)) {
            return false
        }
        else if(this.rule.allow33[stone-1]) {
            return false
        }

        let countThree = 0
        for(let i = 0; i <= 3; i++) {
            if(this.isOpenThree(x, y, stone, i)) {
                countThree += 1
            }
        }
        return countThree >= 2
    }

    /**
    * 44 인지 검사
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @return {boolean}
    */
    Omok.prototype.isDoubleFour = function(x, y, stone) {
        if(!this.isEmpty(x, y)) {
            return false
        }
        else if(this.isFive(x, y, stone)) {
            return false
        }
        else if(this.isOverLine(x, y, stone)) {
            return false
        }
        else if(this.rule.allow44[stone-1]) {
            return false
        }

        let countFour = 0;
        for(let i = 0; i <= 3; i++){
            if(this.isOpenFour(x, y, stone, i) === 2){
                countFour += 2;
            }
            else if(this.isFour(x, y, stone, i)){
                countFour += 1;
            }
        }
        return countFour >= 2;
    }

    /**
    * 열린 3인지 검사 열린 3 정의는 꺼무위키 참고
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {1,2,3,4} dir
    * @return {boolean}
    */
    Omok.prototype.isOpenThree = function(x, y, stone, dir) {
        this.board[x][y] = stone
        let step = DIRECTION[dir]
        for(let sign = -1; sign < 2; sign += 2) {
            let i = x + step[0] * sign
            let j = y + step[1] * sign
            while(this.isSetStone(i, j)) {
                if(this.board[i][j] === stone) {
                    i += step[0] * sign
                    j += step[1] * sign
                }
                else if(this.board[i][j] === EMPTYSTONE) {
                    if(this.checkFakeThree(i, j, stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return true
                    } 
                    else {
                        break
                    }
                }
                else {
                    break
                }
            }
        }
        this.board[x][y] = EMPTYSTONE
        return false
    }

    /**
    * 거짓금수 체크용
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {1,2,3,4} dir
    * @return {boolean}
    */
    Omok.prototype.checkFakeThree = function(x, y, stone, dir) {
        if(this.isOpenFour(x, y, stone, dir) !== 1) {
            return false
        }
        else if(this.isDoubleFour(x, y, stone)) {
            return false
        }
        else if(this.isDoubleThree(x, y, stone)) {
            return false
        }
        return true
    }

    /**
    * 4인지 검사 (닫힌거든 열린거든 상관 무)
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {1,2,3,4} dir
    * @return {boolean}
    */
    Omok.prototype.isFour = function(x, y, stone, dir) {
        this.board[x][y] = stone
        let step = DIRECTION[dir]
        for(let sign = -1; sign < 2; sign += 2) {
            let i = x + step[0] * sign
            let j = y + step[1] * sign
            while(this.isSetStone(i, j)) {
                if(this.board[i][j] === stone) {
                    i += step[0] * sign
                    j += step[1] * sign
                }
                else if(this.board[i][j] === EMPTYSTONE) {
                    if(this.isFive(i, j, stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return true
                    } 
                    else {
                        break
                    }
                }
                else {
                    break
                }
            }
        }
        this.board[x][y] = EMPTYSTONE
        return false
    }

    /**
    *열린 4 검사, 2일 때 44임  (O,X,O,ㅁ,X,O ㅁ 자리를 검사하기 위해서)  1인 경우는 열린 3을 검사하기 위해 사용
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {1,2,3,4} dir
    * @return {0,1,2}
    */
    Omok.prototype.isOpenFour = function(x, y, stone, dir) {
        this.board[x][y] = stone
        let nLine = 1
        let step = DIRECTION[dir]
        for(let sign = -1; sign < 2; sign += 2) {
            let i = x + step[0] * sign
            let j = y + step[1] * sign
            while(this.isSetStone(i, j)) {
                if(this.board[i][j] === stone) {
                    i += step[0] * sign
                    j += step[1] * sign
                    nLine++
                }
                else if(this.board[i][j] === EMPTYSTONE) {
                    if(sign === -1 && !this.isFive(i, j, stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return 0
                    }
                    else if(sign === 1 && this.isFive(i, j, stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return nLine === 4 ? 1 : 2
                    } 
                    else {
                        break
                    }
                }
                else {
                    this.board[x][y] = EMPTYSTONE
                    return 0
                }
            }
        }
        this.board[x][y] = EMPTYSTONE
        return 0
    }

    /**
    * 오목인지 아닌지 검사
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {number} dir
    * @return {boolean}
    */
    Omok.prototype.isFive = function(x, y, stone, dir) {
        return this.checkFiveOrOverLine(x, y, stone, dir) === 1
    }

    /**
    * 장목인지 아닌지 검사
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {number} dir
    * @return {boolean}
    */
    Omok.prototype.isOverLine = function(x, y, stone, dir) {
        return this.checkFiveOrOverLine(x, y, stone, dir) === 2
    }

    /**
    * 오목 장목 여부 검사
    * @param {number} x
    * @param {number} y
    * @param {1,2} stone
    * @param {number} dir
    * @return {0,1,2}
    */
    Omok.prototype.checkFiveOrOverLine = function(x, y, stone, dir) {
        let dirs = dir === undefined ? [0, 1, 2, 3] : [dir]
        let isOverLine = false
        if(!this.isEmpty(x, y)) {
            return 0
        }
        this.board[x][y] = stone
        for(dir of dirs) {
            let nLine = 1
            let step = DIRECTION[dir]
            for(let sign = -1; sign < 2; sign += 2) {
                let i = x + step[0] * sign
                let j = y + step[1] * sign
                while(this.isSetStone(i, j)) {
                    if(this.board[i][j] === stone) {
                        i += step[0] * sign
                        j += step[1] * sign
                        nLine++
                    }
                    else {
                        break
                    }
                }
            }

            let checkFive = this.checkIsFive(stone, nLine)
            if(checkFive === 1) {
                this.board[x][y] = EMPTYSTONE
                return 1
            }
            else if(checkFive === 2) {
                isOverLine = true
            }
        }
        this.board[x][y] = EMPTYSTONE
        return isOverLine ? 2 : 0
    }

    /**
    *장목인지 오목인지 검사
    * @param {1,2} stone
    * @param {number} nLine  연결된 개수
    * @return {0,1,2}  0아무것도 아님 1 오목 2 장목(육목 이상)
    */
    Omok.prototype.checkIsFive = function(stone, nLine) {
        if(nLine < 5) {
            return 0
        }
        else if(nLine === 5 || this.rule.sixWin[stone-1]) {
            return 1
        }
        else {
            return 2
        }
    }

    Omok.prototype.getImage = function(showForbid){
        if(this.isWin) {
            showForbid = false
        }
        let url = "https://saroro.dev/omok/image/";
        for(let j = 0; j<BOARDSIZE; j++){
            for(let i = 0; i<BOARDSIZE; i++){
                if(this.board[i][j] ===BLACKSTONE){
                    url +="b";
                    continue;
                }
                else if(this.board[i][j] ===WHITESTONE){
                    url += "w";
                    continue;
                }

                if(showForbid){
                    const currentStone = this.isBlackTurn ? BLACKSTONE : WHITESTONE;
                    if(this.isDoubleFour(i,j, currentStone)){
                        url += "4"
                    }
                    else if(this.isDoubleThree(i,j,currentStone)){
                        url += "3"
                    }
                    else if(this.isOverLine(i,j,currentStone)){
                        url += "6"
                    }
                    else{
                        url += "_";
                    }
                }
                else{
                    url += "_";
                }
            }
        }
        return url;
    }

    Omok.prototype.changeCordtoXY = function(cord) {
        cord = cord.toUpperCase();
        if(!cord.match(/^[A-Z]\d{1,2}$/)){
            return false
        }
        const y = CODE.indexOf(cord[0]);
        const x = +cord.slice(1)-1;
        return [y,x];
    }

    Omok.prototype.setError = function(err) {
        err.period = this.turn;
        err.currentTurn = this.isBlackTurn ? "b" : "w"
        err.boardStack = this.boardStack;
        err.rule.rule = this.rule;
        err.rule.ruleName = this.ruleName;
        return err;
    }

    Omok.prototype.setMove = function(move) {
        move.period = this.turn;
        move.currentTurn = this.isBlackTurn ? "b" : "w"
        move.boardStack = this.boardStack;
        move.rule.rule = this.rule;
        move.rule.ruleName = this.ruleName;
        return move;
    }

    /**
    * 위치(y, x)로 돌 놓기
    * @param {number}x
    * @param {number}y
    * @return {Forbid6|PutComplete|BlackWins|WhiteWins|Forbid33|InvalidPosition|Occupied|Forbid44}
    */
    Omok.prototype.putStone = function(x, y) {
        let currentStone = this.isBlackTurn ? BLACKSTONE : WHITESTONE
        if(!this.isSetStone(x, y)) {
            return new InvalidPosition()
        }
        else if(!this.isEmpty(x, y)) {
            return new Occupied()
        }
        else if(this.isDoubleThree(x, y, currentStone)) {
            let error = new Forbid33()
            return this.setError(error)
        }
        else if(this.isDoubleFour(x, y, currentStone)) {
            let error = new Forbid44()
            return this.setError(error)
        }
        else if(this.isOverLine(x, y, currentStone)) {
            let error = new Forbid6()
            return this.setError(error)
        }
        let isWin = this.isFive(x, y, currentStone)
        this.board[x][y] = currentStone
        this.boardStack.push(CODE[x] + (y+1))
        if(isWin) {
            let winMove = currentStone === BLACKSTONE ? new BlackWins() : new WhiteWins();
            return this.setMove(winMove)
        }
        this.turn += 1
        this.isBlackTurn = !this.isBlackTurn
        completeMove = new PutComplete()
        return this.setMove(completeMove)
    }

    Omok.prototype.setRule = function(rules) {
        if(this.turn !== 1) {
            throw new Error("After first move, you can't change the rule");
        }
        if(typeof rules === "string") {
            if(rules === "renju") {
                this.rule = {
                    "sixWin" : [false,true],
                    "allow6" : [false,true],
                    "allow44" : [false,true],
                    "allow33" : [false,true]
                };
                this.ruleName = "renju"
            }
            else if(rules === "normal") {
                this.rule = {
                    "sixWin" : [false,false],
                    "allow6" : [true,true],
                    "allow44" : [true,true],
                    "allow33" : [false,false]
                };
                this.ruleName = "normal"
            }
            else if(rules === "gomoku") {
                this.rule = {
                    "sixWin" : [true,true],
                    "allow6" : [true,true],
                    "allow44" : [true,true],
                    "allow33" : [true,true]
                };
                this.ruleName = "gomoku"
            }
            else {
                throw new Error("No such rule exists")
            }
        }
        else {
            if(!rules.hasOwnProperty("sixWin")){
                throw new Error("Rule must include sixWin")
            }
            if(!rules.hasOwnProperty("allow6")){
                throw new Error("Rule must include allow6")
            }
            if(!rules.hasOwnProperty("allow44")){
                throw new Error("Rule must include allow44")
            }
            if(!rules.hasOwnProperty("allow33")){
                throw new Error("Rule must include allow33")
            }
            rule = rules;
            this.ruleName = "custom"
        }
    }

    Omok.prototype.undo = function() {
        if(this.boardStack.length === 0){
            const undo =  new Undo();
            undo.currentTurn = "b";
            undo.boardStack = [];
            undo.period = this.turn;
            undo.rule.ruleName = this.ruleName;
            undo.rule.rule = this.rule;
            undo.removePos = null;
            return undo;
        }
        else{
            const last = this.boardStack.pop();
            cord = this.changeCordtoXY(last)
            this.board[cord[0]][cord[1]] = EMPTYSTONE
            if(this.isWin){
                this.isWin = false;
            }
            else{
                this.turn -= 1
                this.isBlackTurn = !this.isBlackTurn;
            }
            const undo =  new Undo();
            undo.currentTurn = this.isBlackTurn ? "b" : "w";
            undo.boardStack = this.boardStack;
            undo.period = this.turn;
            undo.rule.ruleName = this.ruleName;
            undo.rule.rule = this.rule;
            undo.removePos = last;
            return undo;
        }
    }
    function Omok2() {
        let omok = new Omok()
        return {
            /**
             * 현재 보드판 상태를 가져옵니다
             * 0비어있음 1 흑 2 백
             * @return {*[]}
             */
            "getBoard" : () => omok.board.map(v => v.slice(0)),

            /**
             * 룰을 설정합니다
             * 커스텀의 경우 반드시 sixWin, allow6, allow44 allow33이 포함되어야 합니다
             * @param rules
             */
            "setRule" : (rule) => omok.setRule(rule),

            /**
             * 돌을 배치합니다
             * @param {string} cord
             * @return {InvalidPosition|Occupied|Forbid33|Forbid44|Forbid6|BlackWins|WhiteWins|PutComplete}
             */
            "putStone" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.putStone(res) : new InvalidPosition()
            },

            /**
             * 해당 장소가 오목이 되는지 검사합니다
             * @param {string} cord
             * @return {boolean}
             */
            "isFive" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isFive(res) : new InvalidPosition()
            },

            /**
             * 해당 장소가 장목(육목)이 되는지 검사합니다
             * @param {string} cord
             * @return {boolean}
             */
            "isOverLine" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isOverLine(res) : new InvalidPosition()
            },

            /**
             * 해당 장소가 44가 되는지 확인합니다
             * @param {string} cord
             * @return {boolean}
             */
            "isDoubleFour" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isDoubleFour(res) : new InvalidPosition()
            },

            /**
             * 해당 장소가 33이 되는지 확인합니다.
             * @param {string} cord
             * @return {boolean}
             */
            "isDoubleThree" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isDoubleThree(res) : new InvalidPosition()
            },

            /**
             * 보드를 초기화합니다
             * @return void
             */
            "reset" : () => omok.reset(),

            /**
             * 되돌리기
             * @return {Undo}
             */
            "undo" : () => omok.undo(),

            /**
             * 현재 오목판 이미지를 가져옵니다
             * showForbid가 true라면 금수까지 표시해줍니다
             * @param {boolean} showForbid
             * @return {string}
             */
            "getImage" : (showForbid) => omok.getImage(showForbid),

            /**
             * 현재 오목판 이미지를 착수 순서까지 표시하여 가져옵니다
             * showForbid가 true라면 금수까지 표시해줍니다
             * @param {boolean}showForbid
             * @return {string}
             */
            "getImageWithMove" : (showForbid) => omok.getImage(showForbid) + "/" + omok.boardStack.join(","),

            /**
             * 현재 오목 기보를 확인합니다.
             * @return {*[]}
             */
            "getHistory" : () => omok.boardStack,

            /**
             * 현재 누구 차례인지 가져옵니다
             * b : 흑 w : 백
             * @return {"b","w"}
             */
            "getTurn" : () => omok.isBlackTurn ? "b" : "w",

            /**
             *착수가 몇번째인지 구합니다.
             * @return {number}
             */
            "getPeriod" : () => omok.turn
        }
    }
    module.exports = {
        Omok : Omok2
    }
})()