var map_data = (function() {
    
    var keyTiles = [ 
        { 
            id: 0,
            name: 'Entrance',
            floor: '1F',
            tile: [20, 32]
        },
        { 
            id: 1,
            name: 'Mewtwo',
            floor: 'BF1',
            tile: [13, 7]
            
        },
        { 
            id: 2,
            name: 'Floor 1 Spot',
            floor: 'F1',
            tile: [9, 6]
            
        },
        { 
            id: 3,
            name: 'Floor 2 Spot',
            floor: 'F2',
            tile: [9, 19]
            
        },
    ]
    
    return {
        keyTiles: function() {
            return keyTiles;
        }
    }
    
})();