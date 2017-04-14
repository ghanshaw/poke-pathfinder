pokemonApp.directive('spriteDraggable', function() {
    
    // Directive resides in userController
    
    var template = `
    <img class="drag-icon" ng-class="{'show-drag-icon': showDragIco}" id="tiny-player-boy" src="images/tiny_player_boy.png" alt ng-show="playerOptions.GENDER === 'BOY'">
    <img class="drag-icon" ng-class="{'show-drag-icon': showDragIco}" id="tiny-player-girl" src="images/tiny_player_girl.png" alt ng-show="playerOptions.GENDER === 'GIRL'">
    `
  
    
    
    return {
        restrict: 'EA',
        //templateUrl: 'sprite-draggable.html',
        template: template,
        //replace: false,
        link: function(scope, elem, attrs) {
            
            console.log(elem);
            console.log(scope.GENDER);
            
            $(elem).css('position', 'absolute');
            $(elem).width(scope.map.sprite.tile.floor.tile_size * 2);
            $(elem).height(scope.map.sprite.tile.floor.tile_size * 2);
            
            
            
            // Update sprite draggable
            scope.$watch('sprite', function(oldValue, newValue) {
                
                // Update dragger to sprite 
                var topLeft = scope.map.getSpriteTopLeft();                
                $(elem).css({'top': topLeft.top, 'left': topLeft.left});                
                
            }, true);
            
            var options = {
                addClasses: true,
                cursor: 'crosshair',
                revert: false,    
                start: function(event, ui) {
                    
                    if (scope.map.sprite.MOVE_STATE === 'STILL') {
                        scope.map.sprite.MOVE_STATE = 'USER MOVE';
                    };
                    
                },
                drag: function(event, ui) {
                    // update hovertile to dragger
                    console.log(scope.map.sprite.MOVE_STATE);
                    
                    if (scope.map.sprite.MOVE_STATE === 'USER MOVE') {
                    
                        var position = ui.position;
                        var tile = scope.map.getTileFromPointer(position.top, position.left);

                        if (tile && tile.type !== 'ROCK') {
                            scope.map.hoverTile = tile.id;
                        } else {
                            scope.map.hoverTile = null;
                        };
                    }                    
                },
                stop: function(event, ui) {
                    
                    // update sprite to hovertile (ie to dragger)
                    if (scope.map.sprite.MOVE_STATE === 'USER MOVE') {
                        if (scope.map.hoverTile) {
                            var tile = scope.map.getTileFromId(scope.map.hoverTile);
                            scope.map.sprite.setTile(tile);
                            scope.map.hoverTile = null;
                        }
                        else {
                            var topLeft = scope.map.getSpriteTopLeft();                        
                            $(elem).css({'top': topLeft.top, 'left': topLeft.left});        
                        }
                        
                        scope.map.sprite.MOVE_STATE = 'STILL';
                    }
                    
                    
                },
                
            };
            
            $(elem).draggable(options);
            
        }
    };
});