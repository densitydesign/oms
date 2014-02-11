var graphWidth = 900; 
var graphHeight = 900;
var teamBuffer = 20;
var transitionDuration = 750;
var fontSize = 10;


$.getJSON('data/CS05_tfidf.json', function(dataIDF) {

$.getJSON('data/CS05_tf.json', function(dataTF) {

	d3.select('#buttons').append("button").text('show cat')
		.on("click", function(){
			slope.showCat(["M", "C", "E"])
			chart.call(slope)
	})

	d3.select('#buttons').append("button").text('show cat 2')
		.on("click", function(){
			slope.showCat(["C", "E"])
			chart.call(slope)
	})

	d3.select('#buttons').append("button").text('filter word link')
		.on("click", function(){
			slope.showLines(true).wordStep(["risk", "incision"])
			chart.call(slope)
	})

	d3.select('#buttons').append("button").text('display all links')
		.on("click", function(){
			slope.showLines(true).wordStep([])
			chart.call(slope)
	})

	d3.select('#buttons').append("button").text('TF')
		.on("click", function(){
			slope.listStop(false)
			chart.datum(dataTF.objects).call(slope)
	})

	d3.select('#buttons').append("button").text('TFIDF')
		.on("click", function(){
			slope.listStop(false)
			chart.datum(dataIDF.objects).call(slope)
	})

	//sets up the basic container for the visualization
	var chart = d3.select("#slopegraph").append("svg")
	     .attr("width", graphWidth)
	     .attr("height", graphHeight);

	var filterTF = [
			'baby',
			'caesarean',
			'woman',
			'caesarean section',
			'risk',
			'mother',
			'cesarean delivery',
			'birth',
			'delivery',
			'doctor',
			'hospital',
			'sections',
			'labour',
			'incision',
			'labor',
			'surgery',
			'birth vaginal',
			'pregnancy',
			'delivery vaginal',
			'uterus'
		]

		var filterIDF = [
		'labour',
		'delivery',
		'range upper',
		'amount patient pay',
		'bill size',
		'estimate',
		'dynamic player',
		'percent',
		'caesarean section',
		'birth labor',
		'different experience',
		'depth overview',
		'birth section',
		'hour labour',
		'daunting experience',
		'expectant mom',
		'every woman',
		'site',
		'figure',
		'scar section'
		]
	
	dataTF.objects.forEach(function(d){

		d.values = d.values.filter(function(f){
			var check = filterTF.indexOf(f['key']);
			return check >= 0
		})

		d.values.sort(function(a, b) {
    		return b['value'] -a['value'] ;
		});

		var nScale = d3.scale.linear().domain([d3.min(d.values, function(f){return f['value']}), d3.max(d.values, function(f){return f['value']})]).range([0,1])
		
		d.values.forEach(function(f){
				f['value'] = d3.round(nScale(f['value']),2)
			})

	})


	dataIDF.objects.forEach(function(d){

		d.values = d.values.filter(function(f){
			var check = filterTF.indexOf(f['key']);
			return check >= 0
		})

		d.values.sort(function(a, b) {
    		return b['value'] -a['value'] ;
		});

		var nScale = d3.scale.linear().domain([d3.min(d.values, function(f){return f['value']}), d3.max(d.values, function(f){return f['value']})]).range([0,1])
		
		d.values.forEach(function(f){
				f['value'] = d3.round(nScale(f['value']),2)
			})

	})


    var slope = who.slopeChart()
    			.graphHeight(graphHeight)
    			.on("clicked", function(d){
    				console.log(d)
    				slope.wordStep([d])
					chart.call(slope)
    			})

    chart.datum(dataTF.objects).call(slope)

	});
});
