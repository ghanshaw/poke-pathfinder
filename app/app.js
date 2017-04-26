var pokemonApp = angular.module('pokemonApp', ['ngRoute', 'ngResource', 'ngMessages']);

pokemonApp.config(function ($routeProvider, $locationProvider) {
    
    $locationProvider.hashPrefix('');
    
    $routeProvider   
    
    .when('/',  {
        templateUrl: 'app/pages/monitor.html',
        controller: 'monitorController'     
    })    
    
    .when('/gameboy/', {
        templateUrl: 'app/pages/gameboy.html',
        controller: 'gameboyController'
    })
    
    .when('/cave/', {
        templateUrl: 'app/pages/cave.html',
        controller: 'caveController'
    })
    
    .when('/about/', {
        templateUrl: 'app/pages/about.html',
        controller: 'aboutController'
    });
    
});



