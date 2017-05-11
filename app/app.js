var pokemonApp = angular.module('pokemonApp', ['ngRoute', 'ngResource', 'ngMessages', 'ngAnimate', 'ngTouch', 'ngSanitize']);

// Route view based on location path
pokemonApp.config(function ($routeProvider, $locationProvider) {
    
    // Remove hashbang in URL
    $locationProvider.hashPrefix('');
    
    // Use $routeProvider service for routing
    $routeProvider   
    
    .when('/', {
        templateUrl: 'app/pages/gameboy.html',
        controller: 'gameboyController'
    })
    
    .when('/monitor/',  {
        templateUrl: 'app/pages/monitor.html',
        controller: 'monitorController'     
    })    
    
    .otherwise({
      redirectTo: '/'
    });
    
});



