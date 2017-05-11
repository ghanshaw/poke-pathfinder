pokemonApp.service('pokeGame', function($log, $document, $window, $location, $timeout, $interval) {
    
    $log.info('*** pokeGame service has begun.');
    
    /* -------------------- //
    Create game object
    // -------------------- */
    
    // Initialize a new Game object
    var game = new Game();
    game.initGame();
    this.game = game;
    
    // Expose User Console to service
    this.userConsole = game.userConsole;
    
    // Function to manually set the view in the game
    this.setView = function(view) {
        game.setView(view);
    };
    
    // Access User Console Controller Scope
    var userConsoleScope;
    angular.element(document).ready(function () {       
        userConsoleScope = angular.element('.user-console-wrapper').scope();
    });
    
    // Get this value (for inside of game loop)
    var that = this;
    
    // Run game loop
    var gameLoop = function() {
        
        // If view has finished loading
        if (that.viewLoaded) { 
            
            let start_time = performance.now();
            
            // ----- Update User Console Settings ----- // 
            game.userConsole.updateSettings();
            if (userConsoleScope) {
                userConsoleScope.$apply();
            }
            
            // ----- Update Game ----- // 
            game.updateGame();
            
            // ----- Render Game ----- // 
            game.renderGame();
            
            // ----- Iterate Ticks ----- // 
            game.ticks++;
            
            
            let end_time = performance.now();

            let total_time = end_time - start_time;
            if (total_time > 6) {
                //$log.info('Loop Time is over 6ms ' + total_time);
            }
            //$log.log('Loop Time: ' +  time.total_time);
        }
        
        window.requestAnimationFrame(gameLoop);
    };
    
    // Start game loop
    window.requestAnimationFrame(gameLoop);

});