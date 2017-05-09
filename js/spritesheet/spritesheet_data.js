var spritesheet_data = (function() {
    
    var imgId = 'color-spritesheet';
    var bwImgId = 'bw-spritesheet';
    
    
    var cols = 12;
    var rows = 10;
    
    
    var player = {
        BOY: {
            WALK: {
                DOWN: {
                    LEFT: [0, 0],
                    STRAIGHT: [0, 1],
                    RIGHT: [0, 2],
                },
                UP: {
                    LEFT: [0, 3],
                    STRAIGHT: [0, 4],
                    RIGHT: [0, 5],
                },
                LEFT: {
                    LEFT: [0, 6],
                    STRAIGHT: [0, 7],
                    RIGHT: [0, 8],
                },
                RIGHT: {
                    LEFT: [0, 9],
                    STRAIGHT: [0, 10],
                    RIGHT: [0, 11],
                },
            }, 
            
            RUN: {
                DOWN: {
                    LEFT: [1, 0],
                    STRAIGHT: [1, 1],
                    RIGHT: [1, 2],
                },
                UP: {
                    LEFT: [1, 3],
                    STRAIGHT: [1, 4],
                    RIGHT: [1, 5],
                },
                LEFT: {
                    LEFT: [1, 6],
                    STRAIGHT: [1, 7],
                    RIGHT: [1, 8],
                },
                RIGHT: {
                    LEFT: [1, 9],
                    STRAIGHT: [1, 10],
                    RIGHT: [1, 11],
                },
            },  
            
            SURF: {
                DOWN: {
                    UP: [2, 0],
                    DOWN: [2, 1],
                },
                UP: {
                    UP: [2, 2],
                    DOWN: [2, 3],
                },
                LEFT: {
                    UP: [2, 4],
                    DOWN: [2, 5],
                },
                RIGHT: {
                    UP: [2, 6],
                    DOWN: [2, 7],
                },
            },
            
            JUMP: {
                DOWN: {
                    STRAIGHT: [2, 8],
                },
                UP: {
                    STRAIGHT: [2, 9],
                },
                LEFT: {
                    STRAIGHT: [2, 10],
                },
                RIGHT: {
                    STRAIGHT: [2, 11],
                },
            },
        },
        
        GIRL: {
            WALK: {
                DOWN: {
                    LEFT: [3, 0],
                    STRAIGHT: [3, 1],
                    RIGHT: [3, 2],
                },
                UP: {
                    LEFT: [3, 3],
                    STRAIGHT: [3, 4],
                    RIGHT: [3, 5],
                },
                LEFT: {
                    LEFT: [3, 6],
                    STRAIGHT: [3, 7],
                    RIGHT: [3, 8],
                },
                RIGHT: {
                    LEFT: [3, 9],
                    STRAIGHT: [3, 10],
                    RIGHT: [3, 11],
                },
            }, 
            
            RUN: {
                DOWN: {
                    LEFT: [4, 0],
                    STRAIGHT: [4, 1],
                    RIGHT: [4, 2],
                },
                UP: {
                    LEFT: [4, 3],
                    STRAIGHT: [4, 4],
                    RIGHT: [4, 5],
                },
                LEFT: {
                    LEFT: [4, 6],
                    STRAIGHT: [4, 7],
                    RIGHT: [4, 8],
                },
                RIGHT: {
                    LEFT: [4, 9],
                    STRAIGHT: [4, 10],
                    RIGHT: [4, 11],
                },
            },   
            
            SURF: {
                DOWN: {
                    UP: [5, 0],
                    DOWN: [5, 1],
                },
                UP: {
                    UP: [5, 2],
                    DOWN: [5, 3],
                },
                LEFT: {
                    UP: [5, 4],
                    DOWN: [5, 5],
                },
                RIGHT: {
                    UP: [5, 6],
                    DOWN: [5, 7],
                },
            },
            
            JUMP: {
                DOWN: {
                    STRAIGHT: [5, 8],
                },
                UP: {
                    STRAIGHT: [5, 9],
                },
                LEFT: {
                    STRAIGHT: [5, 10],
                },
                RIGHT: {
                    STRAIGHT: [5, 11],
                },
            },
        }
    }
    
    // Surfing pokemon
    var pokemon = {
        DOWN: {
            UP: [6, 0],
            DOWN: [6, 1]
        },
        UP: {
            UP: [6, 2],
            DOWN: [6, 3]
        },
        LEFT: {
            UP: [6, 4],
            DOWN: [6, 5]
        },
        RIGHT: {
            UP: [6, 6],
            DOWN: [6, 7]
        }
    };
    
    var dust = {
        1: [6, 8],
        2: [6, 9],
        3: [6, 10]
    };
   
    
    // Head used for pathfinding
    var head = {
        BOY: {
            DOWN: [7, 0],
            UP: [7, 1],
            LEFT: [7, 2],
            RIGHT: [7, 3],
        },
        GIRL: {
            DOWN: [7, 4],
            UP: [7, 5],
            LEFT: [7, 6],
            RIGHT: [7, 7],
        }
    };
    
   var obstacle = {
        MEWTWO: [8, 0],
        POKEBALL: [8, 1],
        BOULDER: [8, 2]
    };
    
  
    var tile = {
        WATER: {
            0: [9, 0], 
            1: [9, 1], 
            2: [9, 2], 
            3: [9, 3], 
            4: [9, 4], 
            5: [9, 5], 
            6: [9, 6], 
            7: [9, 7] 
        },
        ROCK: {
            0: [9, 8]
        }
    };
    
    // Flags used for designating source and target of pathfinder
    var flag = {
        SOURCE: [10, 0],
        TARGET: [10, 1]
    };


    
    return {
        imgId: function() {
            return imgId;
        },
        rows: function() {
            return rows;
        },
        cols: function() {
            return cols;
        },
        player: function() {
            return player;
        },
        pokemon: function() {
            return pokemon;
        },
        dust: function() {
            return dust;
        },
        obstacle: function() {
            return obstacle;
        },
        head: function() {
            return head;
        },
        flag: function() {
            return flag;
        },
        tile: function() {
            return tile;
        }
    };
    
    
})();