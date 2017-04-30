var map_data = (function() {
    
    
    // Define canvas id
    var rocklayer = {
        id:  'rocklayer',
        rows: 120,
        cols: 60
    };

    // Define img id (id for img tag)
    var waterlayer = {
        id: [
            'waterlayer-0',
            'waterlayer-1',
            'waterlayer-2',
            'waterlayer-3',
            'waterlayer-4',
            'waterlayer-5',
            'waterlayer-6',
            'waterlayer-7'
        ],
        rows: 30,
        cols: 60
    };
    
    var transition = {
        id: 'transition',
    };
    
    
    var keyTiles = [ 
        { 
            id: 0,
            name: 'Entrance',
            floor: 'F1',
            //tile: ['F1', 13, 24],
            //tile: ['F1', 2, 33]
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
            //tile: ['F1', 9, 6]
            tile: ['F1', 2, 33]
            
        },
        { 
            id: 3,
            name: 'Floor 2 Spot',
            floor: 'F2',
            tile: ['F2', 9, 19]
            
        }
    ];
    
    
    // Define ladders
    var ladders = [
        {
            id: 0,
            tile: [ ['F1', 2, 10], ['F2', 3, 11] ]
        },
        {
            id: 1,
            tile: [ ['F1', 2, 34], ['F2', 3, 31] ]
        },
        {
            id: 2,
            tile: [ ['F1', 4, 2], ['F2', 5, 3] ]
        },
        {
            id: 3,
            tile: [ ['F1', 7, 1], ['BF1', 7, 5] ]
        },
        {
            id: 4,
            tile: [ ['F1', 15, 5], ['F2', 13, 5] ]
        },
        {
            id: 5,
            tile: [ ['F1', 11, 24], ['F2', 9, 21] ]
        },
        {
            id: 6,
            tile: [ ['F1', 10, 30], ['F2', 8, 24] ]
        }
    ];
    
    
    var gaps = [
        {
            id: 0,
            tile: ['F2', 2, 19]
        },
        {
            id: 1,
            tile: ['F2', 12, 31]
        },
        {
            id: 2,
            tile: ['F2', 6, 2]
        },
//        {
//            id: 3,
//            tile: ['F1', 20, 31]
//        }
        
    ];
    
    
    var obstacles = [
        { 
            id: 0,
            label: 'MEWTWO',
            tile: ['BF1', 12, 7]
        },
        { 
            id: 1,
            label: 'POKEBALL',
            tile: ['F1', 5, 25]
        },
        { 
            id: 2,
            label: 'POKEBALL',
            tile: ['F1', 16, 11]
        },
        { 
            id: 3,
            label: 'BOULDER',
            tile: ['F1', 18, 9]
        },
        { 
            id: 4,
            label: 'BOULDER',
            tile: ['F1', 20, 5]
        },
        { 
            id: 5,
            label: 'BOULDER',
            tile: ['F1', 21, 6]
        },
        { 
            id: 7,
            label: 'BOULDER',
            tile: ['F1', 21, 11]
        },
        { 
            id: 5,
            label: 'BOULDER',
            tile: ['F1', 21, 13]
        },
        { 
            id: 5,
            label: 'BOULDER',
            tile: ['F1', 20, 14]
        }
    ];
     
    
    return {
        rocklayer: function() {
            return rocklayer;
        },
        waterlayer: function() {
            return waterlayer;
        },
        transition: function() {
            return transition;
        },
        keyTiles: function() {
            return keyTiles;
        },
        ladders: function() {
            return ladders;
        },
        gaps: function() {
            return gaps;
        },
        obstacles: function() {
            return obstacles;
        }   
    };
    
})();