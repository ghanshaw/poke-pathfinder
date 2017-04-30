pokemonApp.directive('playerDraggie', function() {
    
    // Directive resides in caveController
    
    var template = `
    <img class="player-draggie" id="player-draggie-boy" src="images/player_draggie_boy.png" alt ng-show="game.getPlayerGender() === 'BOY'">
    <img class="player-draggie" id="player-draggie-girl" src="images/player_draggie_girl.png" alt ng-show="game.getPlayerGender() === 'GIRL'">
    `
    
    return {
        restrict: 'EA',
        //templateUrl: 'sprite-draggable.html',
        template: template,
        //replace: false,
        link: function(scope, elem, attrs) {
                        
            var game = scope.game;
            
            console.log('GENDER IS ' + game.getPlayerGender());
            
            $(elem).css('position', 'absolute');
            $(elem).width(game.getTileSize() * 2);
            $(elem).height(game.getTileSize() * 2);
            
            // Update draggie to position of player
            scope.$watch('player.current', function() {
                
                // Get player top/left offset, update draggie
                var topLeft = game.getPlayerTopLeft();                
                $(elem).css({'top': topLeft.top, 'left': topLeft.left});                
                
            }, true);
            
            // Options for jQuery UI draggable
            var options = {
                addClasses: true,
                cursor: 'crosshair',
                revert: false,    
                
                // When dragging begins
                start: function(event, ui) {
                    
                    if (game.getGameState() === 'NORMAL' && game.getPlayerMoveState() === 'STILL') {
                        game.setGameState('PLAYER DRAG');
                        game.hoverTile.type = 'PLAYER';
                    };
                    
                },
                
                // During drag
                drag: function(event, ui) {
                    // update hovertile to dragger
                    //console.log(scope.map.sprite.MOVE_STATE);
                    
                    if (game.getGameState() === 'PLAYER DRAG') {
                        
                        var position = ui.position;
                        var tile = game.getTileFromPointer(position.top, position.left, 'caveWrapperBackground');
                        
                        if (tile && tile.type !== 'ROCK') { 
                            game.hoverTile.id = tile.id;
                        } else {
                            game.hoverTile.id = null;
                        };
                        
                    }                    
                },
                
                // When drag ends
                stop: function(event, ui) {
                    
                    // Update sprite to hovertile (ie to draggie)
                    if (game.getGameState() === 'PLAYER DRAG') {
                        if (game.hoverTile.id) {
                            var tile = game.getTileFromId(game.hoverTile.id);
                            game.setPlayerTile(tile);
                            game.hoverTile.id = null;
                        }
                        else {
                            var topLeft = game.getPlayerTopLeft();                        
                            $(elem).css({'top': topLeft.top, 'left': topLeft.left});        
                        }
                        
                        game.setGameState('NORMAL');
                    }
                    
                }
            };
            
            // Create jQuery UI draggable
            $(elem).draggable(options);
            
        }
    };
});


pokemonApp.directive('setClassWhenAtTop', function ($window) {
  var $win = angular.element($window); // wrap window object as jQuery object

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        console.info('directive running');
        
      var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
          //offsetTop = element.offset().top; // get element's offset top relative to document
          offsetTop = $('nav.navbar').height();

      $win.on('scroll', function (e) {
        if ($win.scrollTop() >= offsetTop) {
          element.addClass(topClass);
        } else {
          element.removeClass(topClass);
        }
      });
    }
  };
});