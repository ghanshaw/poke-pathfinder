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
    console.log(this.tiles);
}


Floor.prototype.inBounds = function(row, col) {
    return row >= 0 && col >= 0 && row < this.rows && col < this.cols;        
}

Floor.prototype.updateTiles = function(tiles) {
    
    var rocks = tiles.rocks();
    var water = tiles.water();
    
    // Update rock tiles
    for (let i of Object.keys(rocks)) {  
        for (let j of rocks[i]) {
            //console.log(i, j);
            this.tiles[i][j] = 'r'   
        }    
    }
    
    // Update water tiles
    for (let i of Object.keys(water)) {  
        for (let j of water[i]) {
            //console.log(i, j);
            this.tiles[i][j] = 'w'   
        }    
    }
}


Floor.prototype.getType = function(row, col) {
    if (!this.inBounds(row, col)) {
        return null;
    }
    
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

Floor.prototype.createGraph = function(tiles) {
    
    var graph_1F = new Graph();

    // Create graph with tile data
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            vertex = [r, c];
            graph_1F.addNode(vertex);
            
            // Don't add edges to rock tiles
            let type_vertex = this.getType(r, c);
            if (type_vertex === 'rock') {
                continue;
            }
            
            let neighbors = []
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);

            for (let neigh of neighbors) {
                let row = neigh[0];
                let col = neigh[1];
                let type_neigh = this.getType(row, col);
                
                if (this.inBounds(row, col) && type_neigh !== 'rock') {
                    graph_1F.addEdge(vertex, neigh);
                }
            }        
        }
    }
    
    
    
    // Remove egdes between certain tiles
    for (edge of tiles.noEdges()) {
        
        graph_1F.removeEdge(edge[0], edge[1]);
        graph_1F.removeEdge(edge[1], edge[0]);
        
    }
    
    
    
    console.log(graph_1F);
    return graph_1F;
}
            

var _1F_data = function() {
    
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
    
    var noEdges = [
        
        [ [2,24], [3,24] ],
        [ [2,25], [3,25] ],
        [ [2,26], [3,26] ],
        
        [ [4,17], [5,17] ],    
        [ [4,18], [5,18] ],
        [ [4,19], [5,19] ],
        [ [4,20], [5,20] ],
        [ [4,21], [5,21] ],
        [ [4,22], [5,22] ],
        
        [ [6,28], [7,28] ],    
        [ [6,29], [7,29] ],
        [ [6,30], [7,30] ],
        [ [6,31], [7,31] ],
        [ [6,32], [7,32] ],
        [ [6,33], [7,33] ],
        
        [ [13,12], [14,12] ],    
        [ [13,13], [14,13] ],
        [ [13,14], [14,14] ],
        [ [13,15], [14,15] ],

        [ [15,20], [16,20] ],    
        [ [15,21], [16,21] ],
        [ [15,22], [16,22] ],
        
    ]
    
    return {  
        rocks: function() {
            return rocks;   
        },
        
        water: function() {
            return water;
        },   
        
        noEdges: function() {
            return noEdges;
        }
    }
    
}
    
$(document).ready(function() {
    
    // Create Floor object to represent 1st Floor
    var _1F = new Floor('1F', 21, 38);
    var _1F_tiles = _1F_data();
    _1F.updateTiles(_1F_tiles);
        
    // Create Graph object, add 1st Floor
    var graph_1F = _1F.createGraph(_1F_tiles);

        
        
        
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 570;
    canvas.height = 315;
    ctx.fillStyle = 'white';

    var cellSize = {};
    cellSize['width'] = canvas.width / _1F.cols;
    cellSize['height'] = canvas.height / _1F.rows;

    //ctx.fillRect(0, 0, cellSize['width'], cellSize['height']);
    //ctx.fillStyle = 'white';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';

    console.log(cellSize);
    
    ctx.beginPath();
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
            
            ctx.strokeStyle = 'purple';
            
            let x = c*cellSize['width'];
            let y = r*cellSize['height'];
            ctx.fillRect(x, y, cellSize['width'], cellSize['height']); 
            ctx.strokeRect(x, y, cellSize['width'], cellSize['height']);
            
            ctx.strokeStyle = 'red';
            
            if (r == 20 && c == 32) {
                console.log('freeze');   
            }
            
            // Draw dots to represent edges
            // Mostly for debugging purposes
            nodeV = graph_1F.getNode([r,c]);
            for (let e of nodeV.edges) {
                let dot_y = e.cell.row;
                let dot_x = e.cell.col;
                
                dot_x = dot_x*cellSize['width'];
                dot_y = dot_y*cellSize['height'];
                
                if (dot_y > y) { }
                else if (dot_y == y) { dot_y += ((.5) * cellSize['height']); }
                else if (dot_y < y) { dot_y += cellSize['height']; }
                
                if (dot_x > x) { }
                else if (dot_x == x) { dot_x += ((.5) * cellSize['width']); }
                else if (dot_x < x) { dot_x += cellSize['width']; }
                
//                
//                let x = ;
//                let y = ;
                
                ctx.moveTo(dot_x, dot_y);
                ctx.arc(dot_x, dot_y, 1, 0, Math.PI * 2, true);
                ctx.stroke();
            }
        }
    }
    
    
    target = [12, 23]
    
    bfs(graph_1F, [20,32], target);
    
    tNode = graph_1F.getNode(target);
    
    while (tNode) {
        
        ctx.fillStyle = 'pink';
        let x = tNode.cell.col*cellSize['width'];
        let y = tNode.cell.row*cellSize['height'];
        ctx.fillRect(x, y, cellSize['width'], cellSize['height']); 
        tNode = tNode.parent;
        
    }     

});


