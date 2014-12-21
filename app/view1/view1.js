'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'LifeCntl'
  });
}])
.controller('LifeCntl', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

    $scope.newGame = function () {
    	$scope.history = [];
        $scope.board = init($scope.height, $scope.width);
    };

    var stop;
    $scope.runGame = function () {
    	if ($scope.runState == "Run") {
    		$scope.runState = "Pause"
	    	stop = $interval(function() {
	    		$scope.next();
	    	}, 1000/$scope.stepsPerSecond);
	    }
	    else {
	    	$scope.runState = "Run";
	    	$interval.cancel(stop);
	    }
    };

    $scope.next = function () {
    	$scope.history.push($scope.board);
        $scope.board = computeNext($scope.board);
    };

    $scope.step = function () {
    	if ($scope.runState == "Pause") {
    		$scope.runState = "Run";
    		$interval.cancel(stop);
    	}
    	$scope.next();
    };

    $scope.revert = function (index) {
    	if ($scope.runState == "Pause") {
    		$scope.runState = "Run";
    		$interval.cancel(stop);
    	}
        $scope.board = $scope.history[index];
        $scope.history = $scope.history.slice(0, index);
    };
    
    $scope.toggle = function (row, cell) {
    	if ($scope.runState == "Pause") {
    		$scope.runState = "Run";
    		$interval.cancel(stop);
    	}
    	$scope.history = [];
        $scope.board[row][cell] = !$scope.board[row][cell];
    };

    $scope.cellClass = function (row, cell) {
        if (willDie($scope.board, row, cell)) {
            return "die";
        }
        if (newCell($scope.board, row, cell)) {
            return "new";
        }
        return "";
    };

    $scope.height = 10;
    $scope.width = 20;
    $scope.stepsPerSecond = 5;
    $scope.runState = "Run";
    $scope.newGame();
    
    function init(height, width) {
        var board = [];
        for (var h = 0 ; h < height ; h++) {
            var row = [];
            for (var w = 0 ; w < width ; w++) {
                row.push(false);
            }
            board.push(row); 
        }
        return board;
    }
    
    function computeNext(board) {
        var newBoard = [];
        var totalAlive = 0;
        for (var r = 0 ; r < board.length ; r++) {
            var newRow = [];
            for (var c = 0 ; c < board[r].length ; c++) {
            	var cell = (willLive(board, r, c) || newCell(board, r, c));
                newRow.push(cell);

                if (cell) {totalAlive++;}
            }
            newBoard.push(newRow); 
        }
        if (totalAlive == 0){
        	if ($scope.runState == "Pause") {
	    		$scope.runState = "Run";
	    		$interval.cancel(stop);
	    	}
        }
        return newBoard;
    }
    
    function willLive(board, row, cell) {
        return cellAt(board, row, cell) 
            && neighbours(board, row, cell) >= 2 
            && neighbours(board, row, cell) <= 3;
    }
    function willDie(board, row, cell) {
        return cellAt(board, row, cell) 
        && (neighbours(board, row, cell) < 2 
                || neighbours(board, row, cell) > 3);
    }
    function newCell(board, row, cell) {
        return !cellAt(board, row, cell) 
            && neighbours(board, row, cell) == 3;
    }
    
    function neighbours(board, row, cell) {
        var n = 0;
        n += cellAt(board, row-1, cell-1) ? 1 : 0;
        n += cellAt(board, row-1, cell+0) ? 1 : 0;
        n += cellAt(board, row-1, cell+1) ? 1 : 0;
        n += cellAt(board, row+0, cell-1) ? 1 : 0;
        n += cellAt(board, row+0, cell+1) ? 1 : 0;
        n += cellAt(board, row+1, cell-1) ? 1 : 0;
        n += cellAt(board, row+1, cell+0) ? 1 : 0;
        n += cellAt(board, row+1, cell+1) ? 1 : 0;
        return n;
    }
    
    function cellAt(board, row, cell) {
        return (row >= 0   && row < board.length &&
                cell >= 0  && cell < board[row].length &&
                board[row][cell]);
    }
}]);