var spritesheet_data = (function() {
    
    var imgId = 'spritesheet';
    
    var rows = 12;
    var cols = 11;
    
    
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
            
            SURF: {
                DOWN: {
                    UP: [1, 0],
                    DOWN: [1, 1],
                },
                UP: {
                    UP: [1, 2],
                    DOWN: [1, 3],
                },
                LEFT: {
                    UP: [1, 4],
                    DOWN: [1, 5],
                },
                RIGHT: {
                    UP: [1, 6],
                    DOWN: [1, 7],
                },
            },
            
            JUMP: {
                DOWN: {
                    STRAIGHT: [1, 8],
                },
                UP: {
                    STRAIGHT: [1, 9],
                },
                LEFT: {
                    STRAIGHT: [1, 10],
                },
                RIGHT: {
                    STRAIGHT: [1, 11],
                },
            },
        },
        
        GIRL: {
            WALK: {
                DOWN: {
                    LEFT: [2, 0],
                    STRAIGHT: [2, 1],
                    RIGHT: [2, 2],
                },
                UP: {
                    LEFT: [2, 3],
                    STRAIGHT: [2, 4],
                    RIGHT: [2, 5],
                },
                LEFT: {
                    LEFT: [2, 6],
                    STRAIGHT: [2, 7],
                    RIGHT: [2, 8],
                },
                RIGHT: {
                    LEFT: [2, 9],
                    STRAIGHT: [2, 10],
                    RIGHT: [2, 11],
                },
            },   
            
            SURF: {
                DOWN: {
                    UP: [3, 0],
                    DOWN: [3, 1],
                },
                UP: {
                    UP: [3, 2],
                    DOWN: [3, 3],
                },
                LEFT: {
                    UP: [3, 4],
                    DOWN: [3, 5],
                },
                RIGHT: {
                    UP: [3, 6],
                    DOWN: [3, 7],
                },
            },
            
            JUMP: {
                DOWN: {
                    STRAIGHT: [3, 8],
                },
                UP: {
                    STRAIGHT: [3, 9],
                },
                LEFT: {
                    STRAIGHT: [3, 10],
                },
                RIGHT: {
                    STRAIGHT: [3, 11],
                },
            },
        }
    }
    
    // Surfing pokemon
    var pokemon = {
        DOWN: {
            UP: [4, 0],
            DOWN: [4, 1]
        },
        UP: {
            UP: [4, 2],
            DOWN: [4, 3]
        },
        LEFT: {
            UP: [4, 4],
            DOWN: [4, 5]
        },
        RIGHT: {
            UP: [4, 6],
            DOWN: [4, 7]
        }
    };
    
    var dust = {
        1: [4, 8],
        2: [4, 9],
        3: [4, 10]
    };
    
    return {
        imgId: function() {
            return imgId;
        },
        rows: function() {
            return rows;
        },
        player: function() {
            return player;
        },
        pokemon: function() {
            return pokemon;
        },
        dust: function() {
            return dust;
        }
    };
    
    
})();