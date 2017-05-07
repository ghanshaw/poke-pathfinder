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

pokemonApp.directive('userConsole', function ($window) {
    return {
        restrict: 'A',
        templateUrl: 'app/pages/user-console.html',
        controller: 'userConsoleController',
        link: function (scope, element, attrs) {
            console.info('directive running');
        
        }
    };
});


pokemonApp.directive('sidebarDrawer', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
        
            //element.bind('click');
        
            console.log('clicked menu button!');
            //  x.classList.toggle("change");
            $('.side-bar').toggleClass('console-open');
            $('.side-bar').toggleClass('console-closed');
        
            angular.element(element).onClick;
        
        
            console.log('sidebar directive!');
        
            //      var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
            //          //offsetTop = element.offset().top; // get element's offset top relative to document
            //          offsetTop = $('nav.navbar').height();
            //
            //      $win.on('scroll', function (e) {
            //        if ($win.scrollTop() >= offsetTop) {
            //          element.addClass(topClass);
            //        } else {
            //          element.removeClass(topClass);
            //        }
            //      });
      
      
        }
    };
});




pokemonApp.directive('touchStartDirective', function ($window, $location) {

    return {
        restrict: 'A',
        link: function (scope, element, attr) {
        
            element.on('touchstart', function(event) {
                
                event.preventDefault();
                event.stopPropagation();

                scope.touchevent = event;

                //console.log(event);
                scope.$apply(function() { 
                    // Invoke touchstart
                    scope.$eval(attr.touchStartDirective); 
                });
            });
        

      
        }
    };
});

pokemonApp.directive('touchMoveDirective', function ($window) {

    return {
        restrict: 'A',
        link: function (scope, element, attr) {
        
            element.on('touchmove', function(event) {
                
                event.preventDefault();
                event.stopPropagation();
                
                scope.touchevent = event;

                //console.log(event);
                scope.$apply(function() { 
                    // Invoke touchstart
                    scope.$eval(attr.touchMoveDirective); 
                });
            });
        

      
        }
    };
});


pokemonApp.directive('touchEndDirective', function ($window, $location) {

    return {
        restrict: 'A',
        link: function (scope, element, attr) {
        
            element.on('touchend', function(event) {
                
                event.preventDefault();
                event.stopPropagation();

                scope.touchevent = event;

                scope.$apply(function() { 
                    // Invoke touchend
                    scope.$eval(attr.touchEndDirective); 
                });
            });
        

      
        }
    };
});


pokemonApp.directive("repeatEnd", function(){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.repeatEnd);
            }
        }
    };
});