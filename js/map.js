var Floor = function(id, rows, cols) {
    this.id = id;
    this.rows = rows;
    this.cols = cols;
    
    // Initialize all the tiles with a type of 'l' (land)
    this.tiles = new Array(this.rows);
    for (let row = 0; row < this.rows; row++){
        this.tiles[row] = new Array(this.cols)
        for (let col = 0; col < this.cols; col++) {
            this.tiles[row][col] = 'l'
        }        
    }
    
}


Floor.prototype.inBounds = function(row, col) {
    return = row >= 0 && col >= 0 && row < this.rows && col < this.cols;        
}

Floor.prototype.updateTiles = function(tiles) {
    
    var rocks = tiles.rocks();
    var water = tiles.water();
    
    // Update rock tiles
    for (let i of Object.keys(rocks)) {  
        for (let j of rocks[i]) {
            //console.log(i, j);
            f1[i][j] = 'r'   
        }    
    }
    
    // Update water tiles
    for (let i of Object.keys(water)) {  
        for (let j of water[i]) {
            //console.log(i, j);
            f1[i][j] = 'w'   
        }    
    }
}


Floor.prototype.getType = function(row, col) {
    
    switch (this.tiles[row][col]) {
            
        case 'w':
            return 'water';
        case 'l':
            return 'land';
        case 'r':
            return 'rock';
        default:
            return null

    }
}

Floor.prototype.createGraph = function() {
    
    var graph_1F = new Graph();

    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            vertex = [r, c];
            graph_1F.addNode(vertex);

            let neighbors = []
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);

            for (let neigh of neighbors) {
                let row = neigh[0]
                let col = neigh[1]
                if (inBounds(row, col, dim)) {
                    graph_1F.addEdge(vertex, neigh);
                }
            }        
        }
    }
    
    console.log(graph_1F);
}
            

var _1F_tiles = function() {
    
    // Define obstacles    
    var rocks = {
        0:  [0, 1, 2, 3, 4, 5, 9, 10, 12,13, 14, 15, 16, 17, 18, 19, 20, 30, 33, 34, 37],
        1:  [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 37],
        2:  [0, 1, 2, 3, 4, 5, 8, 9, 12, 30, 37],
        3:  [0, 2, 3, 4, 5, 8, 9, 12, 23, 27, 30, 31, 33, 34, 35, 36, 37],
        4:  [0, 2, 12, 23, 27],
        5:  [2, 7, 8, 12, 16, 27],
        6:  [2, 7, 8, 12, 16, 27],
        7:  [2, 7, 8, 12, 16, 34],
        8:  [0, 1, 2, 7, 8, 10, 11, 12, 16, 20, 21, 22, 23, 24, 25, 29, 34],
        9:  [0, 2, 7, 11, 12, 16,20, 21, 22, 23, 24, 25, 26, 34],
        10: [0, 7, 11, 12, 16, 17, 19, 20, 21,25, 26, 34],
        11: [0, 7, 16, 21, 25, 26, 30, 31, 32, 33, 34],
        12: [0, 7, 16, 19, 21, 22, 24, 25, 26, 30, 31, 32],
        13: [0, 3, 4, 7, 16, 26, 30],
        14: [0, 3, 7, 11, 16, 17, 24, 25, 26, 30, 36, 37],
        15: [0, 7, 11, 16, 17, 18, 19, 23, 24, 25, 26, 30, 34, 35, 36, 37],
        16: [0, 7, 11, 30, 34, 35, 36, 37],
        17: [0, 1, 2, 3, 5, 6, 7, 11, 12, 14, 30, 34, 35, 36, 37],
        18: [0, 1, 2, 3, 14, 30, 34, 35, 36, 37],
        19: [0, 1, 2, 3, 14, 30, 34, 35, 36, 37],
        20: [0, 1, 2, 3, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34, 35, 36, 37],        
    }
    
    var water = {
        0:  [21, 22, 23, 24, 25, 26, 27, 28, 29],
        1:  [21, 22, 23, 24, 25, 26, 27, 28, 29],
        2:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        3:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        4:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        5:  [13, 14, 15, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        6:  [13, 14, 15, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        7:  [13, 14, 15, 35, 36, 37],
        8:  [13, 14, 15, 35, 36, 37],
        9:  [8, 9, 10, 13, 14, 15, 35, 36, 37],
        10: [8, 9, 10, 13, 14, 15, 35, 36, 37],
        11: [8, 9, 10, 11, 12, 13, 14, 15, 35, 36, 37],
        12: [8, 9, 10, 11, 12, 13, 14, 15],
        13: [8, 9, 10, 11, 12, 13, 14, 15],
        14: [8, 9, 10],
    }
    
    return {  
        rocks: function() {
            return rocks;   
        },
        
        water: function() {
            return water;
        }   
    }
    
}
    
    
var _1F = new Floor('1F', 21, 38);
_1F.updateTiles(_1F_tiles);
_1F.createGraph();

canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
canvas.width = 570;
canvas.height = 315;
ctx.fillStyle = 'white';

var cellSize = {};
cellSize['width'] = canvas.width / dim.cols;
cellSize['height'] = canvas.height / dim.rows;

//ctx.fillRect(0, 0, cellSize['width'], cellSize['height']);
//ctx.fillStyle = 'white';
//ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'black';

console.log(cellSize);

for (let r = 0; r < _1F.rows; r++) {
    for (let c = 0; c < _1F.cols; c++) {
        
        let type = _1F.getType(r, c);
        
        if (type === 'land') {
           ctx.fillStyle = '#ccc';
        }

        if (type == 'rock') {
           ctx.fillStyle = '#4CAF50';
        }

        if (type == 'water') {
           ctx.fillStyle = '#337ab7';
        }

       ctx.fillRect(c*cellSize['width'], r*cellSize['height'], cellSize['width'], cellSize['height']); 

    }
}



