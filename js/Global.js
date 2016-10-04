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