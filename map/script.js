var mtMap = {

	m_time_update: 10000,

	m_map: null,
	m_layer: null,
	m_markerCurrent: null,

	m_controls: {},

	m_lat: 0.0, // Kinh độ
	m_lng: 0.0, // Vĩ độ

	// frm_update_location: null, // Loop Interval var


	init: async function() {
		
		// Tạo vòng lặp update
		// this.frm_update_location(); // Gọi lần đầu
		// this.frm_update_location = setInterval(this.frm_update_location, this.m_time_update);

		// // Khởi tạo map
		// this.m_map = L.map('map');
		// this.m_map.setView([this.m_lat, this.m_lng], 13);

		// // Khởi tạo lớp phủ
		// this.m_layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		// 	maxZoom: 19,
		// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		// }).addTo(this.m_map);
		// this.m_layer.addTo(this.m_map);

		// Init SQL
		var SQL = await initSqlJs({
			// Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
			// You can omit locateFile completely when running in node
			locateFile: file => `/lib/sqljs/sql-wasm.wasm`
		});

		// Khởi tạo map, lớp phủ
		this.m_map = new L.Map('map').fitWorld();
		this.m_layer = L.tileLayer.mbTiles('/res/maps/osm-2020-02-10-v3.11_vietnam_ho-chi-minh-city.mbtiles', {
			minZoom: 0,
			maxZoom: 6
		}).addTo(this.m_map);
		this.m_layer.on('databaseloaded', function(ev) {
			console.info('MBTiles DB loaded', ev);
		});
		this.m_layer.on('databaseerror', function(ev) {
			console.info('MBTiles DB error', ev);
		});

		// Tạo Button
		// let btnA = L.control();
		// m_controls

		// Đánh dấu điểm hiện tại
		this.m_markerCurrent = L.marker([this.m_lat, this.m_lng]).addTo(this.m_map);

		// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
		// circle.bindPopup("I am a circle.");
		// polygon.bindPopup("I am a polygon.");

		// var popup = L.popup()
		// 	.setLatLng([51.513, -0.09])
		// 	.setContent("I am a standalone popup.")
		// 	.openOn(map);

		// function onMapClick(e) {
		// 	alert("You clicked the map at " + e.latlng);
		// }
		// map.on('click', onMapClick);

		// var popup = L.popup();
		// function onMapClick(e) {
		// 	popup
		// 		.setLatLng(e.latlng)
		// 		.setContent("You clicked the map at " + e.latlng.toString())
		// 		.openOn(map);
		// }
		// map.on('click', onMapClick);

		// $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=47.217954&lon=-1.552918', function(data){
		// 	console.log(data.address.road);
		// });

	},
	view: function(lat, lng, zoom = 13) {
		this.map.setView([lat, lng], zoom);
	},
	drawMark: function(lat, lng) {
		return L.marker([lat, lng]).addTo(this.m_map);
	},
	drawCircle: function(lat, lng, option) {
		return L.circle([lat, lng], option).addTo(this.m_map);
		// var circle = L.circle([51.508, -0.11], {
		// 	color: 'red',
		// 	fillColor: '#f03',
		// 	fillOpacity: 0.5,
		// 	radius: 500
		// }).addTo(map);
	},
	drawPolygon: function(lstLocation) {
		return L.polygon(lstLocation).addTo(this.m_map);
		// var polygon = L.polygon([
		// 	[51.509, -0.08],
		// 	[51.503, -0.06],
		// 	[51.51, -0.047]
		// ]).addTo(map);
	},

	// frm_update_location: function() { // Loop get newest location
	// 	navigator.geolocation.getCurrentPosition(function(pos) {
	// 		mtMap.m_lat = pos.coords.latitude;
	// 		mtMap.m_lng = pos.coords.longitude;
	// 	});
	// },

	btnLocation: function() {

		let self = this;

		if (navigator == null || navigator.geolocation == null)
			throw("[mtMap:btnLocation] navigator.geolocation is null");

		navigator.geolocation.getCurrentPosition(function(pos) {
			self.m_lat = pos.coords.latitude;
			self.m_lng = pos.coords.longitude;
			// console.log("latitude: "+self.m_lat);
			// console.log("longitude: "+self.m_lng);

			var latlng = L.latLng(self.m_lat, self.m_lng);

			self.m_map.setView(latlng, 100.0, {});
			self.m_markerCurrent.setLatLng(latlng);
		});

		// console.log("btnLocation");
	},
	btnContact: function() {
		console.log("btnContact");
	},
}