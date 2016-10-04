$(document).ready(function(){
    // draw the shapefiles
    require([
	  "esri/map",
      "dojo/parser",
      "modules/d3Layer",
      "dojo/domReady!"
	], function(Map,parser,d3Layer) {
        parser.parse();
        map = new Map("map", {
          center: [-98, 39],
          zoom: 4,
          basemap: "gray"
        });
        layer = new d3Layer('/data/gcam_32_master.geojson', {
          attrs: [{
            key: 'id',
            value: function(d) {
              return 'region-' + d.properties['REGION_NAME'];
            }
          }, {
            key: 'class',
            value: "regions"
          }],
          type: "path",
          colors: colors,
          opacity: 0.5,
          legend: legendDivName
        });
        map.addLayer(layer);
        layer.on("load", function(lyr) {
            // render the layers on the map
            layer._render();
            // add the time slider on the map
            addTimeSlider();
        });
      });
    // retrieve the data from the server
    $.ajax({
    	type: "POST",
        url: "/getData",
        contentType: 'application/json',
        data: {},
        error: function(err){
        	alert(err);
        },
        success: function(res){
          // retrieve the data
        	var ret = JSON.parse(res.data);
        	geofeatures = JSON.parse(res.geo);
          regionValues = JSON.parse(res.region);
        	console.log('stat data received!', new Date());
          linecharts.charts = [];
          linecharts.data = ret.data;
          linecharts.years = ret.years;
          linecharts.unit = ret.dataMetrics;
          linecharts.regionNames = ret.regionNames;
          var parentKeys = Object.keys(ret.data);
          var childKeys = [];
          // extract the keys from the data
          parentKeys.reduce((prev, cur)=>{
          	prev[cur] = Object.keys(ret.data[cur]);
          	return prev;
          }, childKeys);
          // generate the select box and its options
        	prepareLineChart(parentKeys, childKeys);
          // create the legend div on the map
          addLegend();
        }
    });
    // debounce the updateLineChart event
    var deb;
    window.onresize = function(){
      clearTimeout(deb);
      deb = setTimeout(udpateLineChart, 100);
    };
})




