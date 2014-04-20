(function(){

  var who = window.who || (window.who = {});

  who.spallozzoChart = function(){

    var listStop = false,
    	showLines = false,
    	showCat = [],
    	wordStep = [],
    	normalized = true,
        graphWidth = 900,
 		graphHeight = 600,
	 	teamBuffer = 20,
	 	transitionDuration = 750,
	 	fontSize = 12,
	 	fontFamily = 'Georgia',
	 	legendCont,
	 	dispatch = d3.dispatch("clicked");


    function spallozzoChart(selection){
    	selection.each(function(data){

        	var chart = selection,
        		_data;

        	console.log(showCat)
        	if(!showCat.length){
	        	var wordsList = data[0].values.map(function(d){return d.key})
	        	_data = [{"step": "words list", values : []}]

	        	wordsList.forEach(function(d){
		        		_data[0].values.push({
		        			key: d,
		        			value : 1
		        		})
	        		})
        	}else{
        		_data = data.filter(function(d){if(showCat.indexOf(d.step) > -1) return true});
        	}

        	var x = d3.scale.ordinal().rangeRoundBands([0, graphWidth], 0.5, 0);
        	var xDomain = ["ENTITIES"]
        	xDomain = xDomain.concat(_data.map(function(d){return d.step}))
        	console.log(xDomain)
        	x.domain(xDomain);

        	var y = d3.scale.ordinal().rangePoints([25, graphHeight],0.5);
        	var yDomain = _data[0].values.map(function(d){return d.key})
        	y.domain(yDomain);


        	var radiusDomain = []
        	_data.forEach(function(d){
        		var max = d3.max(d.values.map(function(e){return e.value}));
        		var min = d3.min(d.values.map(function(e){return e.value}));

        		if(radiusDomain[1] === undefined) radiusDomain[1] = max
        		else if (radiusDomain[1] < max)  radiusDomain[1] = max;

        		if(radiusDomain[0] === undefined) radiusDomain[0] = min
        		else if (radiusDomain[0] > min)  radiusDomain[0] = min;

        	})

        	var radiusScale = d3.scale.linear()
        						.range([Math.pow(0,2)*Math.PI, Math.pow(25,2)*Math.PI])
        						.domain(radiusDomain)

			/* new code */

			var titleGroup = legendCont.select('.titleGroup')

			if(titleGroup.empty()){
				titleGroup = legendCont.append("g").attr('class','titleGroup');
			}

		    var stepTitles = titleGroup.selectAll('text').data(xDomain, function(d){return d})

		    stepTitles
				.text(function(d){return d})
				.transition()
				.duration(transitionDuration)
				//.attr('x', function(d){return x(d) + (x.rangeBand()/2)})

		    stepTitles
			    .enter()
			    .append("text")
			    .attr('x', function(d){return x(d) + (x.rangeBand()/2)})
			    .attr('y', 30)
			    .attr('opacity', 1)
			    .attr('font-family','Montserrat')
			    .attr('font-size',13)
			    .attr('font-weight',700)
			    .attr('text-anchor','middle')
			    .text(function(d){return d})
				.filter(function(d){return d == "ENTITIES"})
					.attr('text-anchor','end')
					.attr('x', function(d){return x(d) + (x.rangeBand())})

			stepTitles.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()



			var circlesGroup = chart.selectAll('.circleGroup').data(_data, function(d){return d.step})

			circlesGroup
				.attr("class",function(d){return "g_" + d.step.replace(" ", "_") + " circleGroup"});

			circlesGroup
				.enter()
				.append("g")
				.attr("class",function(d){return "g_" + d.step.replace(" ", "_") + " circleGroup"})
				.attr('opacity', 1);

			circlesGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			var circleGroup = circlesGroup.selectAll("circle").data(function(d){return d.values}, function(d){return d.key})

			circleGroup
				.transition()
				.duration(transitionDuration)
					.attr('cy', function(d){return y(d.key);})
					.attr("cx",function(d){return x(d.step)+(x.rangeBand()/2)})
					.attr("r", function(d){return Math.sqrt((radiusScale(d.value)/Math.PI))})
			
			circleGroup	
				.enter()
				.append("circle")
				.on("click", function(d){
					dispatch.clicked(d.key);
				})
				.style('cursor','pointer')
				.attr('opacity', 0.5)
				.attr("cx",function(d){return x(d.step)+(x.rangeBand()/2)})
				.attr('cy', function(d){return y(d.key);})
				.attr("r", function(d){return Math.sqrt((radiusScale(d.value)/Math.PI))})
				.attr("fill", "#42A8A8")


			circleGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			var legendsGroup = chart.selectAll('.legendGroup').data([yDomain])

			legendsGroup
				.attr("class",function(d){return "g_entities legendGroup"});

			legendsGroup
				.enter()
				.append("g")
				.attr("class",function(d){return "g_entities legendGroup"})
				.attr('opacity', 1);

			legendsGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			var legendGroup = legendsGroup.selectAll("text").data(function(d){return d}, function(d){return d})

			legendGroup
				.transition()
				.duration(transitionDuration)
					.attr('y', function(d){return y(d);})
					.attr("x",function(d){return x("ENTITIES")+(x.rangeBand())})
					.text(function(d){return d})
			
			legendGroup	
				.enter()
				.append("text")
				.on("click", function(d){
					dispatch.clicked(d);
				})
				.style('cursor','pointer')
				.attr('opacity', 1)
				.attr("x",function(d){return x("ENTITIES")+(x.rangeBand())})
				.attr('y', function(d){return y(d);})
				.attr("fill", "#222222")
				.attr('font-family',fontFamily)
				.attr('font-size',fontSize)
				.attr("text-anchor", "end")
				.text(function(d){ return d})



			legendGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			//if (!showLines) return;

			// var allValues = d3.merge(_data.map(function(d){return d.values}))

			// var nestValues = d3.nest()
			// 	.key(function(d) { return d.key; })
			// 	.entries(allValues);

			// var line = d3.svg.line()
			// 	.x(function(d) { return x(d.step)+(x.rangeBand()/2); })
			// 	.y(function(d) { return (d.yCoord+3); })


			// var linesGroup = chart.selectAll('.lineGroup').data(nestValues, function(d){return d.key})

			// if (!showLines) {
			// 	linesGroup.remove()
			// }
			// else{
			// linesGroup
			// 	.transition()
			// 	.duration(transitionDuration)
			// 		.attr("d", function(d) { return line(d.values)})
			// 		.attr("stroke-opacity", 0)
			// 		.filter(function(d){
			// 		if(wordStep.length > 0){
			// 				var check = wordStep.indexOf(d['key']);
			// 				return check >= 0
			// 			}
			// 			else{return true}
			// 		})
			// 		.attr("stroke-opacity", 0.7)


			// linesGroup.enter().append("path")
			// 	.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " lineGroup"})
			// 	.attr("d", function(d) { return line(d.values)})
			// 	.attr("fill", "none")
			// 	.attr("stroke-opacity", 0)
			// 	.attr("stroke", "grey")
			// 	.attr("stroke-width", 0.5)
			// 	.filter(function(d){
			// 		if(wordStep.length > 0){
			// 			var check = wordStep.indexOf(d['key']);
			// 			return check >= 0
			// 		}
			// 		else{return true}
			// 	})
			// 	.transition()
			// 	.duration(transitionDuration)
			// 		.attr("stroke-opacity", 0.7)


			// linesGroup.exit()
			// 	.transition()
			// 	.duration(transitionDuration)
			// 	.attr("stroke-opacity", 0)
			// 	.remove()

			// }

			// var pointsGroup = chart.selectAll('.pointGroup').data(nestValues, function(d){return d.key})

			// if (!showLines) {

			// 	pointsGroup.remove()
			// }else{


			// pointsGroup
			// 	.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " pointGroup"})

			// pointsGroup
			// 	.enter()
			// 	.append("g")
			// 	.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " pointGroup"})
			// 	.attr("opacity", 1)

			// pointsGroup.exit()
			// 	.transition()
			// 	.duration(transitionDuration)
			// 	.attr("opacity", 0)
			// 	.remove()

			// var pointGroup = pointsGroup.selectAll("path").data(function(d){return d.values})


			// pointGroup
			// 	.transition()
			// 	.duration(transitionDuration)
			// 	.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2) -3) + "," + (d.yCoord+2) + ")"; })
			// 	.attr("fill-opacity", 0)
			// 	.filter(function(d){
			// 		if(wordStep.length > 0){

			// 			var check = wordStep.indexOf(d['key']);
			// 			return check >= 0
			// 		}
			// 		else{return true}
			// 	})
			// 	.attr("fill-opacity", 0.7)


			// pointGroup
			// 	.enter().append("path")
			// 	.attr("d", "M0,0 l6,0 A3,3 0 0,1 0,0 z")
			// 	.attr("fill", "grey")
			// 	.attr("fill-opacity", 0)
			// 	.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2) -3) + "," + (d.yCoord+2) + ")"; })
			// 	.filter(function(d){
			// 		if(wordStep.length > 0){

			// 			var check = wordStep.indexOf(d['key']);
			// 			return check >= 0
			// 		}
			// 		else{return true}
			// 	})
			// 	.transition()
			// 	.duration(transitionDuration)
			// 		.attr("fill-opacity", 0.7)



			// pointGroup.exit()
			// 	.transition()
			// 	.duration(transitionDuration)
			// 	.attr("fill-opacity", 0)
			// 	.remove()

			// }

			/* end new code */


    	}); //end selection
    } // end spallozzoChart

    spallozzoChart.graphWidth = function(x){
      if (!arguments.length) return graphWidth;
      graphWidth = x;
      return spallozzoChart;
    }

    spallozzoChart.graphHeight = function(x){
      if (!arguments.length) return graphHeight;
      graphHeight = x;
      return spallozzoChart;
    }

    spallozzoChart.listStop = function(x){
      if (!arguments.length) return listStop;
      listStop = x;
      return spallozzoChart;
    }

    spallozzoChart.wordStep = function(x){
      if (!arguments.length) return wordStep;
      wordStep = x;
      return spallozzoChart;
    }

    spallozzoChart.showLines = function(x){
      if (!arguments.length) return showLines;
      showLines = x;
      return spallozzoChart;
    }

	spallozzoChart.showCat = function(x){
      if (!arguments.length) return showCat;
      showCat = x;
      return spallozzoChart;
    }

	spallozzoChart.normalized = function(x){
      if (!arguments.length) return normalized;
      normalized = x;
      return spallozzoChart;
    }

	spallozzoChart.legendCont = function(x){
      if (!arguments.length) return legendCont;
      legendCont = x;
      return spallozzoChart;
    }

    d3.rebind(spallozzoChart, dispatch, 'on');

    return spallozzoChart;
  }
  
})();