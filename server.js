var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');

app.use(express.static(__dirname));

app.get('/', function(req, res){
	console.log('connected');
	res.sendFile('index.html', {"root": __dirname})
});

app.post('/getData', function(req, res){
	console.log('received request of the data');
	res.contentType('json');
	// load the data
	var filepath =  __dirname+'/data/scenario_757.json';
	var datacontent = JSON.parse(fs.readFileSync(filepath));
	var geopath = __dirname+'/data/gcam_32_master.geojson';
	var geocontent = JSON.parse(fs.readFileSync(geopath));
	var regionpath = __dirname+'/data/scenario_757.geojson';
	var regioncontent = JSON.parse(fs.readFileSync(regionpath));
	// send the data back to the client.
	res.send({data: JSON.stringify(datacontent), geo: JSON.stringify(geocontent), region: JSON.stringify(regioncontent)});
});

// connection listener
io.on('connection', function(socket){
	console.log('someone logged in!');
});


// listen the port 3000
http.listen((process.env.PORT || 3000), function(){
    console.log('listening...');
});

