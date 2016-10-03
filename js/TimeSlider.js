function addTimeSlider(){
	//create the container of the head div
	var head = d3.select("#map_root")
		.append("div")
		.style('width', '80%')
		.style('height', "75px")
		.style('position', "absolute")
		.style('right', "0px")
		.style('opacity', '0.8')
        .style('border-radius', '7px')
        .style('border', '2px solid #73AD21;')
        .style("box-shadow", "0 0 15px rgba(0,0,0,0.2)")
        .style('background', 'white');
    // create the text area
	head.html("<p><label for='amount'>Year: </label><input type='text' id='amount' value='1990' readonly style='border:0; color:#f6931f; font-weight:bold;''></p>");
	// create the div for the slider
	head.append("div")
		.attr("id", "timeslider")
		.style('width', "95%")
		.style('left', "10px");
	// create the slider in the above div
	$( "#timeslider" ).slider({
      value:1990,
      min: 1990,
      max: 2100,
      step: 5,
      stop: function( event, ui ) {
        var year = ui.value;
        if(year<=1990 || year>=2005){
        	var parentkey = $("#lct-parentkey-select option:selected").text();
			var childKey = $("#lct-childkey-select option:selected").text();
			layer.update(regionValues.features, parentkey, childKey, linecharts.years.map((d)=>{return parseInt(d);}), year);
        };
      },
      slide: function(event, ui){
      	var year = ui.value;
      	if(year>1990 && year<2005) $( "#amount" ).val('Not applicable');
      	else $( "#amount" ).val(ui.value);
      }
    });
}

function addLegend(){
	var divwidth = $("#map_root").width(),
		divheight = $("#map_root").height()*0.1;
	 d3.select("#map_root")
		.append("div")
		.attr("id", legendDivName);
}

