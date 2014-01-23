(function(){

  var who = window.who || (window.who = {});

  who.barChart = function(){

    var width = 600,
    	height = 600,
	 	dimension,
	 	group,
	 	filter;


    function barChart(selection){
    	selection.each(function(data){

        	var chart = selection

        	var y = d3.scale.ordinal()
    				.rangeRoundBands([0, height], .4);

			var x = d3.scale.linear()
    				.range([0, width]);


    		x.domain([0, group.top(1)[0].value]);

    		y.domain(group.top(Infinity).map(function(d){return d.key}))

    		var chartContainer = chart.append("g").attr("transform", "translate(" + 80 + ",0)");
    		
    		chartContainer.selectAll(".bar")
      			.data(group.top(Infinity))
			    .enter().append("rect")
			      .attr("class", "bar")
			      .attr("y", function(d) { return y(d.key); })
			      .attr("height", function(d) { return y.rangeBand()})
			      .attr("width", function(d){ return x(d.value)})
			      .attr("fill", "#84A594")

			chartContainer.selectAll(".yvalue")
      			.data(group.top(Infinity))
			    .enter().append("text")
			      .attr("class", "yvalue")
			      .attr("y", function(d) { return y(d.key) + y.rangeBand() -2; })
			      .attr("x", 3)
			      .text(function(d){return d.value})

			chart.selectAll(".ylegend")
      			.data(group.top(Infinity))
			    .enter().append("text")
			      .attr("class", "ylegend")
			      .attr("y", function(d) { return y(d.key) + y.rangeBand() -2; })
			      .attr("x", 3)
			      .text(function(d){return d.key})

			/* 


			var textsGroup = chart.selectAll('.textGroup').data(data)

			textsGroup
				.enter()
				.append("g")
				.attr("class",function(d){return "g_" + d.step + " textGroup"})

			textsGroup.exit().remove()

			var textGroup = textsGroup.selectAll("text").data(function(d){return d.values})

			
			textGroup	
				.enter()
				.append("text")
				.on("click", function(d){
					console.log("ciao")
				})
				.style('cursor','pointer')
				.attr("x",function(d){return x(d.step)+(x.rangeBand()/2)})
				.attr('font-family',fontFamily)
				.attr('font-size',fontSize)
				//.attr('y', 0)
				.attr('y', function(d,i){return d.yCoord;})
				.attr("text-anchor", "middle")
				.html(function(d) { return d['key'] + " <tspan style='font-weight:bold;'>" + d['value'] + " </tspan>"; })
					.transition()
					.duration(transitionDuration)
					.delay(100)
					.attr('y', function(d,i){return d.yCoord;})



			textGroup
				.html(function(d) { return d['key'] + " <tspan style='font-weight:bold;'>" + d['value'] + " </tspan>"; })
				.transition()
				.duration(transitionDuration)
					.attr('y', function(d,i){return d.yCoord;});

			textGroup.exit().remove()



			*/

    	}); //end selection
    } // end barChart

    barChart.width = function(x){
      if (!arguments.length) return width;
      width = x;
      return barChart;
    }

    barChart.height = function(x){
      if (!arguments.length) return height;
      height = x;
      return barChart;
    }

    barChart.dimension = function(x){
      if (!arguments.length) return dimension;
      dimension = x;
      return barChart;
    }

    barChart.group = function(x){
      if (!arguments.length) return group;
      group = x;
      return barChart;
    }

    barChart.filter = function(x){
      if (!arguments.length) return filter;
      filter = x;
      return barChart;
    }

    return barChart;
  }
  
})();