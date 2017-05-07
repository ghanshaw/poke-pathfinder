var pokemonApp = angular.module('pokemonApp', ['ngRoute', 'ngResource', 'ngMessages', 'ngAnimate', 'ngTouch', 'ngSanitize']);

pokemonApp.config(function ($routeProvider, $locationProvider) {
    
    $locationProvider.hashPrefix('');
    
    $routeProvider   
    
    .when('/', {
        templateUrl: 'app/pages/gameboy.html',
        controller: 'gameboyController'
    })
    
    .when('/monitor/',  {
        templateUrl: 'app/pages/monitor.html',
        controller: 'monitorController'     
    })    

    
});



