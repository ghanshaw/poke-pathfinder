var Sprite = function() { 
    
    
    
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

Sprite.prototype.dropTile = function(floor, row, col) {
    
    xy = floor.getXY(row, col);
    this.updateXY(xy.x, xy.y);
    
}