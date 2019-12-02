/**
 * A Javascript implementation of a Sudoku game, including a
 * backtracking algorithm solver
 */
var Sudoku = ( function ( $ ){
    var _instance, _game,
		/**
		 * Default configuration options. These can be overriden
		 * when loading a game instance.
		 * @property {Object}
		 */
        defaultConfig = {

            'validate_on_insert': true,

            'show_solver_timer': true,

            'show_recursion_counter': true,

            'solver_shuffle_numbers': true
        };

	/**
	 * Initialize the singleton
	 * @param {Object} config Configuration options
	 * @returns {Object} Singleton methods
	 */
	function init() {
		
		_game = new Game( defaultConfig );

		/** Game methods **/
		return {
			/**
			 * Return a visual representation of the board
			 * @returns {jQuery} Game table
			 */
			getGameBoard: function() {
				return _game.buildGUI();
			},

			/**
			 * Reset the game board.
			 */
			reset: function() {
				_game.resetGame();
			},

			/**
			 * Call for the solver routine to solve the current
			 * board.
             * @returns {boolean} false if the matrix is not valid
			 */
			solve: function() {
				var isValid, starttime, endtime, elapsed;
				// Make sure the board is valid first
                if ($('.sudoku-container').hasClass('invalid-matrix')) {
                    window.alert('Cant`t solve! Matrix has errors');
					return false;
				}
				// Reset counters
				_game.recursionCounter = 0;
				_game.backtrackCounter = 0;

				// Check start time
				starttime = Date.now();

				// Solve the game
                isValid = _game.solveGame(0, 0);

                if (!isValid) {
                    window.alert('Puzzle cant be solved! Reset matrix!');
                    $('.sudoku-container').addClass('invalid-matrix');
                }

				// Get solving end time
				endtime = Date.now();

				// Visual indication of whether the game was solved
                $('.sudoku-container').toggleClass('valid-matrix', isValid);

				// Display elapsed time
				if ( _game.config.show_solver_timer ) {
					elapsed = endtime - starttime;
                    window.console.log('Solver elapsed time: ' + elapsed + 'ms');
                    
				}
				// Display number of reursions and backtracks
				if ( _game.config.show_recursion_counter ) {
					window.console.log( 'Solver recursions: ' + _game.recursionCounter );
					window.console.log( 'Solver backtracks: ' + _game.backtrackCounter );
				}
            },

            /**
             * choose between the diffrent styles of the board
             */
            generate: function (level) {
                _game.resetGame();
                _game.solveGame(0, 0);
                _game.generateGame(level);
            },

            hint: function (sect) {   
                 _game.solveRandomSection(sect);
            },

            highlight: function (x) {
                _game.highlightNumbers(x);

            },

            save: function () {
                _game.saveGame();
            },

            load: function () {
                _game.loadGame();
            },

            style: function () {
                _game.changeStyle();
            }
		};
    }


	/**
	 * Sudoku singleton engine
	 * @param {Object} config Configuration options
     * @returns {Object} game object
	 */
	function Game( config ) {
		this.config = config;

		// Initialize game parameters
		this.recursionCounter = 0;
		this.$cellMatrix = {};
		this.matrix = {};
        this.validation = {};
        this.lastSelectedCell = [];

		this.resetValidationMatrices();
		return this;
	}

    /**
	 * Game engine prototype methods
	 * @property {Object}
	 */

    Game.prototype = {
		/**
		 * Build the game GUI
		 * @returns {jQuery} Table containing 9x9 input matrix
		 */
        buildGUI: function () {
            var $td, $tr,
                $table = $('<table>')
                    .addClass('sudoku-container');

            for (var i = 0; i < 9; i++) {
                $tr = $('<tr>');
                this.$cellMatrix[i] = {};

                for (var j = 0; j < 9; j++) {
                    // Build the input
                    // .data(dataName,value): Store arbitrary data associated with the matched elements.
                    // .on(event,handler): Attach an event handler function for one or more events to the selected elements
                    //                    Execute handler when event triggered
                    // .proxy(func,context): Takes a function and returns a new one that will always have a particular context
                    //                        func:=  function whose context will be changed
                    //                         context: The object to which the context (this) of the function should be set
                    this.$cellMatrix[i][j] = $('<input oninput="javascript: if (this.value.length > this.maxLength  )  this.value = this.value.slice(0, this.maxLength); if ($(this).val() == 0) {$(this).val(null);} " type = "number" maxlength = "1">')
                        .data('row', i)
                        .data('col', j)
                        .on('keyup', $.proxy(this.onKeyUp, this))
                        .on('click',$.proxy(this.onClick,this));

                    /** .append(content): Insert content, specified by the parameter, to the end of each element
                     */
                    $td = $('<td>').append(this.$cellMatrix[i][j]);
                    // Calculate section ID
                    sectIDi = Math.floor(i / 3);
                    sectIDj = Math.floor(j / 3);
                    // Set the design for different sections
                    if ((sectIDi + sectIDj) % 2 === 0) {
                        $td.addClass('sudoku-section-one');
                    } else {
                        $td.addClass('sudoku-section-two');
                    }
                    // Build the row
                    $tr.append($td);
                }
                // Append to table
                $table.append($tr);
            }
            // Return the GUI table
            return $table;
        },

		/**
		 * Handle keyup events.
		 *
		 * @param {jQuery.event} event Keyup event
		 */
        onKeyUp: function (event) {
            var sectRow, sectCol, secIndex,
                starttime, endtime, elapsed,hasError=false,
                isValid = true,
                val,
                row = $(event.currentTarget).data('row'),
                col = $(event.currentTarget).data('col');

            if($.trim($(event.currentTarget).val())>0) {
                val = parseInt($.trim($(event.currentTarget).val()));
            } else {
                val = $.trim($(event.currentTarget).val());
                if (this.$cellMatrix[row][col].hasClass('highlight')) {
                    for (var i = 0; i < 9; i++) {
                        for (var j = 0; j < 9; j++) {
                            this.$cellMatrix[i][j].removeClass('highlight');
                        }
                    }

                }
            }



            // Validate, but only if validate_on_insert is set to true
            if (this.config.validate_on_insert) {
                isValid = this.validateNumber(val, row, col, this.matrix.row[row][col]);
                // Indicate error
                $(event.currentTarget).toggleClass('sudoku-input-error', !isValid);
                $('.sudoku-container').toggleClass('invalid-matrix',!isValid);
            }

            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {

                    sectRow = Math.floor(i / 3);
                    sectCol = Math.floor(j / 3);

                   if (this.$cellMatrix[i][j].hasClass('sudoku-input-error')) {
                        this.$cellMatrix[i][j].toggleClass('sudoku-input-error', !(arrayhasUniqueValues(this.validation.sect[sectRow][sectCol]) &&
                            arrayhasUniqueValues(this.validation.col[j]) &&
                            arrayhasUniqueValues(this.validation.row[i]))); 
                       if (this.$cellMatrix[i][j].hasClass('sudoku-input-error')) {
                            hasError = true;
                       }
                    }

                    this.$cellMatrix[i][j].toggleClass('sudoku-input-error-region', !arrayhasUniqueValues(this.validation.row[i]));
                        
                        
                    if (!this.$cellMatrix[i][j].hasClass('sudoku-input-error-region')) {
                        this.$cellMatrix[i][j].toggleClass('sudoku-input-error-region', !arrayhasUniqueValues(this.validation.col[j]));
                    }

                    if (!this.$cellMatrix[i][j].hasClass('sudoku-input-error-region')) {
                           
                        this.$cellMatrix[i][j].toggleClass('sudoku-input-error-region', !arrayhasUniqueValues(this.validation.sect[sectRow][sectCol]));
                    }


                }
            }      
        
            // Calculate section identifiers
            sectRow = Math.floor(row / 3);
            sectCol = Math.floor(col / 3);
            secIndex = (row % 3) * 3 + (col % 3);

            // Cache value in matrix

            if (Number.isInteger(val)) {
                this.matrix.row[row][col] = val;
                this.matrix.col[col][row] = val;
                this.matrix.sect[sectRow][sectCol][secIndex] = val;
            } else {
                this.matrix.row[row][col] = '';
                this.matrix.col[col][row] = '';
                this.matrix.sect[sectRow][sectCol][secIndex] = '';
            }


            if (hasError) {
                $('.sudoku-container').addClass('invalid-matrix');
            } else {
                $('.sudoku-container').addClass('valid-matrix');
            }

        },

        onClick: function (event) {
            this.lastSelectedCell[0] = $(event.currentTarget).data('row');
            this.lastSelectedCell[1] = $(event.currentTarget).data('col');
            this.highlightNumbers(this.$cellMatrix[$(event.currentTarget).data('row')][$(event.currentTarget).data('col')]);
        },

		/**
		 * Reset the board and the game parameters
		 */
        resetGame: function () {
            this.resetValidationMatrices();
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    // Reset GUI inputs
                    this.$cellMatrix[row][col].val('');
                    this.$cellMatrix[row][col].removeClass('sudoku-input-error');
                    this.$cellMatrix[row][col].removeClass('sudoku-input-error-region');
                    this.$cellMatrix[row][col].removeClass('highlight');
                }
            }

            $('.sudoku-container input').removeAttr('disabled');
            $('.sudoku-container').removeClass('valid-matrix');
            $('.sudoku-container').removeClass('invalid-matrix');
        },

		/**
		 * Reset and rebuild the validation matrices
		 */
        resetValidationMatrices: function () {
            this.matrix = { 'row': {}, 'col': {}, 'sect': {} };
            this.validation = { 'row': {}, 'col': {}, 'sect': {} };

            // Build the row/col matrix and validation arrays
            for (var i = 0; i < 9; i++) {
                this.matrix.row[i] = ['', '', '', '', '', '', '', '', ''];
                this.matrix.col[i] = ['', '', '', '', '', '', '', '', ''];
                this.validation.row[i] = [];
                this.validation.col[i] = [];
            }

            // Build the section matrix and validation arrays
            for (var row = 0; row < 3; row++) {
                this.matrix.sect[row] = [];
                this.validation.sect[row] = {};
                for (var col = 0; col < 3; col++) {
                    this.matrix.sect[row][col] = ['', '', '', '', '', '', '', '', ''];
                    this.validation.sect[row][col] = [];
                }
            }
        },

		/**
		 * Validate the current number that was inserted.
		 *
		 * @param {String} num The value that is inserted
		 * @param {Number} rowID The row the number belongs to
		 * @param {Number} colID The column the number belongs to
		 * @param {String} oldNum The previous value
		 * @returns {Boolean} Valid or invalid input
		 */
        validateNumber: function (num, rowID, colID, oldNum) {
            var isValid = true,
                // Section
                sectRow = Math.floor(rowID / 3),
                sectCol = Math.floor(colID / 3),
                boxcoord = this.getBoxEdgesByCellCoord(rowID, colID);

            // This is given as the matrix component (old value in
            // case of change to the input) in the case of on-insert
            // validation. However, in the solver, validating the
            // old number is unnecessary.
            oldNum = oldNum || '';

            // Remove oldNum from the validation matrices,
            // if it exists in them.

            //The indexOf() method returns the position of the first occurrence of a specified value in a string.
            //This method returns - 1 if the value to search for never occurs
            if (this.validation.row[rowID].indexOf(oldNum) > -1) {
                //The splice() method adds / removes items to / from an array, and returns the removed item(s).
                //Requires an integer (first param) that specifies at what position to add/remove items
                //Use negative values to specify the position from the end of the array
                //Second param specifies how many itemes will be deleted starting with item at the index equal with first param
                this.validation.row[rowID].splice(
                    this.validation.row[rowID].indexOf(oldNum), 1
                );
            }
            if (this.validation.col[colID].indexOf(oldNum) > -1) {
                this.validation.col[colID].splice(
                    this.validation.col[colID].indexOf(oldNum), 1
                );
            }
            if (this.validation.sect[sectRow][sectCol].indexOf(oldNum) > -1) {
                this.validation.sect[sectRow][sectCol].splice(
                    this.validation.sect[sectRow][sectCol].indexOf(oldNum), 1
                );
            }
            // Skip if empty value

            if (Number.isInteger(num)) {
                // Check if it already exists in validation array
                //$.inArray: Search for a specified value within an array and return its index (or -1 if not found)
                if ($.inArray(num, this.validation.row[rowID]) > -1 || $.inArray(num, this.validation.col[colID]) > -1 || $.inArray(num, this.validation.sect[sectRow][sectCol]) > -1) {
                    isValid = false;
                }

                // Insert new value into validation array even if it isn't
                // valid. This is on purpose: If there are two numbers in the
                // same row/col/section and one is replaced, the other still
                // exists and should be reflected in the validation.
                // The validation will keep records of duplicates so it can
                // remove them safely when validating later changes.

                //push(): adds new items to the end of an array, and returns the new length
                this.validation.row[rowID].push(num);
                this.validation.col[colID].push(num);
                this.validation.sect[sectRow][sectCol].push(num);
                //if (!rowIsValid) {
              
                //}
            } 

           
            return isValid;
        },

		/**
		 * A recursive 'backtrack' solver for the game
         * @param {Number} row row index
         * @param {Number} col column index
         * @return {boolean} true if game was solved / false if it can´t be solved
         *
		 */
        solveGame: function (row, col) {
            var cval, sqRow, sqCol, $nextEmptySquare, legalValues,
                sectRow, sectCol, secIndex, gameResult;

            this.recursionCounter++;
            $nextEmptySquare = this.findClosestEmptySquare(row, col);
            if (!$nextEmptySquare) {
                // End of board
                return true;
            } else {
                sqRow = $nextEmptySquare.data('row');
                sqCol = $nextEmptySquare.data('col');
                legalValues = this.findLegalValuesForSquare(sqRow, sqCol);

                if (legalValues.length == 0) {
                    return false;
                }

                // Find the segment id
                sectRow = Math.floor(sqRow / 3);
                sectCol = Math.floor(sqCol / 3);
                secIndex = (sqRow % 3) * 3 + (sqCol % 3);

                // Try out legal values for this cell
                for ( var i = 0; i < legalValues.length; i++) {
                    cval = legalValues[i];
                    // Update value in input
                    $nextEmptySquare.val(cval);
                    // Update in matrices
                    this.matrix.row[sqRow][sqCol] = cval;
                    this.matrix.col[sqCol][sqRow] = cval;
                    this.matrix.sect[sectRow][sectCol][secIndex] = cval;
                    this.validation.row[sqRow].push(cval);
                    this.validation.col[sqCol].push(cval);
                    this.validation.sect[sectRow][sectCol].push(cval);

                    // Recursively keep trying
                    if (this.solveGame(sqRow, sqCol)) {
                        return true;
                    } else {
                        // There was a problem, we should backtrack
                        this.backtrackCounter++;

                        // Remove value from input
                        this.$cellMatrix[sqRow][sqCol].val('');
                        // Remove value from matrices
                        this.matrix.row[sqRow][sqCol] = '';
                        this.matrix.col[sqCol][sqRow] = '';
                        this.matrix.sect[sectRow][sectCol][secIndex] = '';
                        this.validation.row[sqRow].splice(this.validation.row[sqRow].indexOf(cval), 1);                 
                        this.validation.col[sqCol].splice(this.validation.col[sqCol].indexOf(cval), 1);
                        this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(cval), 1);
                    }
                }
                // If there was no success with any of the legal
                // numbers, call backtrack recursively backwards
                return false;

                
            }
        },

		/**
		 * Find closest empty square relative to the given cell.
		 *
		 * @param {Number} row Row id
		 * @param {Number} col Column id
		 * @returns {jQuery} Input element of the closest empty
		 *  square
		 */
        findClosestEmptySquare: function (row, col) {
            var walkingRow, walkingCol, found = false;
            for (var i = (col + 9 * row); i < 81; i++) {
                walkingRow = Math.floor(i / 9);
                walkingCol = i % 9;
                if (this.matrix.row[walkingRow][walkingCol] === '') {
                    found = true;
                    return this.$cellMatrix[walkingRow][walkingCol];
                }
            }
        },

		/**
		 * Find the available legal numbers for the square in the
		 * given row and column.
		 *
		 * @param {Number} row Row id
		 * @param {Number} col Column id
		 * @returns {Array} An array of available numbers
		 */
        findLegalValuesForSquare: function (row, col) {
            var legalVals, legalNums, val, i,
                sectRow = Math.floor(row / 3),
                sectCol = Math.floor(col / 3);

            legalNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            // Check existing numbers in col
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.col[col][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            // Check existing numbers in row
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.row[row][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            // Check existing numbers in section
            sectRow = Math.floor(row / 3);
            sectCol = Math.floor(col / 3);
            for (i = 0; i < 9; i++) {
                val = Number(this.matrix.sect[sectRow][sectCol][i]);
                if (val > 0) {
                    // Remove from array
                    if (legalNums.indexOf(val) > -1) {
                        legalNums.splice(legalNums.indexOf(val), 1);
                    }
                }
            }

            if (this.config.solver_shuffle_numbers) {
                // Shuffling the resulting 'legalNums' array will
                // make sure the solver produces different answers
                // for the same scenario. Otherwise, 'legalNums'
                // will be chosen in sequence.
                for (i = legalNums.length - 1; i > 0; i--) {
                    var rand = getRandomInt(0, i);
                    temp = legalNums[i];
                    legalNums[i] = legalNums[rand];
                    legalNums[rand] = temp;
                }
            }

            return legalNums;
        },

        generateGame: function (level) {
            var i, j, randrows,randcols,boxcoord,row,col,newBox,boxId=10;         

           //generate random rows
            randrows = genRandList(9);

            //generate random cols
            randcols = genRandList(9);

            if (level == 'beginner') {
                //delete 5 ramdom values from evry 3x2 box          
                for (j = 0; j < 5; j++) {
                    for (i = 0; i < 9; i++) {
                        boxcoord = this.getBoxEdgesById(i);

                        //get random values between box edges
                        row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                        col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                        while (this.matrix.row[row][col] == "") {
                            row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                            col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                        }

                        //Remove values from matrices

                        this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                        this.matrix.row[row][col] = '';

                        this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                        this.matrix.col[col][row] = '';

                        sectRow = Math.floor(row / 3);
                        sectCol = Math.floor(col / 3);
                        secIndex = (row % 3) * 3 + (col % 3);
                        this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                        this.matrix.sect[sectRow][sectCol][secIndex] = '';

                        // Remove values from input
                        this.$cellMatrix[row][col].val('');

                    }
                }

                //delete 1 random value from 1 random box
                boxId = getRandomInt(0, 8);

                boxcoord = this.getBoxEdgesById(boxId);

                //get random values between box edges
                row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                while (this.matrix.row[row][col] == "") {
                    row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                    col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                }

                //Remove values from matrices

                this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                this.matrix.row[row][col] = '';

                this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                this.matrix.col[col][row] = '';

                sectRow = Math.floor(row / 3);
                sectCol = Math.floor(col / 3);
                secIndex = (row % 3) * 3 + (col % 3);
                this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                this.matrix.sect[sectRow][sectCol][secIndex] = '';

                // Remove values from input
                this.$cellMatrix[row][col].val('');
            }

            if (level == 'intermediate') {
                //delete 6 ramdom values from evry 3x2 box          
                for (j = 0; j < 6; j++) {
                    for (i = 0; i < 9; i++) {
                        boxcoord = this.getBoxEdgesById(i);

                        //get random values between box edges
                        row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                        col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                        while (this.matrix.row[row][col] == "") {
                            row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                            col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                        }

                        //Remove values from matrices

                        this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                        this.matrix.row[row][col] = '';

                        this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                        this.matrix.col[col][row] = '';

                        sectRow = Math.floor(row / 3);
                        sectCol = Math.floor(col / 3);
                        secIndex = (row % 3) * 3 + (col % 3);
                        this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                        this.matrix.sect[sectRow][sectCol][secIndex] = '';

                        // Remove values from input
                        this.$cellMatrix[row][col].val('');

                    }
                }

                //delete 2 random value from 2 random box
                for (var i = 0; i < 2; i++) {
                    newBox = getRandomInt(0, 8);
                    while (newBox===boxId) {
                        newBox = getRandomInt(0, 8);
                    }
                    boxId = newBox;
                    boxcoord = this.getBoxEdgesById(boxId);

                    //get random values between box edges
                    row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                    col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                    while (this.matrix.row[row][col] == "") {
                        row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                        col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                    }

                    //Remove values from matrices

                    this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                    this.matrix.row[row][col] = '';

                    this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                    this.matrix.col[col][row] = '';

                    sectRow = Math.floor(row / 3);
                    sectCol = Math.floor(col / 3);
                    secIndex = (row % 3) * 3 + (col % 3);
                    this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                    this.matrix.sect[sectRow][sectCol][secIndex] = '';

                    // Remove values from input
                    this.$cellMatrix[row][col].val('');
                }
            }

            if (level=='expert') {
                //delete 7 ramdom values from evry 3x2 box          
                for (j = 0; j < 7; j++) {
                    for (i = 0; i < 9; i++) {
                        boxcoord = this.getBoxEdgesById(i);

                        //get random values between box edges
                        row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                        col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                        while (this.matrix.row[row][col] == "") {
                            row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                            col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                        }

                        //Remove values from matrices

                        this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                        this.matrix.row[row][col] = '';

                        this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                        this.matrix.col[col][row] = '';

                        sectRow = Math.floor(row / 3);
                        sectCol = Math.floor(col / 3);
                        secIndex = (row % 3) * 3 + (col % 3);
                        this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                        this.matrix.sect[sectRow][sectCol][secIndex] = '';

                        // Remove values from input
                        this.$cellMatrix[row][col].val('');

                    }
                }

                //delete 1 random value from 1 random box
                boxId = getRandomInt(0, 8);

                boxcoord = this.getBoxEdgesById(boxId);

                //get random values between box edges
                row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);

                while (this.matrix.row[row][col] == "") {
                    row = Math.floor(Math.random() * (boxcoord.p2 - boxcoord.p1) + boxcoord.p1);
                    col = Math.floor(Math.random() * (boxcoord.p4 - boxcoord.p3) + boxcoord.p3);
                }

                //Remove values from matrices

                this.validation.row[row].splice(this.validation.row[row].indexOf(this.matrix.row[row][col]), 1);
                this.matrix.row[row][col] = '';

                this.validation.col[col].splice(this.validation.col[col].indexOf(this.matrix.col[col][row]), 1);
                this.matrix.col[col][row] = '';

                sectRow = Math.floor(row / 3);
                sectCol = Math.floor(col / 3);
                secIndex = (row % 3) * 3 + (col % 3);
                this.validation.sect[sectRow][sectCol].splice(this.validation.sect[sectRow][sectCol].indexOf(this.matrix.sect[sectRow][sectCol][secIndex]), 1);
                this.matrix.sect[sectRow][sectCol][secIndex] = '';

                // Remove values from input
                this.$cellMatrix[row][col].val('');
            }

        },

        solveCopy: function (matrix) {
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    if (matrix[row][col] === '') {
                        for (var number = 1; number <= 9; number++) {
                            if (!(this.containsInRow(matrix, row, number) || this.containsInCol(matrix, col, number) || this.containsInBox(matrix, row, col, number))) {
                                matrix[row][col] = number;
                                if (this.solveCopy(matrix)) {
                                    return true;
                                } else {
                                    matrix[row][col] = '';
                                }
                            }
                        }
                        return false;
                    }
                }
            }

            return true;
        },

        solveRandomSection: function (sect) {
            var copy = $.extend(true, {}, this.matrix.row), row = this.lastSelectedCell[0],
                       col = this.lastSelectedCell[1],sectRow,sectCol,sectIndex;

            this.solveCopy(copy);
       

            if ($('.sudoku-container').hasClass('invalid-matrix') || !(this.lastSelectedCell.length > 0)) {
                if ($('.sudoku-container').hasClass('invalid-matrix')) {
                    window.alert('Can´t solve! Matrix is invalid!');
                }

                if (!this.lastSelectedCell.length > 0) {
                    window.alert('Can´t solve! Choose a cell first!');
                }

                
            } else {
                if (sect === 'cell') {

                    this.$cellMatrix[row][col].val(copy[row][col]);
                    this.matrix.row[row][col] = copy[row][col];
                    this.matrix.col[col][row] = copy[row][col];
                    if ($.inArray(copy[row][col], this.validation.row[row]) === -1) {
                        this.validation.row[row].push(copy[row][col]);
                    }
                    if ($.inArray(copy[row][col], this.validation.col[col]) === -1) {
                        this.validation.col[col].push(copy[row][col]);
                    }
                    sectRow = Math.floor(row / 3);
                    sectCol = Math.floor(col / 3);
                    sectIndex = (row % 3) * 3 + (col % 3);
                    this.matrix.sect[sectRow][sectCol][sectIndex] = copy[row][col];
                    if ($.inArray(copy[row][col], this.validation.sect[sectRow][sectCol]) === -1) {
                        this.validation.sect[sectRow][sectCol].push(copy[row][col]);
                    }
                }

                if (sect === 'row') {
                    for (i = 0; i < 9; i++) {
                        this.$cellMatrix[row][i].val(copy[row][i]);
                        this.matrix.row[row][i] = copy[row][i];
                        this.matrix.col[i][row] = copy[row][i];
                        if ($.inArray(copy[row][i], this.validation.row[row]) === -1) {
                            this.validation.row[row].push(copy[row][i]);
                        }
                        if (!($.inArray(copy[row][i], this.validation.col[i]) > -1)) {
                            this.validation.col[i].push(copy[row][i]);
                        }
                    }
                    sectRow = Math.floor(row / 3);
                    var k = 0;
                    for (i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            sectIndex = (row % 3) * 3 + (j % 3);
                            this.matrix.sect[sectRow][i][sectIndex] = copy[row][k];
                            if ($.inArray(copy[row][k], this.validation.sect[sectRow][i]) === -1) {
                                this.validation.sect[sectRow][i].push(copy[row][k]);
                            }
                            k++;
                        }
                    }
                }

                if (sect === 'column') {
                    for (i = 0; i < 9; i++) {
                        this.$cellMatrix[i][col].val(copy[i][col]);
                        this.matrix.row[i][col] = copy[i][col];
                        this.matrix.col[col][i] = copy[i][col];
                        if ($.inArray(copy[i][col], this.validation.row[i]) === -1) {
                            this.validation.row[i].push(copy[i][col]);
                        }
                        if (!($.inArray(copy[i][col], this.validation.col[col]) > -1)) {
                            this.validation.col[col].push(copy[i][col]);
                        }
                    }

                    sectCol = Math.floor(col / 3);
                    k = 0;
                    for (i = 0; i < 3; i++) {
                        for (j = 0; j < 3; j++) {
                            sectIndex = (j % 3) * 3 + (col % 3);
                            this.matrix.sect[i][sectCol][sectIndex] = copy[k][col];
                            if ($.inArray(copy[k][col], this.validation.sect[i][sectCol]) === -1) {
                                this.validation.sect[i][sectCol].push(copy[k][col]);
                            }
                            k++;
                        }
                    }
                }

                if (sect === 'box') {
                    boxcoord = this.getBoxEdgesByCellCoord(row, col);
                    for (i = boxcoord.p1; i < boxcoord.p2; i++) {
                        for (j = boxcoord.p3; j < boxcoord.p4; j++) {
                            this.$cellMatrix[i][j].val(copy[i][j]);
                            this.matrix.row[i][j] = copy[i][j];
                            this.matrix.col[j][i] = copy[i][j];
                            if ($.inArray(copy[i][j], this.validation.row[i]) === -1) {
                                this.validation.row[i].push(copy[i][j]);
                            }
                            if ($.inArray(copy[i][j], this.validation.col[j]) === -1) {
                                this.validation.col[j].push(copy[i][j]);
                            }
                            sectRow = Math.floor(i / 3);
                            sectCol = Math.floor(j / 3);
                            sectIndex = (i % 3) * 3 + (j % 3);
                            this.matrix.sect[sectRow][sectCol][sectIndex] = copy[i][j];
                            if ($.inArray(copy[i][j], this.validation.sect[sectRow][sectCol]) === -1) {
                                this.validation.sect[sectRow][sectCol].push(copy[i][j]);
                            }
                        }
                    }
                }

                $('.sudoku-container').addClass('valid-matrix');
            }
        },

        highlightNumbers: function (x) {
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    this.$cellMatrix[row][col].removeClass('highlight');
                    
                }
            }

            if (x.val()!='') {
                for (var i = 0; i < 9; i++) {
                    for (var j = 0; j < 9; j++) {
                        if (this.$cellMatrix[i][j].val() == x.val()) {
                            this.$cellMatrix[i][j].addClass('highlight');
                        }
                    }
                }
            }
        },

        containsInRow: function(matrix,row, number){
            for (var i = 0; i < 9; i++){
                if (matrix[row][i] === number) {
                    return true;
                }
            }
            return false;
        },
  
        containsInCol: function(matrix,col,number){
            for (var i = 0; i < 9; i++){
                if (matrix[i][col] === number) {
                    return true;
                }
            }
            return false;
        },
  
        containsInBox(matrix, row, col, number) {
            var r = row - row % 3;
            var c = col - col % 3;
            for (var i = r; i < r + 3; i++) {
                for (var j = c; j < c + 3; j++) {
                    if (matrix[i][j] === number) {
                        return true;
                    }
                }

            }
            return false;
        },

        getBoxEdgesByCellCoord: function (row, col) {
            var startRow = Math.floor(row / 3) * 3;
            var endRow = startRow + 3;
            var startColumn = Math.floor(col / 3) * 3;
            var endColumn = startColumn + 3;
            return {
                p1: startRow,
                p2: endRow,
                p3: startColumn,
                p4: endColumn
            };
        },

        getBoxEdgesById: function (i) {
            var startRow = Math.floor(i / 3) * 3;
            var endRow = startRow + 3;
            var startCol = (i % 3)*3;
            var endCol = startCol + 3;
            return {
                p1: startRow,
                p2: endRow,
                p3: startCol,
                p4: endCol
            };
        },

        saveGame: function () {
            //$.post:  Load data from the server using a HTTP POST request
            var sem = true,count=0;
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (this.$cellMatrix[i][j].val() != "") {
                        count++;
                    }
                }
            }

            if (count >= 17) {
                window.console.log(count);
                $.post("Sudoku/SaveSudokuList", { sudoku: this.matrix.row }, function (data) { });
            } else {
                window.alert('The puzzle must contain at least 17 numbers!')
            }
        },

        loadGame: function () {
            var currentThis = this;
            currentThis.resetGame();
            //$.post:  Load data from the server using a HTTP POST request
            $.post("Sudoku/GetNextSudoku", function (data) {
                var copy = $.extend(true, {}, data.Sudoku);
                for (var i = 0; i < 81; i++) {
                    if (copy[i] !== 0) {
                        var sectRow = Math.floor(Math.floor(i / 9) / 3);
                        var sectCol = Math.floor(i % 9 / 3);
                        var sectIndex = (Math.floor(i / 9) % 3) * 3 + (i % 9 % 3);
                        currentThis.$cellMatrix[Math.floor(i / 9)][i % 9].val(copy[i]);
                        currentThis.matrix.row[Math.floor(i / 9)][i % 9] = copy[i];
                        currentThis.matrix.col[i % 9][Math.floor(i / 9)] = copy[i];
                        currentThis.matrix.sect[sectRow][sectCol][sectIndex] = copy[i];
                        if ($.inArray(copy[i], currentThis.validation.row[Math.floor(i / 9)]) === -1) {
                            currentThis.validation.row[Math.floor(i / 9)].push(copy[i]);
                        }
                        if ($.inArray(copy[i], currentThis.validation.col[i % 9]) === -1) {
                            currentThis.validation.col[i % 9].push(copy[i]);
                        }
                        if ($.inArray(copy[i], currentThis.validation.sect[sectRow][sectCol]) === -1) {
                            currentThis.validation.sect[sectRow][sectCol].push(copy[i]);
                        }
                    }
                }              
            });
        },

        changeStyle: function () {
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (this.$cellMatrix[i][j].parent().hasClass('sudoku-section-one')) {
                        this.$cellMatrix[i][j].parent().removeClass('sudoku-section-one')
                        this.$cellMatrix[i][j].parent().addClass('sudoku-section-two')
                    } else {
                        this.$cellMatrix[i][j].parent().removeClass('sudoku-section-two')
                        this.$cellMatrix[i][j].parent().addClass('sudoku-section-one')
                    }
                }
            }
        }

    };

        /**
	     * Get a random integer within interval
	     *
	     * @param {Number} min Minimum number
	     * @param {Number} max Maximum range
	     * @returns {Number} Random number within the range (Inclusive)
	     */
    function getRandomInt (min, max) {
        return Math.floor(Math.random() * ((max-min) + 1)) + min;
    }

    //creates a random array of length len with values from 0 to 9
    function genRandList (len) {
        var randList = [];
        while (randList.length < len) {
            var rand_i = Math.ceil(Math.random() * 9) - 1;
            if (randList.indexOf(rand_i) === -1) {
                randList.push(rand_i);
            }
        }
        return randList;
    }

    function arrayhasUniqueValues(array) {
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array.length; j++) {
                if (i !== j) {
                    if (array[i] === array[j]) {
                        return false; 
                    }
                }
            }
        }
        return true; 
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
	
	return {
		/**
		 * Get the singleton instance. Only one instance is allowed.
		 * The method will either create an instance or will return
		 * the already existing instance.
		 *
		 * @param {[type]} config [description]
		 * @returns {[type]} [description]
		 */
		getInstance: function( config ) {
			if ( !_instance ) {
				_instance = init( config );
			}
			return _instance;
		}
	};
} )( jQuery );
