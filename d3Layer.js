// credit to https://github.com/chelm/esri-d3. Minor modifications from Xing Liang.
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/layers/GraphicsLayer",
    "http://d3js.org/d3.v3.min.js"
  ],
  function(
    declare,
    lang,
    array,
    on,
    Point,
    webMercatorUtils,
    GraphicsLayer,
    d3) {

    var d3Layer = declare("d3Layer", [GraphicsLayer], {

      // Doc: http://docs.dojocampus.org/dojo/declare#chaining
    "-chains-": {
      constructor: "manual"
    },

    constructor: function(url, options) {
      var self = this;
      this.inherited(arguments); 

      this.url = url;
      //this.id = options.id || ( Math.round( Math.random() * 100000 ).toString( 16 ) ) + ( new Date() ).getTime().toString(16);

      this.type = options.type || 'path';
      this.colors = options.colors || ['#fff'];
      this.opacity = options.opacity || 0.5;
      this.legend = options.legend || '';
      if (options.projection) this._project = options.projection;
     
      this._styles = options.styles || [];
      this._attrs = options.attrs || [];
      this._events = options.events || [];

      this._path = options.path || d3.geo.path();
      this.path = this._path.projection( self._project );
    
      // load features
      this._load();
    },

    update: function(data, parentKey, childKey, years, year){
      this.regionValues = data;
      this.parentKey = parentKey;
      this.childKey = childKey;
      this.years = years;
      this.year = year;
      this.yearInd = this.years.indexOf(year);
      this.max = d3.max(data, (d, i)=>{
        if(d.queries!=null && d.queries[this.parentKey].hasOwnProperty(this.childKey))
          return parseFloat(d.queries[this.parentKey][this.childKey][this.yearInd]);
      })
      this.min = d3.min(data, (d, i)=>{
        if(d.queries!=null && d.queries[this.parentKey].hasOwnProperty(this.childKey))
          return parseFloat(d.queries[this.parentKey][this.childKey][this.yearInd]);
      })
      this.scales = d3.range(this.min, this.max, (this.max-this.min)/this.colors.length);
      this.colormapping = d3.scale.quantile().domain(this.scales).range(this.colors)
      this._reset();
      this._addLegend();
    },

    _addLegend: function(){
      var legend = d3.select("#"+this.legend);
        legend.style('z-index', 100)
        .style('right', 0)
        .style('bottom', 0)
        .style('position', 'absolute')
        .style('opacity', '0.8')
        .style('border-radius', '7px')
        .style('border', '2px solid #73AD21;')
        .style("box-shadow", "0 0 15px rgba(0,0,0,0.2)")
        .style('background', 'white');
      var labels = [];
      for (var i = 0; i < this.colors.length; i++) {
                var from = this.scales[i];
                var to;
                if(i==this.colors.length-1) to = this.max;
                else to = this.scales[i+1];
                labels.push(
                  '<i style="width:18px; height: 18px; float: left; margin-left: 8px; margin-right: 8px; opacity: 0.8; background:' + this.colors[i] + '"></i> ' +
                  int2roundKMG(from) + (int2roundKMG(to) ? '&ndash;' + int2roundKMG(to) : '+'));
      }
      legend.html(labels.join("<br>"));

      // Truncate a number to ind decimal places
      function truncNb(Nb, ind) {
        var _nb = Nb * (Math.pow(10,ind));
        _nb = Math.floor(_nb);
        _nb = _nb / (Math.pow(10,ind));
        return _nb;
      }

      // convert a big number to k,M,G
      function int2roundKMG(val) {
        var _str = "";
        if (val >= 1e9)        { _str = truncNb((val/1e9), 1) + ' G';
        } else if (val >= 1e6) { _str = truncNb((val/1e6), 1) + ' M';
        } else if (val >= 1e3) { _str = truncNb((val/1e3), 1) + ' K';
        } else { _str = parseFloat(val).toFixed(2);
        }
        return _str;
      }
    },

    _load: function(){
      var self = this;
      
      d3.json( this.url, function( geojson ){
        self.geojson = geojson;
        //TODO commented this out because it was breaking - is it needed? 
        //self.bounds = d3.geo.bounds( self.geojson );
        
        self.loaded = true;
        // TODO the onLoad event fires too soon, have to wait until the DOM is created
        setTimeout(function(){ 
          self.onLoad( self );
        }, 1000);
      });

    }, 

    _bind: function(map){
      this._connects = [];
      // this._connects.push( dojo.connect(this._map, "onPan", this, this._reset) );
      this._connects.push( dojo.connect( this._map, "onZoomEnd", this, this._reset ) );
      this._connects.push( dojo.connect( this._map, "onPanEnd", this, this._reset ) );
    },

    _project: function(x){
       var p = new esri.geometry.Point( x[0], x[1] );
       var point = map.toScreen( esri.geometry.geographicToWebMercator( p ) )
       return [ point.x, point.y ];
    },

    _render: function(){
      var self = this;
      var p = this._paths();
    
      // if ( this.type == 'circle' ) {

      //   p.data( this.geojson)
      //     .enter().append( this.type )
      //     .attr('class', this.id)
      //     .attr("cx", function(d, i) { return self._project([d.longitude, d.latitude])[0]; })
      //     .attr("cy", function(d, i) { return self._project([d.longitude, d.latitude])[1]; })
      //     .attr('r', 10)
      //     .attr("fill", "red")
      //       .on('click', function(d) {
      //         self.select(d, this)
      //       })
      //       .on('mouseover', function(d){
      //         self.hover(d, this);
      //       })
      //       .on('mouseout', function(d){
      //         self.exit(d, this);
      //       })
      // } else {

      //   p.data( this.geojson.features )
      //     .enter().append( this.type )
      //     .attr('class', this.id)
      //     .attr('d', this.path);
      // }  
      if(this.type=='path'){
        p.data( this.geojson.features )
          .enter().append( this.type )
          .attr('class', this.id)
          .attr('d', this.path)
          .style("fill", this.colors)
          .style("opacity", this.opacity);       
      }
      else{
        p.data( this.geojson.features )
          .enter().append("svg")//append null svg in which users can add anything
          .attr('class', this.id);        
      }

      this._styles.forEach(function( s, i ) { 
        self.style(s);
      });

      this._attrs.forEach(function( s, i ) {
        self.attr(s);
      });

      this._events.forEach(function( s, i ) {
        self.event(s);
      });

      this._bind();
    },

    getSVGPointer: function(){//elements in the svg will automatically be mapped to the correct map position
      var p = this._paths();
      return p==null?p:p[0].parentNode.parentNode;
    },

    style: function( s ){
      this._paths().style(s.key, s.value);
    },

    attr: function( a ){
      if (a.key == "class"){
        this._paths().attr('class', function(d) { 
          var val = d3.select(this).attr('class') + " " + a.value;
          return val; 
        });
      } else {
        this._paths()
        .attr(a.key, a.value)
        .on('mouseover', (d, i)=>{
          // d3.select("#region-"+d.properties["REGION_NAME"]).style("stroke-width", "5");
          if(this.regionValues!=null){
            var data = this.regionValues[d.id].queries;
            if(data!=null){
              var value = parseFloat(data[this.parentKey][this.childKey][this.yearInd]);
              tooltip.html("<strong>Region: </strong>" + d.properties["REGION_NAME"] 
                + "<br><strong>Value: </strong>" + parseFloat(value).toFixed(2)
                + "<br><strong>Year: </strong>" + this.years[this.yearInd]);
                // turn on the visibility of the tooltip
              return tooltip.style("visibility", "visible");
            }
            else{
              tooltip.html("<strong>Data Not Applicable</strong>");
              return tooltip.style("visibility", "visible");
            }
          }
        })
        .on("mousemove", function(d){
            // note that tooltip here is a global variable in global.js file
            return tooltip.style("top",(event.pageY-10)+"px").style("left", (event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            // d3.selectAll(".regions").style("stroke-width", "3");
            return tooltip.style("visibility", "hidden");
        });;
      }
    },

    event: function( e ){
      this._paths().on(e.type, e.fn);
    },

    // _transform: function(evt){
    //   var self = this;
    //   var p = this._paths();
    //   if(p==null)  return p;
    //   var svgParent = p[0].parentNode.parentNode;
    //   // console.log("activated");
    // },

    _reset: function(){
      var self = this;
      if (this.type == 'circle'){
        this._paths()
          .attr("cx", function(d, i) { return self._project([d.longitude, d.latitude])[0]; })
          .attr("cy", function(d, i) { return self._project([d.longitude, d.latitude])[1]; })
      } else {
        this._paths().attr('d', this.path).style("fill", (d, i)=>{
          if(this.regionValues!=null){
            var data = this.regionValues[d.id].queries;
            if(data!=null){
              var value = parseFloat(data[this.parentKey][this.childKey][this.yearInd]);
              return this.colormapping(value);
            }
          }
          else
            return '#fff';
        });
      }
    },

    _element: function(){
      return d3.select("g#" + this.id + "_layer");
    },

    _paths: function(){
      return this._element().selectAll( this.type+"."+this.id );
    },
    
    hover: function() {},
    exit: function() {},
    select: function() {}
    });

    return d3Layer;
  });