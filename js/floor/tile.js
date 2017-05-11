// Tile constructor
var Tile = function(floor, row, col) {
    
    // Assign row, column and floor to tile
    this.floorId = floor.id;
    this.floor = floor;
    this.row = row;
    this.col = col;
    
    // Construct tile td
    this.id = [this.floorId,this.row,this.col].toString();
    
    // Indicate tile type and depth-of-field
    this.type = 'LAND';
    this.dof = 'BACKGROUND';
    
    // Flag if tile is a ladder
    this.ladder = false;
    this.ladderId = null;
    
    // Flag if tile is a gap
    this.gap = false;
    this.gapId = null;
    
    // Flag if tile is an obstacle
    this.obstacle = false;
    this.obstacleId = null;
    
    // Flag if tile is a staircase, or 'pre-stairs'
    // 'Pre-stairs' are tiles directly in front of stairs
    this.stairs = false;
    this.prestairs = false;
};

