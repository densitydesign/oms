(function(){

  var who = window.who || (window.who = {});

  who.scatterPlot = function(){

    var width = 900,
 		    height = 600,
        maxRadius = 20,
        colors = ["#cf5353","#4da15f"],
        chart,
        reset,
        showPoints = true;


    function scatterPlot(selection){
    	selection.each(function(data){

      if (selection.select('svg').empty()){
            chart = selection.append('svg')
              .attr('width', width)
              .attr('height', height)

            var div = d3.select("body").append("div")   
                  .attr("class", "tooltip-elm") 
          }
      else
          {
            chart = selection.select('svg')
                  .attr('width', width)
                  .attr('height', height)
          }



		var marginLeft = d3.max([maxRadius,(d3.max(data, function (d) { return (Math.log(d.y) / 2.302585092994046) + 1; }) * 9)]),
			marginBottom = 0,
			w = width - marginLeft,
			h = height - marginBottom;

		var xExtent = d3.extent(data, function (d){ return d.x; }),
			yExtent = d3.extent(data, function (d){ return d.y; });

		var xScale = d3.scale.linear().range([marginLeft,width-maxRadius]).domain(xExtent),
			yScale = d3.scale.linear().range([h-maxRadius, maxRadius]).domain(yExtent),
			sizeScale = d3.scale.linear().range([1, Math.pow(+maxRadius,2)*Math.PI]).domain([0, d3.max(data, function (d){ return d.area; })]),
			xAxis = d3.svg.axis().scale(xScale).tickSize(-h+maxRadius*2).orient("bottom"),
    	yAxis = d3.svg.axis().scale(yScale).ticks(10).tickSize(-w+maxRadius).orient("left"),
      colorScale = d3.scale.linear().range(colors).domain(xExtent);

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    var g = chart.append("g").call(zoom);

    g.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")

        g.append("g")
            .attr("class", "x axis")
            .style("stroke-width", "1px")
        	.style("font-size","10px")
      .style("font-family","Georgia, serif")
            .attr("transform", "translate(" + 0 + "," + (h-maxRadius) + ")")
            .call(xAxis);

      	g.append("g")
            .attr("class", "y axis")
            .style("stroke-width", "1px")
            .style("font-size","10px")
			.style("font-family","Georgia, serif")
            .attr("transform", "translate(" + marginLeft + "," + 0 + ")")
            .call(yAxis);

        d3.selectAll(".y.axis line, .x.axis line, .y.axis path, .x.axis path")
         	.style("shape-rendering","crispEdges")
         	.style("fill","none")
         	.style("stroke","#ccc")

        d3.selectAll(".x.axis text")
          .attr("display", "none")


		var circle = g.selectAll("g.circle")
			.data(data)
			.enter().append("g")
			.attr("class","circle")

		var point = g.selectAll("g.point")
			.data(data)
			.enter().append("g")
			.attr("class","point")

    	circle.append("circle")
            .style("fill", function(d) { return colorScale(d.x) })
            .style("fill-opacity", .9)
    	    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })
    	    .attr("r", function (d){ return Math.sqrt(sizeScale(d.area)/Math.PI); })
           .each(function(d){
             $(this).tooltip({title:d.key, placement:"top", container: 'body'})
          })

    	point.append("circle")
            .filter(function(){ return showPoints; })
            .style("fill", "#000")
            .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })
            .attr("r", 1);

      g.append("text")
        .attr("transform","translate(" + (marginLeft*2 - 5) + "," + (maxRadius+ 5) + ") rotate(-90)")
        .attr("text-anchor", "end")
        .style("font-size","12px")
        .style("font-family","Georgia, serif")
        .text("TF/IDF")

      function zoomed() {
        g.select(".x.axis").call(xAxis);
        g.select(".y.axis").call(yAxis);

        d3.selectAll(".y.axis line, .x.axis line, .y.axis path, .x.axis path")
          .style("shape-rendering","crispEdges")
          .style("fill","none")
          .style("stroke","#ccc")

                d3.selectAll(".x.axis text")
          .attr("display", "none")

        circle.selectAll("circle").attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });
        point.selectAll("circle").attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });
      }

      reset = function() {
        d3.transition().duration(750).tween("zoom", function() {
          var ix = d3.interpolate(xScale.domain(), xExtent),
              iy = d3.interpolate(yScale.domain(), yExtent);
          return function(t) {
            zoom.x(xScale.domain(ix(t))).y(yScale.domain(iy(t)));
            zoomed();
          };
        });
        
      }

     	}); //end selection
    } // end scatterPlot

    scatterPlot.width = function(x){
      if (!arguments.length) return width;
      width = x;
      return scatterPlot;
    }

    scatterPlot.height = function(x){
      if (!arguments.length) return height;
      height = x;
      return scatterPlot;
    }

    scatterPlot.maxRadius = function(x){
      if (!arguments.length) return maxRadius;
      maxRadius = x;
      return scatterPlot;
    }

    scatterPlot.colors = function(x){
      if (!arguments.length) return colors;
      colors = x;
      return scatterPlot;
    }

    scatterPlot.showPoints = function(x){
      if (!arguments.length) return showPoints;
      showPoints = x;
      return scatterPlot;
    }

    scatterPlot.reset = function(){
        reset()
    }

    //d3.rebind(scatterPlot, dispatch, 'on');

    return scatterPlot;
  }
  
})();
