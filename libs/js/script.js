// ---------------------------------------------------------
// GLOBAL DECLARATIONS
var cities = null;
// Creates a cityMarker with the city icon
var cityMarkers = L.ExtraMarkers.icon({
  icon: 'fa-light fa-city',
  markerColor: 'green-dark',
  shape: 'circle',
  prefix: 'fa'
});


var map;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite,

};
let overlays = {
  Cities: cityMarkers
};




//preloader 
$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $("#preloader").remove();
      });
  }
});

// initialise and add controls once DOM is ready

$(document).ready(function () {
  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon
  
  // layer control
  let layerControl = L.control.layers(basemaps).addTo(map);
  
  //buttons
  var infoBtn = L.easyButton("fa-circle-info fa-xl", function (btn, map) { 
    if ($('#countrySelect').val()==='') {
   
      alert("Please Select a Country");
    } else {
    $("#countryInfo").modal("show");
    
    }
  },"Country Info");
  var wikiInfo = L.easyButton("fa-brands fa-wikipedia-w fa-xl", function (btn, map) {
    if ($('#countrySelect').val()==='') {
     
      alert("Please Select a Country");
    } else {
    $("#countryWikiLinks").modal("show");
    }
  }, "Wikipedia Links");
  
  var currencyInfo = L.easyButton("fa-solid fa-dollar-sign fa-xl", function (btn, map) {
    if ($('#countrySelect').val()==='') {
     
      alert("Please Select a Country");
    } else {
    $("#currencyInfo").modal("show");
    }
  }, "Currency");
  
  var newsInfo = L.easyButton("fa-solid fa-newspaper fa-xl", function (btn, map) {
    if ($('#countrySelect').val()==='') {
     
      alert("Please Select a Country");
    } else {
    $("#newsInfo").modal("show");
    }
  }, "News");
  
  var weatherInfo = L.easyButton("fa-solid fa-cloud-sun-rain fa-xl", function (btn, map) {
    
    if ($('#countrySelect').val()==='') {
     
      alert("Please Select a Country");
    } else {
    $("#weatherInfo").modal("show");
    }
  }, "Weather");

  infoBtn.addTo(map);
  wikiInfo.addTo(map);
  currencyInfo.addTo(map);
  newsInfo.addTo(map);
  weatherInfo.addTo(map);
  getUserLocation();

})
 // set User's current country as default
 const getUserLocation= ()=>{
   if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((position)=>
    {  const lat= position.coords.latitude;
       const long= position.coords.longitude;
       // console.log(lat,long);
        getCountryName(lat, long);

    },
    (error) => {
        console.error("Error getting location:", error.message);
    }

  )

   }else {
    alert('Please turn on your location access.')
   }
 };

 // API to get country name on the basis of latitude and Longitude fetched by Navigator API
  const getCountryName=(lat, long)=>{
    $.ajax({
      type: "GET",
      url: "libs/php/getCountryByCoords.php",
      dataType: "json",
      data: {lat: lat, long: long},
      success:(response) =>{
        //console.log(response);
        let country=response.data[0].components['ISO_3166-1_alpha-2']
        //console.log(country);
        $("#countrySelect").val(country).change();
      },
      error: function(xhr, status, error) {
        console.error("Error:", error);  
        }
    })

  }


 // Ajax function for populating select

 const getCountries = () => {
  $.ajax({
    type: "GET",
    url: "libs/php/getCountries.php",
    dataType: "json",
    success: (countryData) => {
     
      let str = "";
        for (let i = 0; i < countryData.length; i++) {
        
          const country = countryData[i];
          str+= `<option value="${country.code}">${country.name}</option>`;
          //console.log(str);
        }

        $("#countrySelect").append(str);

    },
    error: function(xhr, status, error) {
      console.error("Error:", error);  
    }
  
  });
};
getCountries();

//To remove previously selected country borders

const removeBorders = () => {
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) map.removeLayer(layer);
  });
};



$('#countrySelect').on('change', function(){

  if($('#mySelect').prop('selectedIndex', 0)){ 
    removeBorders();
  }

  // AJAX getting country by code
 
  $.ajax({
    type: 'POST',
    url: 'libs/php/getCountryByCode.php',
    data: {countryCode: $('#countrySelect').val()},
    dataType:'JSON',
    success: function(result){
      //console.log(result);
      removeBorders();
      var border =  L.geoJSON(result.geometry,{
        style: {
          color: "#789920",      
          weight: 2,             
          opacity: 0.7,            
          fillColor: "#ffcccc",  
          fillOpacity: 0.5
              
      }// style country border polygon
      }).addTo(map);
      map.fitBounds(border.getBounds());
    },
    error: function(xhr, status, error) {
      console.error("Error:", error);  
    }
    
  });
   const selectedCountry = $(this).val();
   const selectedCountryName = $('#countrySelect option:selected').text(); // it will select the country name instead of code.
   countryInfoAPI(selectedCountry);
   wikiLinksAPI(selectedCountryName);
   countryNews(selectedCountry);
   getCapitalCoord(selectedCountryName);
   getCitiesByCountryCode(selectedCountry);
})


    // First API call to get country information
    function  countryInfoAPI (selectedCountry)
    { 
      $.ajax({
      type: 'GET',
      url: 'libs/php/getCountryInfo.php',
      dataType: 'JSON',
      success: function(response){
        if (response.status.code == 200)
       { const countries = response.data;
        // Find the selected country data in the array
        const country = countries.find(c => c.countryCode.toLowerCase() === selectedCountry.toLowerCase());
       //Assign currencyCode for getCurrencyInfo 
       const currencyCode = country.currencyCode;
       currencyListAPI(currencyCode);
      
       // Populate the modal with the selected country's information
       $('#countryCapital').html(`${country.capital}`);
       $('#countryContinent').html(`${country.continentName}`);
       $('#countryArea').html(`${country.areaInSqKm}`);
       $('#countryPopulation').html(`${country.population}`);
       $('#countryName').html(`${country.countryName}`);

       }
       },
      error: function(error){
        console.log('error occured',error);
       }
    });
    }

    function currencyListAPI(currencyCode){
      $.ajax({
        type: 'GET',
        url: 'libs/php/getCurrencyList.php',
        dataType: 'JSON',
        success: function (response){
          if (response.status.code == 200){
           const currencyList = response.data;
           currencyInfoAPI(currencyCode, currencyList);

        }},
        error: function(xhr, status, error) {
            console.error("Error:", error);  
            }

          })

    };
  



      // second API call to fetch currency information
      function currencyInfoAPI(currencyCode, currencyList) {
        $.ajax({
          type: 'GET',
          url: 'libs/php/getCurrencyExchangeRate.php',
          dataType: 'JSON',
          success: function (response) {
            if (response.status.code == 200) {
              const currencies = response.data;
             let selectHTML = "";
            for (let curr in currencyList) {
               selectHTML += `<option value="${curr}" ${curr === currencyCode ? "selected" : "" }>${currencyList[curr]}</option>`;
              }
             $("#currencySelect").html(selectHTML);
     
             function updateConvertedAmount() {
               let selectedCurrency = $("#currencySelect").val(); 
               let currencyRate = currencies[selectedCurrency]; 
               let amount = parseFloat($("#fromAmount").val()) || 0;
     
               if (currencyRate) {
                 let convertedAmount = (amount * currencyRate).toFixed(2);
                 $("#toAmount").val(convertedAmount); 
               } else {
                 $("#toAmount").val(""); 
               }
             }
             updateConvertedAmount();

             $("#currencySelect, #fromAmount").on("input change", updateConvertedAmount);
           }
         },
         error: function (xhr, status, error) {
           console.error("Error:", error);
         },
       });
     }
     
  
// get wikilinks from geonames API

function wikiLinksAPI(selectedCountryName){
  
  $.ajax({
    type: 'GET',
    url: 'libs/php/getWikiLinks.php',
    data:{countryName: encodeURI(selectedCountryName)},
    dataType:'JSON',
    success: function(response){
      if(response.status.code==200){
        const array= response.data;
        let countryLinksHTML= "";
        for(i=0;i<array.length;i++){
            if(array[i].summary){
          countryLinksHTML+=
          `<table class= "table table-borderless"><tr><a target = "_blank" href = https://${array[i].wikipediaUrl}><h5>${array[i].title}</h5></a></tr>
           <tr class="border-bottom">${array[i].summary}</tr></table>`;
          }}
      $('#links').html(countryLinksHTML);

          }},
    error: function(xhr, status, error) {
      console.error("Error:", error);  
    }
    
  });
}

// get CountryNews from newsdata.io API

function countryNews(selectedCountry){
  
  $.ajax({
    type: 'GET',
    url: 'libs/php/getCountryNews.php',
    data:{countryCode: selectedCountry},
    dataType:'json',
    success: function(response){
      if(response.status.code==200){
      let array= response.data;
        let newsHTML= "";
        for(i=0;i<array.length;i++){
          if(array[i].image_url==null)continue;
          newsHTML+=`<table class = "table table-borderless">
          <tr>
          <td rowspan="2" width=50%>
          <img class= "img-fluid object-fit-cover" style="width: 200px; height: 200px;" alt="News Image" src= "${array[i].image_url}" />
          </td>
          <td>
          <a  target="_blank" href= ${array[i].link}>${array[i].title}</a>
          <p class="opacity-25 align-items-end mt-5 ">${array[i].source_name}</p>
          </td>
          </tr>
          </table>`; 
        }
        $('#news').html(newsHTML);
    }},
    error: function(xhr, status, error) {
      console.error("Error:", error);  
    }
    
  });
}

 // get weather Info from openweather API

 const getWeather = (lat, lng, capital, selectedCountryName) => {
  $.ajax({
    type: "GET",
    url: "libs/php/getWeather.php",
    data: { lat: lat, lng: lng },
    dataType: "json",
    success: (response) => {
      const { data } = response;
      let todayWeather = data.list[0];
      let tomorrowWeather = data.list[8];
      let dayAfterTomorrowWeather = data.list[15];
      let main = todayWeather.weather[0].main;
      let description = todayWeather.weather[0].description;
      let temp = Math.round(todayWeather.main.temp - 273.15);
      let wind = todayWeather.wind.speed;
      let humidity = todayWeather.main.humidity;
      let tomorrow = data.list[8]; 
      let dayAfterTomorrow = data.list[16]; 
      // Function to format date as "Day, Month Date"
      function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
    
      $('#modalWeatherTitle').html(`${capital}, ${selectedCountryName}`);
      $("#wrapper-description").html(description);
      $("#wrapper-temp").html(`${temp}°C`);
      $("#wrapper-wind").html(`${wind} m/sec`);
      $("#wrapper-humidity").html(`${humidity}%`);
      $("#tomorrow").html(formatDate(tomorrow.dt));
      $("#dayAfterTomorrow").html(formatDate(dayAfterTomorrow.dt));

      
      
      // // Weather daily data
      let tomorrowTemp = Math.round(tomorrowWeather.main.temp - 273.15);
      let dATTemp = Math.round(
        Math.round(dayAfterTomorrowWeather.main.temp - 273.15)
      );

      $("#wrapper-forecast-temp-today").html(`${temp}°`);

      $("#wrapper-forecast-temp-tomorrow").html(`${tomorrowTemp}°`);
      $("#wrapper-forecast-temp-dAT").html(`${dATTemp}°`);

      // // Icons
      let iconBaseUrl = "http://openweathermap.org/img/wn/";
      let iconFormat = ".png";

      // // Today
      let iconCodeToday = data.list[0].weather[0].icon;
      let iconFullyUrlToday = iconBaseUrl + iconCodeToday + iconFormat;
      $("#wrapper-icon-today").attr("src", iconFullyUrlToday);

      // // Tomorrow
      let iconCodeTomorrow = data.list[8].weather[0].icon;
      let iconFullyUrlTomorrow = iconBaseUrl + iconCodeTomorrow + iconFormat;
      $("#wrapper-icon-tomorrow").attr("src", iconFullyUrlTomorrow);

      // // Day after tomorrow
      let iconCodeDAT = data.list[15].weather[0].icon;
      let iconFullyUrlDAT = iconBaseUrl + iconCodeDAT + iconFormat;
      $("#wrapper-icon-dAT").attr("src", iconFullyUrlDAT);

      // Backgrounds
      switch (main) {
        case "Snow":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/3Pm1.gif')"
          );

          break;
        case "Clouds":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/1F1I.gif')"
          );
          break;
        case "Fog":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/CRl.gif')"
          );

          break;
        case "Rain":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/E3K8.gif')"
          );

          break;
        case "Clear":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/Lx0q.gif')"
          );

          break;
        case "Thunderstorm":
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/Rnix.gif')"
          );

          break;
        default:
          $("#wrapper-bg").css(
            "backgroundImage",
            "url('https://i.gifer.com/Lx0q.gif')"
          );

          break;
      };
    }
 })
};

// get capital coordinates from restcountries API
const getCapitalCoord = (selectedCountryName) => {
$.ajax({
  type: 'GET',
  url: 'libs/php/getCapitalCoord.php',
  data: {country: encodeURI(selectedCountryName)},
  dataType:'JSON',
  success: function(response){
   
   // console.log("getCapitalCoord:" ,response.data);
   
      //const [lat, lon] = response.data.latlng;
      //console.log("Latitude:", lat);
      const lat=response.data[0].latlng[0] ;
      const lng=response.data[0].latlng[1] ;
      const capital= response.data[0].capital;
      getWeather(lat, lng, capital, selectedCountryName );

  },
  error: (xhr, status, error) =>{
    console.log('Error getting data:', status, error);
    console.log('Response:', xhr.responseText);
}
})
};

// city markers getting from geoname API
const getCitiesByCountryCode = (countryCode) => {
  if (cities) {
    map.removeLayer(cities);
  }
  
  $.ajax({
    type: "GET",
    url: "libs/php/getCities.php",
    data: { countryCode: encodeURI(countryCode) },
    dataType: "JSON",
    success: (response) => {
      let cityInfo = response.data;
      // L.markerClusterGroup is similar to L.layerGroup
     
      cities = L.markerClusterGroup();
     

      for (let i = 0; i < cityInfo.length; i++) {
    
        const city = cityInfo[i];
        let cityLat = city.lat;
        let cityLng = city.lng;
        let cityName= city.name;
        let marker = L.marker([cityLat, cityLng], {icon: cityMarkers}).bindTooltip(
          cityName,
          { direction: "top", sticky: true }
        );
        cities.addLayer(marker);
       // instead of marker.addTo(map) use cities.addLayer(marker) so add the marker to the cluster
       // instead of the map
       
      }
      // Then just add the cluster to the map:
      map.addLayer(cities);
     
    },
      error: (xhr, status, error)=>{
        console.log('Error getting data:', status, error);
        console.log('Response:', xhr.responseText);
      }
    })
  };