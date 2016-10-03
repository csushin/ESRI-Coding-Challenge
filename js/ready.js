// // global variables
var map, layer;
var linecharts = {
	parent: [],
	child: [],
	data:{},
	charts: []
};
var blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';//smallest blank image
var geofeatures;
var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("background", "rgba(0, 0, 0, 0.8)")
	.style("color", "#fff")
	.style("visibility", "hidden");
var colors = ['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(240,59,32)','rgb(189,0,38)'];
var regionValues;
var legendDivName = 'legend';

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
        // d3.json
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
            layer._render();
            addTimeSlider();
        });
      });
    // create parameter select boxes
    $.ajax({
    	type: "POST",
        url: "/getData",
        contentType: 'application/json',
        data: {},
        error: function(err){
        	alert(err);
        },
        success: function(res){
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
          parentKeys.reduce((prev, cur)=>{
          	prev[cur] = Object.keys(ret.data[cur]);
          	return prev;
          }, childKeys);
        	prepareLineChart(parentKeys, childKeys);
          addLegend();
        }
    });
    var deb;
    window.onresize = function(){
      clearTimeout(deb);
      deb = setTimeout(udpateLineChart, 100);
    };
})




