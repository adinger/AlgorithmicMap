// TODO: add a legend for each color of category
var map;
var gmarkers = [];
var image = [];
var infowindow;
var maxCountByCategory = {};  // for scaling size of circle. keeps track of maxCount for each category

function initMap() {
  // create the map
  var mapOptions = {
    zoom: 4,
    center: {lat: 38.5000, lng: -98.0000},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // get JSON data and add each place to the gmarkers list
  $.when(
    // chrome settings don't allow loading local files, so i had to upload the following files to a public location
    $.getJSON("https://raw.githubusercontent.com/adinger/GoogleMaps/master/data/city_coordinates.json"),  
    $.getJSON("https://raw.githubusercontent.com/adinger/GoogleMaps/master/data/cities_by_category.json")
  ).done(function (citiesData, categoriesData) {
    var cityCoordinates = JSON.parse(citiesData[2].responseText);
    var citiesByCategory = JSON.parse(categoriesData[2].responseText);

    for (var category in citiesByCategory) {
      cities = citiesByCategory[category];  
      for (var c = 0; c < cities.length; c++) {
        count = cities[c].count;

        // update the maximum count for this category
        if ( !(category in maxCountByCategory) || (count > maxCountByCategory[category]) ) {
          maxCountByCategory[category] = count;
        }
      }

      // add all the cities for this category to the map
      for (var c = 0; c < cities.length; c++) {
        cityObj = cities[c];
        cityName = cityObj.city;
        lat = cityCoordinates[cityName]["lat"];
        lon = cityCoordinates[cityName]["lon"];
        addLocation(cityObj, lat, lon, category);
      }
    }
  });

  // adds the place to the gmarkers list
  function addLocation(cityObj, lat, lon, category) {
    //alert(maxCountByCategory[category]);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      map: map,
      title: cityObj.city,
      icon: getCircle(cityObj.score, category, cityObj.count, maxCountByCategory[category])
    });
    marker.mycategory = category;
    marker.setVisible(false);
    gmarkers.push(marker);
    return 0;
  }

  // shows the marker if it should be shown (helper for boxclick())
  function show(category) {
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i].mycategory == category) 
        gmarkers[i].setVisible(true);
    }
    document.getElementById(category).checked = true;
    $('#'+category).prop('checked', true);
  }

  // hides the marker if it should be hidden (helper for boxclick())
  function hide(category) {
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i].mycategory == category) 
        gmarkers[i].setVisible(false);
    }
    document.getElementById(category).checked = false;
    $('#'+category).prop('checked', false);
  }

  // shows the markers if their category is checked, hides them if unchecked
  function boxclick(box,category) {
    //alert("boxClick(): "+category+" is "+box.prop('checked'));
    if (box.checked || box.prop('checked')) {
      show(category);
    } else {
      hide(category);
    }
  }

  $('.subcategory').click(function (event) {
    boxclick(this, event.target.id);  // the id of the clicked checkbox contains the category name
  });

  cuisines = ["asianfusion","latin","southern","italian","greek","mediterranean"];
  activities = ["scuba", "rafting", "surfing","skydiving","hiking","beaches"];

  // click handlers for the super categories
  $('#allRestaurants').click(function (event) {
    if (this.checked) {
      for ( var c in cuisines ) {
        cuisine = cuisines[c];
        $('#'+cuisine).prop('checked', true);
        $('#'+cuisine).checked = true;
        boxclick($('#'+cuisine), cuisine);
      }
    } else {
      for ( var c in cuisines ) {
        cuisine = cuisines[c];
        $('#'+cuisine).prop('checked', false);
        $('#'+cuisine).checked = true;
        boxclick($('#'+cuisine), cuisine);
      }
    }    
  });

  $('#allOutdoorActivities').click(function (event) {
    if (this.checked) {
      for ( var a in activities ) {
        act = activities[a];
        $('#'+act).prop('checked', true);
        boxclick($('#'+act), act);
      }
    } else {
      for ( var a in activities ) {
        act = activities[a];
        $('#'+act).prop('checked', false);
        boxclick($('#'+act), act);
      }
    }    
  });
} 

jQuery(document).ready(function(){
  initMap();
});

var colors = {  // CSS colors for each category
  "asianfusion":"deepskyblue",
  "latin":"purple",
  "southern":"orchid",
  "italian":"orangered",
  "greek":"lightseagreen",
  "mediterranean":"green",
  "scuba":"deeppink",
  "rafting":"royalblue",
  "surfing":"turquoise",
  "skydiving":"mediumvioletred",
  "hiking":"violet",
  "beaches":"darksalmon"
}

// creates the circle using the magnitude to determine size
function getCircle(score, category, count, maxCount) {
  var circle = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[category],
    fillOpacity: score/8,
    scale: 30*count/maxCount, //Math.pow(2, score) / 2,
    strokeColor: 'white',
    strokeWeight: .5
  };
  return circle;
}
