// Store our API endpoint inside url
var QuakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var PlateURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// Perform a GET request to the URL for earthquake data
d3.json(QuakeURL, function(data) {
	console.log(data.features);

	var earthquakeCircles = [];

	data.features.forEach(function(feature) {
		var magnitude = feature.properties.mag;

		getColor(magnitude);

		// Add circles to map
		earthquakeCircles.push(
			L.circle([ feature.geometry.coordinates[1], feature.geometry.coordinates[0] ], {
				fillOpacity: 0.75,
				color: 'white',
				fillColor: color,
				weight: 1,
				// Adjust radius
				radius: magnitude * 30000
			}).bindPopup(`<h3> Magnitude: ${magnitude} <hr> 
                       Location: ${feature.properties.place} <hr>
                  </h3>
                  <p> ${new Date(feature.properties.time)}</p>`)
		);
	});

	var plateLines = [];
	d3.json(PlateURL, function(data) {
		console.log(data.features);
		var plateLayer = L.geoJson(data.features, { color: '#FAEBD7' });

		console.log(plateLayer);
		var earthquakesLayer = L.layerGroup(earthquakeCircles);
		createMap(earthquakesLayer, plateLayer);
	});
});

function getColor(magnitude) {
	color = '';
	if (magnitude >= 6) {
		color = 'red';
	} else if (magnitude >= 5) {
		color = 'orange';
	} else if (magnitude >= 4) {
		color = 'yellow';
	} else if (magnitude >= 2) {
		color = 'blue';
	} else {
		color = 'green';
	}
}

function createMap(earthquakesLayer, plateLayer) {
	console.log(plateLayer);
	console.log(earthquakesLayer);
	// Define satellite map, dark map, and outdoors map layers
	var satmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/satellite-v9',
		accessToken: API_KEY
	});

	var darkmap = L.tileLayer(
		'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: 'mapbox/dark-v9',
			accessToken: API_KEY
		}
	);

	var outmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/outdoors-v10',
		accessToken: API_KEY
	});

	// Define a baseMaps object to hold our base layers
	var baseMaps = {
		Satellite: satmap,
		Dark: darkmap,
		Outdoors: outmap
	};

	// Create overlay object to hold our overlay layer
	var overlayMaps = {
		Earthquakes: earthquakesLayer,
		'Tectonic Plates': plateLayer
	};

	// Create our map, giving it the streetmap and earthquakes layers to display on load
	var myMap = L.map('map', {
		center: [ 37.09, -80.71 ],
		zoom: 3,
		layers: [ satmap, earthquakesLayer, plateLayer ]
	});

	// earthquakesLayer.addTo(myMap);

	// Create a layer control
	// Pass in our baseMaps and overlayMaps
	// Add the layer control to the map
	L.control
		.layers(baseMaps, overlayMaps, {
			collapsed: false
		})
		.addTo(myMap);

	var legend = L.control({ position: 'bottomleft' });

	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'legend');
		div.innerHTML += '<h4>Magnitude</h4>';
		div.innerHTML += '<i style="background: red"></i><span>6+</span><br>';
		div.innerHTML += '<i style="background: orange"></i><span>5-6</span><br>';
		div.innerHTML += '<i style="background: yellow"></i><span>4-5</span><br>';
		div.innerHTML += '<i style="background: blue"></i><span>2-4</span><br>';
		div.innerHTML += '<i style="background: green"></i><span>0-2</span><br>';

		return div;
	};

	legend.addTo(myMap);
}
