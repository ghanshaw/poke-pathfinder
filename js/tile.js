var Tile = function(floor, row, col) {
    this.floor = floor.id;
    this.row = row;
    this.col = col;
    this.id = [this.floor,this.row,this.col].toString();
    this.ladder = false;
    this.ladderId = null;
    this.type = 'LAND';
    this.orientation = null;
}

