var Tile = function(floor, row, col) {
    this.floorId = floor.id;
    this.floor = floor;
    this.row = row;
    this.col = col;
    this.id = [this.floorId,this.row,this.col].toString();
    this.ladder = false;
    this.ladderId = null;
    this.type = 'LAND';
    this.orientation = null;
}

