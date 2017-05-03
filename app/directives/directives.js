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




pokemonApp.directive('view-switcher', function ($window, $location) {
  var $win = angular.element($window); // wrap window object as jQuery object

  return {
    restrict: 'A',
    template: 'view-switcher.html',
    link: function (scope, element, attrs) {
        
        console.info('directive running');
        
        scope.changeView = function(view){
            $location.path(view); // path not hash
        };
        

      
    }
  };
});