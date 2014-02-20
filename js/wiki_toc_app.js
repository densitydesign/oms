var graphWidth = 1500, 
	graphHeight = 200;

d3.json('data/out.json', function(data) {


	var chart = d3.select("#wikitoc").append("svg")
	    .attr("width", graphWidth)
	    .attr("height", graphHeight);

    var wikitoc = who.wikitoc()
    			.height(graphHeight)
    			.width(graphWidth)


    chart.datum(data).call(wikitoc)

});
