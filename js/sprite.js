var Sprite = function() {
    
    this.status = 'STANDING';
    this.start = null;
    this.end = null;
    this.time = {};
    this.dir = {};
    
}


Sprite.prototype.init = function(tile_size) {
    //var img = new Image();
    
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = tempCanvas.height = tile_size;
    
    tempCtx.fillStyle = 'red';
    tempCtx.beginPath();
    tempCtx.arc(tile_size/2, tile_size/2, tile_size/3, 0, Math.PI * 2);
    tempCtx.fill();
    tempCtx.closePath();
    
    this.ctx = tempCtx;
    this.canvas = tempCanvas;
    
}

Sprite.prototype.updateXY = function(x, y) {
    
    this.x = x;
    this.y = y;
    
}

//Sprite.prototype.followPath = function(path) {
//    
//    if (!path) {
//        return;
//    }
//        
//        
//    
//    if (this.status != 'WALKING' && path.index < path.length - 2) {
//        
//        let i = path.index;
//        path.index += 1;
//        this.moveTile(path[i].tile, path[i+1].tile);
//        
//    }
//    
//    
//}



Sprite.prototype.dropTile = function(floor, row, col) {
    
    xy = floor.getXY(row, col);
    this.updateXY(xy.x, xy.y);
    
}







Sprite.prototype.lerp = function(start, end, dir, time) {

    var new_x = start.x + (dir.x * _speed * 1000) * time.delta;
    var new_y = start.y + (dir.y * _speed * 1000) * time.delta;

    console.log(new_x, new_y);

    var a = Math.abs(new_x - start.x);
    var b = Math.abs(end.x - start.x);
    var c = Math.abs(new_y - start.y);
    var d = Math.abs(end.y - start.y);

    console.log(a, b, c, d);

    if (a > b || c > d) {

        new_x = end.x;
        new_y = end.y;

        sprite.status = 'STANDING';
    
    }

    // Update sprite with new positions
    sprite.updateXY(new_x, new_y);
    //that.drawTileBackground();
    
}


