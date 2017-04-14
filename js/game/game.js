var Game = function() {
    
    /*
     * 
     */
    
    this.algorithm = null;
    //this.state = 
    
    this.USER_INPUT = null;
    this.STATE = null;
    this.ticks = 0;
   
};


Game.prototype.initPlayer = function() {
    
    var player = new Sprite();
    player.initGraphic();
    player.initBitmap();
    
    //player.BitmapSprite(player_sheet);
    
    var entrance = this.keyTiles[0].tile;
    player.setTile(entrance);
    //player.endTile = player.tile;
    
    this.player = player;
    this.player.map = this;
    
};


