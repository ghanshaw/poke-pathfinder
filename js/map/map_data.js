var map_data = (function() {
    
    var keyTiles = [ 
        { 
            id: 0,
            name: 'Entrance',
            floor: 'F1',
            //tile: ['F1', 2, 33],
            tile: ['F1', 21, 33]
        },
        { 
            id: 1,
            name: 'Mewtwo',
            floor: 'BF1',
            tile: ['BF1', 13, 7]
            
        },
        { 
            id: 2,
            name: 'Floor 1 Spot',
            floor: 'F1',
            tile: ['F1', 9, 6]
            
        },
        { 
            id: 3,
            name: 'Floor 2 Spot',
            floor: 'F2',
            tile: ['F2', 9, 19]
            
        },
    ]
    
    return {
        keyTiles: function() {
            return keyTiles;
        }
    }
    
})();