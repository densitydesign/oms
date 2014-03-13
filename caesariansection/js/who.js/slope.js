(function(){

  var who = window.who || (window.who = {});

  who.slopeChart = function(){

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
	 	dispatch = d3.dispatch("clicked");


    function slopeChart(selection){
    	selection.each(function(data){

        	var chart = selection,
        		_data;

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
        	var xDomain = _data.map(function(d){return d.step})
        	x.domain(xDomain);

        	var range = []
        	_data.forEach(function(d){
        		var max = d3.max(d.values.map(function(e){return e.value}));
        		var min = d3.min(d.values.map(function(e){return e.value}));

        		if(range[1] === undefined) range[1] = max
        		else if (range[1] < max)  range[1] = max;

        		if(range[0] === undefined) range[0] = min
        		else if (range[0] > min)  range[0] = min;

        	})


			var slopeModel = function(data, height, step){

				var _data = data;

				

				var valuesList = _data.map(function(d){
					return d['value']
				})

				var yScale = d3.scale.linear()
				.range([height-20,60])
				.domain(range);

				if(normalized){
					yScale.domain([d3.min(valuesList),d3.max(valuesList)])
				}else{
					yScale.domain(range)
				}

				_data.forEach(function(d){
					d.yCoord = yScale(d['value'])
					d.step = step
				})

				adjustYCoords(_data)

			}

			_data.forEach(function(d){
				slopeModel(d.values, graphHeight, d.step)
			})

			 var range2 = []
        	_data.forEach(function(d){
        		var max = d3.max(d.values.map(function(e){return e['yCoord']}));
        		var min = d3.min(d.values.map(function(e){return e['yCoord']}));

        		if(range2[1] === undefined) range2[1] = max
        		else if (range2[1] < max)  range2[1] = max;

        		if(range2[0] === undefined) range2[0] = min
        		else if (range2[0] > min)  range2[0] = min;

        	})

        	_data.forEach(function(d){
        		var yScale = d3.scale.linear()
				.range([60, graphHeight-20]);

				var valuesList = d.values.map(function(d){
					return d['yCoord']
				})

				if(normalized){
					yScale.domain([d3.min(valuesList),d3.max(valuesList)])
				}else{
					yScale.domain(range2)
				}

        		d.values.forEach(function(e){
					e.yCoord = yScale(e['yCoord'])
				})

			})

			/* new code */

			var titleGroup = chart.select('.titleGroup')

			if(titleGroup.empty()){
				titleGroup = chart.append("g").attr('class','titleGroup');
			}

		    var stepTitles = titleGroup.selectAll('text').data(xDomain, function(d){return d})

		    stepTitles
				.text(function(d){return d})
				.transition()
				.duration(transitionDuration)
				.attr('x', function(d){return x(d) + (x.rangeBand()/2)})

		    stepTitles
			    .enter()
			    .append("text")
			    .attr('x', graphWidth)
			    .attr('y', 20)
			    .attr('opacity', 0)
			    .attr('font-family','Montserrat')
			    .attr('font-size',13)
			    .attr('font-weight',700)
			    .attr('text-anchor','middle')
			    .text(function(d){return d})
			    	.transition()
					.duration(transitionDuration)
					.attr('opacity', 1)
					.attr('x', function(d){return x(d) + (x.rangeBand()/2)})

			stepTitles.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()



			var textsGroup = chart.selectAll('.textGroup').data(_data, function(d){return d.step})

			textsGroup
				.attr("class",function(d){return "g_" + d.step.replace(" ", "_") + " textGroup"});

			textsGroup
				.enter()
				.append("g")
				.attr("class",function(d){return "g_" + d.step.replace(" ", "_") + " textGroup"})
				.attr('opacity', 1);

			textsGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			var textGroup = textsGroup.selectAll("text").data(function(d){return d.values}, function(d){return d.key})

			textGroup
				.html(function(d) { return d['key'] + " <tspan style='font-weight:bold;'>" + d['value'] + " </tspan>"; })
				.transition()
				.duration(transitionDuration)
					.attr('y', function(d){return d.yCoord;})
					.attr("x",function(d){return x(d.step)+(x.rangeBand()/2)});
			
			textGroup	
				.enter()
				.append("text")
				.on("click", function(d){
					dispatch.clicked(d.key);
				})
				.style('cursor','pointer')
				.attr('opacity', 0)
				.attr("x",graphWidth)
				.attr('font-family',fontFamily)
				.attr('font-size',fontSize)
				.attr('y', function(d){return d.yCoord;})
				.attr("text-anchor", "middle")
				.html(function(d) { return d['key'] + " <tspan style='font-weight:bold;'>" + d['value'] + " </tspan>"; })
					.transition()
					.duration(transitionDuration)
					.attr('opacity', 1)
					.attr('y', function(d){return d.yCoord;})
					.attr("x",function(d){return x(d.step)+(x.rangeBand()/2)})


			textGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr('opacity', 0)
				.remove()

			if (!showLines) return;

			var allValues = d3.merge(_data.map(function(d){return d.values}))

			var nestValues = d3.nest()
				.key(function(d) { return d.key; })
				.entries(allValues);

			var line = d3.svg.line()
				.x(function(d) { return x(d.step)+(x.rangeBand()/2); })
				.y(function(d) { return (d.yCoord+3); })


			var linesGroup = chart.selectAll('.lineGroup').data(nestValues, function(d){return d.key})

			linesGroup
				.transition()
				.duration(transitionDuration)
					.attr("d", function(d) { return line(d.values)})
					.attr("stroke-opacity", 0)
					.filter(function(d){
					if(wordStep.length > 0){
							var check = wordStep.indexOf(d['key']);
							return check >= 0
						}
						else{return true}
					})
					.attr("stroke-opacity", 0.7)


			linesGroup.enter().append("path")
				.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " lineGroup"})
				.attr("d", function(d) { return line(d.values)})
				.attr("fill", "none")
				.attr("stroke-opacity", 0)
				.attr("stroke", "grey")
				.attr("stroke-width", 0.5)
				.filter(function(d){
					if(wordStep.length > 0){
						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.transition()
				.duration(transitionDuration)
					.attr("stroke-opacity", 0.7)


			linesGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr("stroke-opacity", 0)
				.remove()

			var pointsGroup = chart.selectAll('.pointGroup').data(nestValues, function(d){return d.key})

			pointsGroup
				.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " pointGroup"})

			pointsGroup
				.enter()
				.append("g")
				.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " pointGroup"})
				.attr("opacity", 1)

			pointsGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr("opacity", 0)
				.remove()

			var pointGroup = pointsGroup.selectAll("path").data(function(d){return d.values})

			pointGroup
				.transition()
				.duration(transitionDuration)
				.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2) -3) + "," + (d.yCoord+2) + ")"; })
				.attr("fill-opacity", 0)
				.filter(function(d){
					if(wordStep.length > 0){

						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.attr("fill-opacity", 0.7)


			pointGroup
				.enter().append("path")
				.attr("d", "M0,0 l6,0 A3,3 0 0,1 0,0 z")
				.attr("fill", "grey")
				.attr("fill-opacity", 0)
				.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2) -3) + "," + (d.yCoord+2) + ")"; })
				.filter(function(d){
					if(wordStep.length > 0){

						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.transition()
				.duration(transitionDuration)
					.attr("fill-opacity", 0.7)



			pointGroup.exit()
				.transition()
				.duration(transitionDuration)
				.attr("fill-opacity", 0)
				.remove()

			/* end new code */

			//function to be implemented in a better way
			function adjustYCoords(conference){
				//adjustment algorithm based on the one used in here: http://skedasis.com/d3/slopegraph/
				for(var i=0;i< conference.length;i++){
					var val = conference[i];
					if(i > 0){
						var previousVal = conference[i-1];
						if((val.yCoord - teamBuffer) < previousVal.yCoord){
							val.yCoord = val.yCoord + teamBuffer;
							for(var j=i;j<conference.length;j++){
								conference[j].yCoord = conference[j].yCoord + teamBuffer;
							}
						}
					}
				}
			}

    	}); //end selection
    } // end slopeChart

    slopeChart.graphWidth = function(x){
      if (!arguments.length) return graphWidth;
      graphWidth = x;
      return slopeChart;
    }

    slopeChart.graphHeight = function(x){
      if (!arguments.length) return graphHeight;
      graphHeight = x;
      return slopeChart;
    }

    slopeChart.listStop = function(x){
      if (!arguments.length) return listStop;
      listStop = x;
      return slopeChart;
    }

    slopeChart.wordStep = function(x){
      if (!arguments.length) return wordStep;
      wordStep = x;
      return slopeChart;
    }

    slopeChart.showLines = function(x){
      if (!arguments.length) return showLines;
      showLines = x;
      return slopeChart;
    }

	slopeChart.showCat = function(x){
      if (!arguments.length) return showCat;
      showCat = x;
      return slopeChart;
    }

	slopeChart.normalized = function(x){
      if (!arguments.length) return normalized;
      normalized = x;
      return slopeChart;
    }

    d3.rebind(slopeChart, dispatch, 'on');

    return slopeChart;
  }
  
})();