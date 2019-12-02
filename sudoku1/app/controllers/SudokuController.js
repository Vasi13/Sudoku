(function (angular) {

    SudokuController.$inject = ['$scope'];
    function SudokuController($scope) {
        //initialize out sudoku puzzle object
        $scope.puzzle = {};
        $scope.puzzle.dimensions = 6;
        $scope.puzzle.board = [$scope.puzzle.dimensions];

        /*
         * clears all cells
         */
        $scope.reset = function () {
            //initialize the gameboard with empty values
            for (var i = 0; i < $scope.puzzle.dimensions; i++) {
                $scope.puzzle.board[i] = [$scope.puzzle.dimensions];
                for (var j = 0; j < $scope.puzzle.dimensions; j++) {
                    $scope.puzzle.board[i][j] = "";
                }
            }
        };

        $scope.reset();

        /*
         * calls the solveBoard function with the number of empty cells as parameter
         */
        $scope.solve = function () {
            var emptyCount = 0;
            replaceNull($scope.puzzle.board);
            for (var i = 0; i < $scope.puzzle.dimensions; ++i) {
                for (var j = 0; j < $scope.puzzle.dimensions; ++j) {
                    if ($scope.puzzle.board[i][j] == "") {
                        emptyCount++;
                    }
                }
            }
            var isValid = solveBoard($scope.puzzle.board, 0, emptyCount);
            if (!isValid) {
                window.alert('Puzzle cant be solved! Remove errors or reset matrix!');
            }
        };

        $scope.generate = function () {
            var i, j, randrows, randcols, boxcoord;
            $scope.reset();
            $scope.solve();
            //select some random rows
            randrows = genRandList(6);

            //delete 3 values from 2  random rows
            for (i = 0; i < 2; i++) {
                randcols = genRandList(3);
                for (j = 0; j < 3; j++) {
                    clearCell($scope.puzzle.board, randrows[i], randcols[j]);
                }
            }

            //delete 2 values from 3  random rows
            for (i = 0; i < 3; i++) {
                randcols = genRandList(2);
                for (j = 0; j < 2; j++) {
                    clearCell($scope.puzzle.board, randrows[i], randcols[j]);
                }
            }

            //delete 2 values from 1 random col
            randcols = genRandList(1);
            for (i = 0; i < 2; i++) {
                clearCell($scope.puzzle.board, randrows[i], randcols[0]);
            }

            //delete one ramdom value from evry 3x2 box
            for (i = 1; i < 7; i++) {
                boxcoord = getBoxEdgesById(i);
                clearCell($scope.puzzle.board, Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1), Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3));

            }

        };

        $scope.validate = function (row, column) {
            var box = getBoxEdgesByCellCoord(row,column);
            var value = $scope.puzzle.board[row][column];
            var test = value;
            for (var i = 0; i < 6; i++) {
                if (i != row) {
                    if ($scope.puzzle.board[i][column] == value) {
                        window.console.log($scope.puzzle.board[i][column]);
                        window.console.log(value);
                        return false;
                    }
                }
            }

            for (var i = 0; i < 6; i++) {
                if (i!=column) {
                    if ($scope.puzzle.board[row][i] == value) {
                        window.console.log('col error')
                        return false;
                    }
                }
            }
            for (i = box.p1; i < box.p2; i++) {
                for (j = box.p3; j < box.p4; j++) {
                    if (!(i==row && j==column)) {
                        if ($scope.puzzle.board[i][j] == value) {
                            window.console.log('box error')
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        $scope.validMatrix = function () {
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 6; j++) {
                    var hasError = $scope.validate(i, j);
                    if (!hasError) {
                        window.console.log($scope.puzzle.board);
                        window.console.log('matrix has error');
                        window.console.log(i);
                        window.console.log(j);
                        return false;
                    }
                }
            }
            window.console.log($scope.puzzle.board);
            window.console.log('no error');
            return true;
        }

        $scope.test=function() {
            $scope.validMatrix();
        }

        function replaceNull (board) {
            for (var i = 0; i < $scope.puzzle.dimensions; ++i) {
                for (var j = 0; j < $scope.puzzle.dimensions; ++j) {
                    if (board[i][j] == null) {
                        board[i][j] = "";
                    }
                }
            }
        }

        //return an object with 2 parameters (row and col of the first empty cell)
        function findClosestEmptySquare() {
            for (var i = 0; i < $scope.puzzle.dimensions; ++i) {
                for (var j = 0; j < $scope.puzzle.dimensions; ++j) {
                    if ($scope.puzzle.board[i][j]=="" ) {
                        return {
                            p1: i,
                            p2: j
                        };
                    }
                }
            }
        }

        function setCell(board, row, column, value) {
            board[row][column] = value;
        }

        function clearCell(board, row, column) {
            board[row][column] = "";
        }

        function solveBoard(board, k, n) {
            var nextEmptySquare;
            var legalValues;
            var valid = $scope.validMatrix();
            if (!valid) {
                return false;
            }
            nextEmptySquare = findClosestEmptySquare();
            if (k == n) {
                return true;
            }
            else {
                
                legalValues = shuffleArray( findLegalValuesForSquare(board, nextEmptySquare));
                if (legalValues.length == 0) {
                    return false;
                }
                ++k;
                for (var i = 0; i < legalValues.length; i++) {
                    setCell(board, nextEmptySquare.p1, nextEmptySquare.p2, legalValues[i]);
                    if (!solveBoard(board, k, n)) {
                        //backtrack if there are no possible values for the current candidate cell
                        clearCell(board, nextEmptySquare.p1, nextEmptySquare.p2);
                    } else {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
        Determines the coordinates of the box  that a particular 
        cell belongs to based on the cells coordiantes
        *@param {Object} i row index
        *@param {Object} j col index
        *@returns {Object} box coordiantes 
        */
        function getBoxEdgesByCellCoord(i,j) {
            var originRow = Math.floor(i / 2);
            originRow *= 2;
            var endRow = originRow + 2;
            var originColumn = Math.floor(j / 3);
            originColumn *= 3;
            var endColumn = originColumn + 3;
            return {
                p1: originRow,
                p2: endRow,
                p3: originColumn,
                p4: endColumn
            };
        }

        /**
         * Determines the coordinates of a particular box
         * based on the box id
         * @param {Number} id Boxid
         * @returns {Object} box parameters
         */
        function getBoxEdgesById(id) {
            var originRow, endRow, originColumn, endColumn;
            if (id % 2 !== 0) {
                originColumn = 0;
                originRow = id - 1;
                endRow = id + 1;
            } else {
                originColumn = 3;
                endRow = id;
                originRow = endRow - 2;
            }
            endColumn = originColumn + 3;
            return {
                p1: originRow,
                p2: endRow,
                p3: originColumn,
                p4: endColumn
            };

        }

        /*
         *if board[row][col] has value x then set arr[x-1] to true 
         */
        function assignCandidateState(board, arr, row, column) {
            if ($scope.puzzle.board[row][column] !== "") {
                arr[board[row][column] - 1] = true;
            }
        }

        /*
         * adds current values inside the row/col/box that the cell belongs to 3 arrays
         * adds a value to the candaidate array if that value belongs neither to the row nor to the col nor to the box array
         */
        function findLegalValuesForSquare(board, cell) {
            row = [$scope.puzzle.dimensions];
            column = [$scope.puzzle.dimensions];
            square = [$scope.puzzle.dimensions];
            candidateValues = [];
            candidateSquare = getBoxEdgesByCellCoord(cell.p1,cell.p2);
            for (var i = 0; i < $scope.puzzle.dimensions; i++) {
                row[i] = false;
                column[i] = false;
                square[i] = false;
            }
            for ( i = 0; i < $scope.puzzle.dimensions; i++) {
                assignCandidateState(board, row, cell.p1, i);
                assignCandidateState(board, column, i, cell.p2);
            }

            //check the candidate square
            for ( i = candidateSquare.p1; i < candidateSquare.p2; ++i) {
                for (var j = candidateSquare.p3; j < candidateSquare.p4; ++j) {
                    assignCandidateState(board, square, i, j);
                }
            }

            //now find possible candidates
            for ( i = 0; i < $scope.puzzle.dimensions; i++) {
                if (!row[i] && !column[i] && !square[i]) {
                    //this is a candiate 
                    candidateValues.push(i + 1);
                }
            }
            return candidateValues;
        }


        //creates a random array of length len with values from 0 to 6
        function genRandList(len) {
            var randList = [];
            while (randList.length < len) {
                var rand_i = Math.ceil(Math.random() * 6) - 1;
                if (randList.indexOf(rand_i) === -1) {
                    randList.push(rand_i);
                }
            }
            return randList;
        }

        function shuffleArray(a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
            return a;
        }
    }

    angular
        .module('sudokuApp')
        .controller('SudokuController', SudokuController);
})(window.angular);