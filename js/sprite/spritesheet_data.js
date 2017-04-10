var spritesheet_data = (function() {
    
    var imgId = 'spritesheet';
    
    var rows = 12;
    var cols = 11;
    

    var player = 
        {
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

                surf: {
                    DOWN: {
                        UP: {},
                        DOWN: {},
                    },
                    UP: {
                        UP: {},
                        DOWN: {},
                    },
                    LEFT: {
                        UP: {},
                        DOWN: {},
                    },
                    RIGHT: {
                        UP: {},
                        DOWN: {},
                    },
                },
                
//                ANIMATION: {
//                    WALK: {
//                        DOWN: [WALK.DOWN.RIGHT, WALK.DOWN.STRAIGHT, WALK.DOWN.LEFT, WALK.DOWN.STRAIGHT],
//                        UP: [WALK.UP.RIGHT, WALK.UP.STRAIGHT, WALK.UP.LEFT, WALK.UP.STRAIGHT],
//                        LEFT: [WALK.LEFT.RIGHT, WALK.LEFT.STRAIGHT, WALK.LEFT.LEFT, WALK.LEFT.STRAIGHT],
//                        RIGHT: [WALK.RIGHT.RIGHT, WALK.RIGHT.STRAIGHT, WALK.RIGHT.LEFT, WALK.RIGHT.STRAIGHT]
//                    }
//                },
                    
                
            }
        };

    var girl = {};

    var pokemon = {};

    var dust = {};
    
    return {
        imgId: function() {
            return imgId;
        },
        rows: function() {
            return rows;
        },
        player: function() {
            return player;
        }
    }

})();