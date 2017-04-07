var Map = function(map_data) {
    
    this.floors = {}
    this.sprite = null;
    this.map_data = map_data;
    
}

Map.prototype.addFloor = function(floor) {
    if (!this.floors.hasOwnProperty(floor.id)) {
        this.floors[floor.id] = floor;
    }
}

Map.prototype.getTile = function(floor, row, col) {
    
    if (this.floors.hasOwnProperty(floor.id)) {
        console.error('Missing floor');
        return null
    }
    
    var floor = this.floors[floor_id];
    return floor.getTile(row, col);
    
}

Map.prototype.updateLadders = function() {
    var map_ladders = {}
    
    for (let f in this.floors) {
        
        // Ladders on floor f
        let ladders = this.floors[f].floor_data.ladders();
        
        // Loop through ladders
        for (let l of ladders) {
            
            // Create array of tiles if neccessary
            if (!map_ladders.hasOwnProperty(l.id)) {
                map_ladders[l.id] = []
            }
            
            // Get ladder's tile
            let row =  l.tile[0];
            let col =  l.tile[1];
            
            // Add tile to map's ladder object
            map_ladders[l.id].push([this.floors[f].id, row, col].toString()); 
        }
        
    }
    
    this.ladders = map_ladders;
    console.log(this.ladders);
    
}

Map.prototype.updateMap = function() {
    
    var map_data = this.map_data;
    
    this.keyTiles = map_data.keyTiles();
    
}

Map.prototype.updateGraph = function(graph) {
    
    
    for (f in this.floors) {
        this.floors[f].updateGraph(graph);
    }
    
    // Link ladders
    for (l in this.ladders) {
        let ladder = this.ladders[l];
        graph.addEdge(ladder[0], ladder[1]);   
        graph.addEdge(ladder[1], ladder[0]);
    }

    console.log(graph);
        
}

Map.prototype.drawMap = function(graph) { 
    
    for (let f in this.floors) {
        this.floors[f].initCanvas();
        this.floors[f].createBitmapRockLayer();
        this.floors[f].createBitmapFloorLayer();
        
        
        this.floors[f].createGraphicRockLayer();
        this.floors[f].createGraphicFloorLayer();
        this.floors[f].createGraphicKeyTiles();
        this.floors[f].createGraphicRowsCols();
        this.floors[f].createGraphicEdges(graph);
        
        
        this.floors[f].drawBitmapRockLayer();
        this.floors[f].drawBitmapFloorLayer();
//        this.floors[f].drawGraphicRockLayer();
//        this.floors[f].drawGraphicFloorLayer();
        this.floors[f].drawGraphicRowsCols();
        this.floors[f].drawGraphicKeyTiles();
//        this.floors[f].drawGraphicEdges();
        
    }   
    
    //this.createKeyTiles();
    
}


Map.prototype.drawGraphicLayers = function() {
   
    for (let f in this.floors) {   
        this.floors[f].drawGraphicRockLayer();
        this.floors[f].drawGraphicFloorLayer(); 
    }
};


Map.prototype.drawBitmapLayers = function() {
   
    for (let f in this.floors) {      
        this.floors[f].drawBitmapRockLayer();
        this.floors[f].drawBitmapFloorLayer();
    }
};


Map.prototype.drawGraphicRowsCols = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawGraphicRowsCols();
    }
    
};


