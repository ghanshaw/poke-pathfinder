var Map = function() {
    
    this.floors = {}
    this.sprite = null;
    
}

Map.prototype.addFloor = function(floor) {
    if (this.floors.hasOwnProperty(floor.id)) {
        this.floors[floor.id] = floor;
    }
}

Map.prototype.getTile = function(floor_id, row, col) {
    
    if (this.floors.hasOwnProperty(floor_id)) {
        console.error('Missing floor');
        return null
    }
    
    var floor = this.floors[floor_id];
    return floor.getTile(row, col);
    
}

