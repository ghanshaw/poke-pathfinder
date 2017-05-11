// Add class when element reaches top of window
// Used to fix side panel
pokemonApp.directive('setClassWhenAtTop', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object
    
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
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

// User Console (side panel) directive
pokemonApp.directive('userConsole', function ($window) {
    return {
        restrict: 'A',
        templateUrl: 'app/pages/user-console.html',
        controller: 'userConsoleController',
        link: function (scope, element, attrs) {            
        }
    };
});


// Adds touch start functionality
pokemonApp.directive('touchStartDirective', function ($window, $location) {
    
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            
            element.on('touchstart', function(event) {
                
                event.preventDefault();
                event.stopPropagation();
                
                scope.touchstart = event;
                
                scope.$apply(function() { 
                    // Invoke touchstart
                    scope.$eval(attr.touchStartDirective); 
                });
            });
            
            
            
        }
    };
});

// Adds touch move functionality
pokemonApp.directive('touchMoveDirective', function ($window) {
    
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            
            element.on('touchmove', function(event) {
                
                event.preventDefault();
                event.stopPropagation();
                
                scope.touchmove = event;
                console.log(event);
                
                scope.$apply(function() { 
                    // Invoke touchstart
                    scope.$eval(attr.touchMoveDirective); 
                });
            });            
        }
    };
});


// Adds touch end functionality
pokemonApp.directive('touchEndDirective', function ($window) {
    
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            
            element.on('touchend', function(event) {
                
                event.preventDefault();
                event.stopPropagation();
                
                scope.touchend = event;
                console.log(event);
                
                //console.log(event);
                scope.$apply(function() { 
                    // Invoke touchstart
                    scope.$eval(attr.touchEndDirective); 
                });
            });
            
            
            
        }
    };
});


// Triggers after ng-repeat
// Used to update height of activity log
pokemonApp.directive("repeatEnd", function() {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.repeatEnd);
            }
        }
    };
});