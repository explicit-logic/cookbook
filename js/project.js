
angular.module('cookbook', ['mongolab','filters','ui.bootstrap']).
  config(function($routeProvider) {
     $routeProvider.
      when('/', {controller:ListCtrl, templateUrl:'list.html'}).
      when('/edit/:recipeId', {resolve: {
         modal : ModalCtrl('ModalEdit.html',ModalEditCtrl)
       }
          }).
      when('/recipes/:recipeId', {resolve: {
         modal : ModalCtrl('ModalView.html',ModalViewCtrl)
       }
          }).
      when('/add',{resolve: {
         modal : ModalCtrl('ModalEdit.html',ModalNewCtrl)
       }
          
      }).
      otherwise({redirectTo:'/'});
      
      
  });  
//controls
function ListCtrl($scope, Recipe) {
  $scope.recipes = Recipe.query({"f": "{history:0}"});
}
var ModalCtrl=function(tmpl,ctrl){
    return function($modal, $location){
      var modalInstance = $modal.open({
      templateUrl: tmpl,
      controller:ctrl
    });
    modalInstance.result.then(function () {
        $location.path('/');
    },function(){$location.path('/');});  
    };
};

var ModalEditCtrl = function ($scope, $modalInstance, $routeParams, Recipe) {
var self = this;

  Recipe.get({id: $routeParams.recipeId}, function(recipe) {
    self.original = recipe;
    self.cur=recipe.description;
    $scope.recipe = new Recipe(self.original);
  });
  $scope.isClean = function() {
    return angular.equals(self.original, $scope.recipe);
  };
  $scope.destroy = function() {
    self.original.destroy(function() {
        $modalInstance.close();
    });
  };
  $scope.update=function(){
      self.cur=$scope.recipe.description;
  };
  $scope.current=function(){
      if(self.cur)
      {$scope.recipe.description=self.cur;}
  };
  $scope.show=function(i){
      $scope.recipe.description=$scope.recipe.history[i].description;
};
  $scope.ok = function() {
      var old=self.original.description;
      if(old!==$scope.recipe.description){
      $scope.recipe.history.push({date:new Date(),description:old});
      }  
    $scope.recipe.update(function() {
      $modalInstance.close();
    });
  };
  $scope.cancel = function () {
    $modalInstance.close();
  };
};

var ModalViewCtrl = function ($scope, $modalInstance, $routeParams, Recipe) {
    
  Recipe.get({id:$routeParams.recipeId}, function(recipe) {
     // var r=recipe;
      //r.description='<p>'+r.description.replace(/\n/g, '<br/>')+'</p>';
      $scope.recipe = recipe;
  });
  $scope.cancel = function () {
    $modalInstance.close();
  };
};

var ModalNewCtrl = function ($scope, $modalInstance, Recipe) {

  $scope.recipe={};
   $scope.ok = function() {
     $scope.recipe.created=new Date();
     $scope.recipe.history=[];
     Recipe.save($scope.recipe, function(recipe) {
         console.log(recipe);
        $modalInstance.close();
      });
      
  }
  $scope.cancel = function () {
    $modalInstance.close();
  };
};
// Модуль для облачного хранения данных в - https://mongolab.com
angular.module('mongolab', ['ngResource']).
    factory('Recipe', function($resource) {
      var Recipe = $resource('https://api.mongolab.com/api/1/databases' +
          '/cookbook/collections/recipes/:id',
          { apiKey: '7Q4eVO6aO9x0TLkLOl9QZyI7WdHBUbkF' }, {
            update: { method: 'PUT' }
          }
      );

      Recipe.prototype.update = function(cb) {
        return Recipe.update({id: this._id.$oid},
            angular.extend({}, this, {_id:undefined}), cb);
      };

      Recipe.prototype.destroy = function(cb) {
        return Recipe.remove({id: this._id.$oid}, cb);
      };

      return Recipe;
    });
angular.module('filters', []).
    filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    }).filter('newlines', function(text){
  return text.replace(/\n/g, '<br/>');
});


