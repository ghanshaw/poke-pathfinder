pokemonApp.service('pokeGame', function($log, $document, $window, $location, $timeout, $interval) {
    
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
    
    // Indicate whether view has fully loaded
    // Set by Gameboy and Monitor controllers respectively
    this.hasViewLoaded = function() {
        return this.viewLoaded;
    };  
    
    // Access User Console Controller Scope
    // Wrap in timeout to retrieve after all controllers and directives have loaded
    var userConsoleScope;
    $timeout(function() {
        userConsoleScope = angular.element('.side-panel').scope();
    }, 0);
    
    // Object to manage active view
    this.views = {
        active: 'gameboy'
    };
    
    // Get this value (for inside of game loop)
    var that = this;
    
    // Run game loop
    var gameLoop = function() {
        
        // Check that spritesheet and view have both loaded
        if (game.hasSpriteSheetLoaded() &&
                that.hasViewLoaded()) {
            
            let start_time = performance.now();
            
            // ----- Update View in Game ----- //
            
            let path = $location.path();
            if (path === '/monitor/') {
                that.views.active = 'monitor';
                game.setView('monitor');
            } else {
                that.views.active = 'gameboy';
                game.setView('gameboy');
            }
            
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
            //$log.log('Loop Time: ' +  total_time);
        }
        
        window.requestAnimationFrame(gameLoop);
    };
    
    // Start game loop
    window.requestAnimationFrame(gameLoop);

});