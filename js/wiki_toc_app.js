var graphWidth = 2000, 
	graphHeight = 500;

d3.json('data/FP_final.json', function(data) {


	var chart = d3.select("#wikitoc").append("svg")
	    .attr("width", graphWidth)
	    .attr("height", graphHeight);

    var wikitoc = who.wikitoc()
    			.height(graphHeight)
    			.width(graphWidth)


    chart.datum(data).call(wikitoc)

});
