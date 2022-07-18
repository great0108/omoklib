(function() {
    "use strict"
    const {Occupied, InvalidPosition, Forbid33, Forbid44, Forbid6, Forbid, BlackWins, WhiteWins, PutComplete, Undo} = require("./ActionClass");
    const EMPTYSTONE = 0;
    const BLACKSTONE = 1;
    const WHITESTONE = 2;
    const BOARDSIZE = 15;
    const CODE = "ABCDEFGHIJKLMNOP";
    const DIRECTION = [[1, 0], [0, 1], [1, 1], [1, -1]]
    const RULE = {
        "renju" : {"sixWin" : [false,true], "allow6" : [false,true], "allow44" : [false,true], "allow33" : [false,true]},
        "normal" : {"sixWin" : [false,false], "allow6" : [true,true], "allow44" : [true,true], "allow33" : [false,false]},
        "gomoku" : {"sixWin" : [true,true], "allow6" : [true,true], "allow44" : [true,true], "allow33" : [true,true]}
    }

    function Omok() {
        this.turn = 1;
        this.board = Array(BOARDSIZE).fill().map(v => Array(BOARDSIZE).fill(0));
        this.boardStack = [];
        this.rule = RULE["renju"]
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
     * @return {boolean}
     */
    Omok.prototype.isSetStone = function(x, y) {
        return x >= 0 && y >= 0 && x < BOARDSIZE && y < BOARDSIZE
    }
    /**
     * 33이나 44를 확인해야 하는지 검사
     * @param {number} x
     * @param {number} y
     * @param {1,2} stone
     * @param {3,4} num
     * @return {boolean}
     */
    Omok.prototype.isCheckDouble = function(x, y, stone, num) {
        if(!this.isSetStone(x, y) || this.board[x][y] !== EMPTYSTONE) {
            return false
        } else if(this.isFive(x, y, stone) || this.isOverLine(x, y, stone)) {
            return false
        } else if(this.rule["allow" + String(num).repeat(2)][stone-1]) {
            return false
        }
        return true
    }
    /**
     * 33 인지 검사
     * @param {number} x
     * @param {number} y
     * @param {1,2} stone
     * @return {boolean}
     */
    Omok.prototype.isDoubleThree = function(x, y, stone) {
        if(!this.isCheckDouble(x, y, stone, 3)) {
            return false
        }
        let countThree = 0
        for(let i = 0; i <= 3; i++) {
            countThree += Number(this.isOpenThreeOrFour(x, y, stone, i, 3))
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
        if(!this.isCheckDouble(x, y, stone, 4)) {
            return false
        }
        let countFour = 0;
        for(let i = 0; i <= 3; i++){
            if(this.isOpenFour(x, y, stone, i) === 2){
                countFour += 2;
            }
            countFour += Number(this.isOpenThreeOrFour(x, y, stone, i, 4))
        }
        return countFour >= 2;
    }
    /**
     * 특정 방향으로 움직인 좌표 계산
     * @param {number[]} cord
     * @param {-1,1} sign
     * @param {0,1,2,3} dir
     * @return {number[]} 움직인 좌표
     */
    Omok.prototype.nextCord = function(cord, sign, dir) {
        return [cord[0] + DIRECTION[dir][0] * sign, cord[1] + DIRECTION[dir][1] * sign]
    }
    /**
     * 열린 3인지 또는 4인지 검사 (4는 닫힌거든 열린거든 상관 무, 열린 3 정의는 꺼무위키 참고)
     * @param {number} x
     * @param {number} y
     * @param {1,2} stone
     * @param {0,1,2,3} dir
     * @param {3,4} num
     * @return {boolean}
     */
    Omok.prototype.isOpenThreeOrFour = function(x, y, stone, dir, num) {
        this.board[x][y] = stone
        for(let sign = -1; sign < 2; sign += 2) {
            let cord = this.nextCord([x, y], sign, dir)
            while(this.isSetStone(cord[0], cord[1])) {
                if(this.board[cord[0]][cord[1]] === stone) {
                    cord = this.nextCord(cord, sign, dir)
                } else if(this.board[cord[0]][cord[1]] === EMPTYSTONE) {
                    if(num === 3 ? this.checkFakeThree(cord[0], cord[1], stone, dir) : this.isFive(cord[0], cord[1], stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return true
                    }
                    break
                } else {
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
     * @param {0,1,2,3} dir
     * @return {boolean}
     */
    Omok.prototype.checkFakeThree = function(x, y, stone, dir) {
        return (this.isOpenFour(x, y, stone, dir) === 1) && !this.isDoubleFour(x, y, stone) && !this.isDoubleThree(x, y, stone);
    }
    /**
     * 열린 4 검사, 2일 때 44임  (O,X,O,ㅁ,X,O ㅁ 자리를 검사하기 위해서)  1인 경우는 열린 3을 검사하기 위해 사용
     * @param {number} x
     * @param {number} y
     * @param {1,2} stone
     * @param {0,1,2,3} dir
     * @return {0,1,2}
     */
    Omok.prototype.isOpenFour = function(x, y, stone, dir) {
        this.board[x][y] = stone
        let nLine = 1
        for(let sign = -1; sign < 2; sign += 2) {
            let cord = this.nextCord([x, y], sign, dir)
            while(this.isSetStone(cord[0], cord[1])) {
                if(this.board[cord[0]][cord[1]] === stone) {
                    cord = this.nextCord(cord, sign, dir)
                    nLine++
                } else if(this.board[cord[0]][cord[1]] === EMPTYSTONE) {
                    if(sign === -1 && !this.isFive(cord[0], cord[1], stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return 0
                    } else if(sign === 1 && this.isFive(cord[0], cord[1], stone, dir)) {
                        this.board[x][y] = EMPTYSTONE
                        return nLine === 4 ? 1 : 2
                    } 
                    break
                } else {
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
        if(!this.isSetStone(x, y) || this.board[x][y] !== EMPTYSTONE) {
            return 0
        }
        this.board[x][y] = stone
        for(dir of dirs) {
            let nLine = 1
            for(let sign = -1; sign < 2; sign += 2) {
                let cord = this.nextCord([x, y], sign, dir)
                while(this.isSetStone(cord[0], cord[1])) {
                    if(this.board[cord[0]][cord[1]] === stone) {
                        cord = this.nextCord(cord, sign, dir)
                        nLine++
                    } else {
                        break
                    }
                }
            }

            let checkFive = this.checkIsFive(stone, nLine)
            if(checkFive === 1) {
                this.board[x][y] = EMPTYSTONE
                return 1
            } else if(checkFive === 2) {
                isOverLine = true
            }
        }
        this.board[x][y] = EMPTYSTONE
        return isOverLine ? 2 : 0
    }
    /**
     * 장목인지 오목인지 검사
     * @param {1,2} stone
     * @param {number} nLine  연결된 개수
     * @return {0,1,2}  0 아무것도 아님 1 오목 2 장목(육목 이상)
     */
    Omok.prototype.checkIsFive = function(stone, nLine) {
        if(nLine < 5) {
            return 0
        } else if(nLine === 5 || this.rule.sixWin[stone-1]) {
            return 1
        }
        return 2
    }
    /**
     * 현재 오목판 이미지를 가져옵니다
     * showForbid가 true라면 금수까지 표시해줍니다
     * @param {boolean} showForbid
     * @return {string}
     */
    Omok.prototype.getImage = function(showForbid){
        return "https://saroro.dev/omok/image/" + this.board.map((v, i) => v.map((stone, j) => {
            if(stone === BLACKSTONE) {
                return "b"
            } else if(stone == WHITESTONE) {
                return "w"
            } else if(showForbid && !this.isWin) {
                if(this.isDoubleFour(i, j, stone)) {
                    return "4"
                } else if(this.isDoubleThree(i, j, stone)) {
                    return "3"
                } else if(this.isOverLine(i, j, stone)) {
                    return "6"
                }
            }
            return "_"
        }).join("")).join("")
    }
    Omok.prototype.changeCordToXY = function(cord) {
        cord = cord.toUpperCase();
        if(!cord.match(/^[A-Z]\d{1,2}$/)){
            return false
        }
        const y = CODE.indexOf(cord[0]);
        const x = +cord.slice(1)-1;
        return [y,x];
    }
    /**
     * 위치(y, x)로 돌 놓기
     * @param {number} x
     * @param {number} y
     * @return {Forbid6|PutComplete|BlackWins|WhiteWins|Forbid33|InvalidPosition|Occupied|Forbid44}
     */
    Omok.prototype.putStone = function(x, y) {
        let currentStone = this.isBlackTurn ? BLACKSTONE : WHITESTONE
        if(!this.isSetStone(x, y)) {
            return new InvalidPosition()
        } else if(this.board[x][y] !== EMPTYSTONE) {
            return new Occupied()
        } else if(this.isDoubleThree(x, y, currentStone)) {
            return new Forbid33(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
        } else if(this.isDoubleFour(x, y, currentStone)) {
            return new Forbid44(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
        } else if(this.isOverLine(x, y, currentStone)) {
            return new Forbid6(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
        }
        let isWin = this.isFive(x, y, currentStone)
        this.board[x][y] = currentStone
        this.boardStack.push(CODE[x] + (y+1))
        if(isWin && currentStone === BLACKSTONE) {
            return new BlackWins(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
        } else if(isWin && currentStone === WHITESTONE) {
            return new WhiteWins(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
        }
        this.turn += 1
        this.isBlackTurn = !this.isBlackTurn
        return new PutComplete(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName)
    }
    /**
     * 룰을 설정합니다
     * 커스텀의 경우 반드시 sixWin, allow6, allow44 allow33이 포함되어야 합니다
     * @param {string|object} rules
     */
    Omok.prototype.setRule = function(rules) {
        if(this.turn !== 1) {
            throw new Error("After first move, you can't change the rule");
        } else if(typeof rules === "string") {
            if(RULE.hasOwnProperty(rules)) {
                this.rule = RULE[rules]
                this.ruleName = rules
            } else {
                throw new Error("No such rule exists")
            }
        } else {
            if(!rules.hasOwnProperty("sixWin")){
                throw new Error("Rule must include sixWin")
            } else if(!rules.hasOwnProperty("allow6")){
                throw new Error("Rule must include allow6")
            } else if(!rules.hasOwnProperty("allow44")){
                throw new Error("Rule must include allow44")
            } else if(!rules.hasOwnProperty("allow33")){
                throw new Error("Rule must include allow33")
            }
            rule = rules;
            this.ruleName = "custom"
        }
    }
    /**
     * 되돌리기
     * @return {Undo}
     */
    Omok.prototype.undo = function() {
        if(this.boardStack.length === 0){
            return new Undo(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName, null);
        }
        const last = this.boardStack.pop();
        const cord = this.changeCordToXY(last)
        this.board[cord[0]][cord[1]] = EMPTYSTONE
        if(this.isWin){
            this.isWin = false;
        } else{
            this.turn -= 1
            this.isBlackTurn = !this.isBlackTurn;
        }
        return new Undo(this.turn, this.isBlackTurn, this.boardStack, this.rule, this.ruleName, last);
    }

    function Omok2() {
        let omok = new Omok()
        return {
            /**
             * 현재 보드판 상태를 가져옵니다
             * @return {*[]}
             */
            "getBoard" : () => omok.board.map(v => v.slice(0)),

            /**
             * 룰을 설정합니다
             * 커스텀의 경우 반드시 sixWin, allow6, allow44, allow33이 포함되어야 합니다
             * @param {string|object} rules
             */
            "setRule" : (rule) => omok.setRule(rule),
            
            /**
             * 돌을 배치합니다
             * @param {string} cord
             * @return {InvalidPosition|Occupied|Forbid33|Forbid44|Forbid6|BlackWins|WhiteWins|PutComplete}
             */
            "putStone" : (cord) => {
                const res = omok.changeCordToXY(cord)
                return res ? omok.putStone(res[0], res[1]) : new InvalidPosition()
            },
            /**
             * 해당 장소가 오목이 되는지 검사합니다
             * @param {string} cord
             * @return {boolean|InvalidPosition}
             */
            "isFive" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isFive(res[0], res[1], omok.isBlackTurn ? BLACKSTONE : WHITESTONE) : new InvalidPosition()
            },
            /**
             * 해당 장소가 장목(육목)이 되는지 검사합니다
             * @param {string} cord
             * @return {boolean|InvalidPosition}
             */
            "isOverLine" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isOverLine(res[0], res[1], omok.isBlackTurn ? BLACKSTONE : WHITESTONE) : new InvalidPosition()
            },
            /**
             * 해당 장소가 44가 되는지 확인합니다
             * @param {string} cord
             * @return {boolean|InvalidPosition}
             */
            "isDoubleFour" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isDoubleFour(res[0], res[1], omok.isBlackTurn ? BLACKSTONE : WHITESTONE) : new InvalidPosition()
            },
            /**
             * 해당 장소가 33이 되는지 확인합니다
             * @param {string} cord
             * @return {boolean|InvalidPosition}
             */
            "isDoubleThree" : (cord) => {
                const res = omok.changeCordToXY(cord);
                return res ? omok.isDoubleThree(res[0], res[1], omok.isBlackTurn ? BLACKSTONE : WHITESTONE) : new InvalidPosition()
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
             * @param {boolean} showForbid
             * @return {string}
            */
            "getImageWithMove" : (showForbid) => omok.getImage(showForbid) + "/" + omok.boardStack.join(","),

            /**
             * 현재 오목 기보를 확인합니다
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
             * 착수가 몇번째인지 구합니다
             * @return {number}
             */
            "getPeriod" : () => omok.turn
        }
    }
    module.exports = {
        Omok : Omok2
    }
})()