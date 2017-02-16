var app = angular.module('myApp', ['ngSanitize']);
app.controller('myCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.showStory = false;
    $scope.showHeadLine = true;
    $scope.showImage = true;
    $scope.showSummary = true;

    var categories = [{
            "Name": "News",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=31989&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "International",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=31991&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Technology",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=31992&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Sports",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=31993&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Business",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=31994&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Entertainment",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=32571&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Politics",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=32573&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        },
        {
            "Name": "Strange News",
            "URL": "http://syndication.ap.org/AP.Distro.Feed/GetFeed.aspx?idList=32574&idListType=products&maxItems=1&un=sam&pwd=password&fullContent=true"
        }
    ];
    $scope.categories = categories;
    $scope.changeCategory = function(category) {
        $scope.spinner = true;
        $scope.SelectedCategory = category.Name;
        $http.get(category.URL)
            .success(function(data, status, headers, config) {
                var x2js = new X2JS();
                var jsonOutput = x2js.xml_str2json(data);
                $scope.stories = [];
                $scope.thumbnail = [];
                $scope.story = [];
                $scope.feedEntries = [];
                $scope.entries = jsonOutput.feed.entry;
                $scope.entries.stories = [];
                for (var i = 0; i < $scope.entries.length; i++) {

                    if ($scope.entries[i].content && $scope.entries[i].content.nitf.body["body.content"] &&
                        $scope.entries[i].content.nitf.body["body.content"].block.length > 0) {
                        var string = $.map($scope.entries[i].content.nitf.body["body.content"].block, function(obj) {
                            return obj["hl2"];
                        }).join('\n');
                        $scope.stories[i] = string;
                    } else if ($scope.entries[i].content && $scope.entries[i].content.nitf.body["body.content"] &&
                        $scope.entries[i].content.nitf.body["body.content"].block.p.length > 0) {
                        var story = [];
                        story = $scope.entries[i].content.nitf.body["body.content"].block.p;
                        if (Array.isArray(story)) {
                            $scope.stories[i] = "<p>" + story.join("</p><p>") + "</p>";
                        } else {
                            $scope.stories[i] = story;
                        }
                    }
                }
                for (var i = 0; i < $scope.entries.length; i++) {
                    $scope.entries[i].stories = $scope.stories[i];
                }
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.spinner = false;
                    });
                }, 1000);
            })
            .error(function(data, status, headers, config) {
                alert('There is a problem');
            });
    }
    $scope.changeCategory($scope.categories[0]);
}]);
app.filter('startFrom', function() {
    return function(input, start) {
        if (!input || !input.length) {
            return;
        }
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
app.filter('range', function() {
    return function(val, range) {
        range = parseInt(range);
        for (var i = 0; i < range; i++)
            val.push(i);
        return val;
    };

});
app.animation('.slide-animation', function() {
    return {
        beforeAddClass: function(element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
                var finishPoint = element.parent().width();
                if (scope.direction !== 'right') {
                    finishPoint = -finishPoint;
                }
                TweenMax.to(element, 0.5, {
                    left: finishPoint,
                    onComplete: done
                });
            } else {
                done();
            }
        },
        removeClass: function(element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
                element.removeClass('ng-hide');

                var startPoint = element.parent().width();
                if (scope.direction === 'right') {
                    startPoint = -startPoint;
                }

                TweenMax.fromTo(element, 0.5, {
                    left: startPoint
                }, {
                    left: 0,
                    onComplete: done
                });
            } else {
                done();
            }
        }
    };
});
app.directive('slideDirective', function() {
  return {
    restrict: 'EA',
    scope: {
      entry:'=entry',
      showHeadLine:'=showHeadLine',
      showSummary:'=showSummary',
      showStory:'=showStory',
      showImage:'=showImage'
    },
    templateUrl: '/templates/slide.html',
    link: function ($scope, element) {
      $scope.spinner = true;
      $scope.direction = 'left';
      $scope.currentIndex = 0;
      $scope.currentSlide={};
      $scope.getMedia = function(){
        if(typeof $scope.entry.content.nitf.body['body.content'].media !=='undefined' && typeof $scope.entry.content.nitf.body['body.content'].media['media-reference'] !=='undefined'){
          $scope.currentSlide = $scope.entry.content.nitf.body['body.content'].media && $scope.entry.content.nitf.body['body.content'].media['media-reference'][$scope.currentIndex];
          $scope.mediaList = $scope.entry.content.nitf.body['body.content'].media['media-reference'];
        }else{
          $scope.mediaList =[];
          $scope.currentSlide["_source"]="/images/ap-logo.jpg";
        }
      };

      $scope.$watch("currentIndex", function(){
        $scope.getMedia();
      });

      $scope.setCurrentSlideIndex = function(index) {
          $scope.direction = (index > $scope.currentIndex) ? 'left' : 'right';
          $scope.currentIndex = index;
      };

      $scope.isCurrentSlideIndex = function(index) {
          return $scope.currentIndex === index;
      };

      $scope.prevSlide = function() {
          $scope.direction = 'left';
          $scope.currentIndex = ($scope.currentIndex < $scope.mediaList.length - 1) ? ++$scope.currentIndex : 0;
      };

      $scope.nextSlide = function() {
          $scope.direction = 'right';
          $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.mediaList.length - 1;
      };

    }
  };
});
