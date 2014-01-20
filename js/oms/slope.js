(function(){

  var who = window.who || (window.who = {});

  who.slopeChart = function(){

    var listStop = false,
    	wordStep = [],
        graphWidth = 900,
 		graphHeight = 600,
	 	teamBuffer = 20,
	 	transitionDuration = 750,
	 	fontSize = 12,
	 	fontFamily = 'Arial';


    function slopeChart(selection){
    	selection.each(function(data){

        	var chart = selection

        	var x = d3.scale.ordinal().rangeRoundBands([0, graphWidth], 0.5, 0);
        	var xDomain = data.map(function(d){return d.step})
        	x.domain(xDomain);

        	var titleGroup = chart.select('.titleGroup')
			//add a title based on the conference and dates
			if(titleGroup.empty()){

				titleGroup = chart.append("g");
				titleGroup.attr('class','titleGroup');

			    var stepTitles = titleGroup.append('g').attr("class", "stepsTitle")

			    stepTitles.selectAll("text")
				    .data(xDomain)
				    .enter()
				    .append("text")
				    .attr('x', function(d){return x(d) + (x.rangeBand()/2)})
				    .attr('y', 20)
				    .attr('font-family',fontFamily)
				    .attr('font-size',13)
				    .attr('text-anchor','middle')
				    .text(function(d){return d});

			}
			//if the title group exists, just change the text values
			else{
					//todo
			}

			var slopeModel = function(data, height, step){

				var _data = data;
				var valuesList = _data.map(function(d){
					return d['value']
				})

				var yScale = d3.scale.linear()
				.domain([d3.min(valuesList),d3.max(valuesList)])
				.range([height-300,60]);

				_data.forEach(function(d){
					d.yCoord = yScale(d['value'])
					d.step = step
				})

				adjustYCoords(_data)

			}

			data.forEach(function(d){
				slopeModel(d.values, graphHeight, d.step)
			})


			/* new code */


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
				.attr("x",function(d){return x(d.step)+(x.rangeBand()/2)})
				.attr('font-family',fontFamily)
				.attr('font-size',fontSize)
				//.attr('y', 0)
				.attr('y', function(d,i){return d.yCoord;})
				.attr("text-anchor", "middle")
				.text(function(d) { return d['key'] + " " + d['value'] ; })
					.transition()
					.duration(transitionDuration)
					.delay(100)
					.attr('y', function(d,i){return d.yCoord;})


			textGroup
				.text(function(d) { return d['key'] + " " + d['value'] ; })
				.transition()
				.duration(transitionDuration)
					.attr('y', function(d,i){return d.yCoord;});

			textGroup.exit().remove()

			if (listStop) return;

			var allValues = d3.merge(data.map(function(d){return d.values}))

			var nestValues = d3.nest()
				.key(function(d) { return d.key; })
				.entries(allValues);

			var line = d3.svg.line()
				.x(function(d) { return x(d.step)+(x.rangeBand()/2); })
				.y(function(d) { return (d.yCoord+5); })


			var linesGroup = chart.selectAll('.lineGroup').data(nestValues)


			linesGroup.enter().append("path")
				.filter(function(d){
					if(wordStep.length > 0){
						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " lineGroup"})
				.attr("d", function(d) { return line(d.values)})
				.attr("fill", "none")
				.attr("stroke", "grey")
				.attr("stroke-width", 0.5)

			linesGroup
				.filter(function(d){
					if(wordStep.length > 0){
						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.transition()
				.duration(transitionDuration)
					.attr("d", function(d) { return line(d.values)})

			linesGroup.exit().remove()

			var pointsGroup = chart.selectAll('.pointGroup').data(nestValues)

			pointsGroup
				.enter()
				.append("g")
				.filter(function(d){
					if(wordStep.length > 0){

						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.attr("class",function(d){return "g_" + d.key.replace(/\s+/g, '') + " pointGroup"})

			pointsGroup.exit().remove()

			var pointGroup = pointsGroup.selectAll("path").data(function(d){return d.values})


			pointGroup
				.enter().append("path")
				.filter(function(d){
					if(wordStep.length > 0){

						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.attr("d", d3.svg.symbol()
					.size(function(d) { return 20; })
					.type(function(d) { return "circle"; }))
				.attr("fill", "grey")
				.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2)) + "," + (d.yCoord+5) + ")"; });

			pointGroup
				.filter(function(d){
					if(wordStep.length > 0){

						var check = wordStep.indexOf(d['key']);
						return check >= 0
					}
					else{return true}
				})
				.transition()
				.duration(transitionDuration)
				.attr("transform", function(d) { return "translate(" + (x(d.step)+(x.rangeBand()/2)) + "," + (d.yCoord+5) + ")"; });

			pointGroup.exit().remove()

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

    return slopeChart;
  }
  
})();