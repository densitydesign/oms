(function(){

  var who = window.who || (window.who = {});

  who.wikitoc = function(){

    var height = 600,
    	maxRectWidth = 30,
    	oneDayPixel = 0.5,
    	x2,
    	allDates,
    	allDatesString,
    	morePixel,
	 	dispatch = d3.dispatch("clicked");


    function wikitoc(selection){
    	selection.each(function(data){

    		var chart;

    		var data = d3.entries(data)

    		var maxChapter = d3.max(data, function(d){return d.value.clusters.length})

    		allDatesString = data.map(function(d){return d.key});

    		allDates = data.map(function(d){return d3.time.day.floor(new Date(d.key))});
    		var allDatesInterval = d3.time.day.range(allDates[0], d3.time.day.offset(allDates[allDates.length-1],1))

    		var maxRectWPadding = maxRectWidth-(maxRectWidth*0.2);

    		var width = ((allDatesInterval.length - allDates.length)*oneDayPixel) + (allDates.length*maxRectWidth)

    		if (selection.select('svg').empty()){
	            chart = selection.append('svg')
	              .attr('width', Math.round(morePixel - maxRectWidth + width + (allDates.length*maxRectWidth)))
	              .attr('height', height)
	          }
	        else
	          {
	            chart = selection.select('svg')
	                  .attr('width', Math.round(morePixel - maxRectWidth + width + (allDates.length*maxRectWidth)))
	                  .attr('height', height)
	         }

    		var x = d3.scale.ordinal().rangeRoundBands([0, width-((allDatesInterval.length - allDates.length)*oneDayPixel)],0.1,0);
    		var xDomain = allDates
    		x.domain(xDomain)

    		x2 = d3.time.scale().rangeRound([0, width]);
    		var x2Domain = [allDates[0], allDates[allDates.length-1] ]
    		x2.domain(x2Domain)
 	
 			var y = d3.scale.ordinal().rangeRoundBands([50, height], 0.3, 0);
    		var yDomain = d3.range(maxChapter)
    		y.domain(yDomain)


			data.forEach(function(d,i){
				d.value.clusters.forEach(function(e,f){
					e.key = d.key
					e.y = y(f);
					e.x = x2(d3.time.day.floor(new Date(d.key))) + (i*maxRectWidth); 
				})
			})

			var allValues = d3.merge(data.map(function(d){return d.value.clusters}))

			var nestValues = d3.nest()
				.key(function(d) { return d.name; })
				.entries(allValues);

			var line = d3.svg.line()
				 .interpolate(function(points){
					var path = "";
					  for (var i = 0; i < points.length; i++) {
					    if(i != points.length-1){
					    path += points[i][0] +  "," + points[i][1] + " L" + (points[i][0]+maxRectWPadding) + "," + (points[i][1]) + " C";
					    var xControl = (points[i+1][0] - (points[i][0]+maxRectWPadding))/2;
					    path += ((points[i][0]+maxRectWPadding) + xControl) + "," + points[i][1] + " " + ((points[i][0]+maxRectWPadding) + xControl) + "," + points[i+1][1] + " ";
						}else{
							path+= points[i][0] + "," + points[i][1] + " L" + (points[i][0]+(maxRectWidth/2)) + "," + (points[i][1])
						}
					  }
					 return path;
				 })
				.x(function(d) { return d.x })
				.y(function(d) { return d.y + y.rangeBand()/2})


			var linesGroup = chart.selectAll('.lineGroup').data(nestValues)

			linesGroup.enter().append("path")
				.attr("class",function(d){return d.key.replace(/\s+/g, '') + " lineGroup"})
				.attr("d", function(d) { return line(d.values)})
				.attr("fill", "none")
				.attr("stroke", "grey")
				.attr("stroke-width",1)
				.attr("stroke-opacity", 1)


			var editGroup = chart.selectAll('.editGroup').data(data)

			editGroup
				.enter()
				.append("g")
				.attr("class", "editGroup")
				.attr("transform", function(d,i){return "translate(" + (x2(d3.time.day.floor(new Date(d.key))) + (i*maxRectWidth) )+ ",0)"})
		

			var editToc = editGroup.selectAll('rect').data(function(d){return d.value.clusters})

			editToc
				.enter()
				.append('rect')
				.attr("y", function(d,i){ 
									if(d.group == 1){return y(i)}
									else{return y(i) + (y.rangeBand()*0.6)/2}
								})
				.attr("x", 0)
				.attr("width", function(d){
						return x.rangeBand()
					})
				.attr("height", function(d){
						if(d.group == 1){return y.rangeBand()}
						else{return (y.rangeBand()*0.6)}
					})
				.attr("fill", function(d,i){ //here starts very bad parctice
						if(d.type == "dead"){return "none"}
						else{
							if(d.group == 1){return colors[d.name]}
							else {
								var counter = 1
								var data = d3.select(this.parentNode).data()[0].value.clusters[i - counter]
								if(data.type == "dead"){
									counter++
									data = d3.select(this.parentNode).data()[0].value.clusters[i - counter]
								}

								if(data && data.group == 1 ){
									var pn = data.name; 
									var pnl = colors[pn]
									return pnl
								}
								else if (data){
									var counter = 1
									var pnl = d3.select(this.parentNode.childNodes[i-counter]).attr("fill")
									if(pnl == "black" || pnl == "none"){
										counter++
										pnl = d3.select(this.parentNode.childNodes[i-counter]).attr("fill")
									}
									return pnl
								}else{
									
									return colors[d.name]
								}
							}
						}
					}) //here ends very bad parctice
				.attr("fill-opacity", 1)
				.attr("stroke-opacity", 1)
				.attr("stroke", function(d){
					if(d.type == "new"){
						return 'black'
					}else{return 'none'}
				})
				.attr("class", function(d){return d.name})
				.on("click", function(d){


					
					if (!d.click){

					d.click = true;
					chart.selectAll('rect')
						.transition()
						.attr("fill-opacity", function(e){
							if(e.name != d.name){return 0.2}
							else{return 1}
						})
						.attr("stroke-opacity", function(e){
							if(e.name != d.name){return 0.2}
							else{return 1}
						})

					chart.selectAll('path.lineGroup')
						.attr("stroke-opacity", function(e){
							if(e.key != d.name){return 0}
							else{return 1}
						})



					}else{

					chart.selectAll('rect')
						.transition()
						.attr("fill-opacity", function(e){e.click = false; return 1})
						.attr("stroke-opacity", 1)
						.attr("stroke", function(e){
					 			if(e.type == 'new'){return 'black'}
					 			else{return "none"}
							})

					chart.selectAll('path.lineGroup')
						.transition()
						.attr("stroke-opacity", 1)
					}
				})

			var editDate = editGroup.selectAll('text').data(function(d){return [d]})

			editDate
				.enter()
				.append('text')
				.attr("y", 15)
				.attr('font-family','Montserrat')
			    .attr('font-size',11)
			    .attr('font-weight',400)
			    .attr('dy', '0.71em')
			    .attr('text-anchor','middle')
				.text(function(d){
					var date = new Date(d.key)
					return date.getFullYear() + " " + months[date.getMonth()] + " " + date.getDate();
				})
				.call(wrap, maxRectWidth, maxRectWidth/2)

			var editTocX = editGroup.selectAll('.crossGroup').data(function(d){return d.value.clusters})

			editTocX
				.enter()
				.append('path')
				.attr("class", "crossGroup")
				.attr("transform", function(d,i){
					return "translate(" + maxRectWidth/2 + "," + (y(i)+y.rangeBand()/2) + ") rotate(45)"
					})
				.filter(function(d){return d.type == "dead"})
				.attr("d", d3.svg.symbol().type("cross").size(40))
				.attr("fill", "black")

    	}); //end selection
    } // end wikitoc


    wikitoc.height = function(x){
      if (!arguments.length) return height;
      height = x;
      return wikitoc;
    }

    wikitoc.maxRectWidth = function(x){
      if (!arguments.length) return maxRectWidth;
      maxRectWidth = x;
      return wikitoc;
    }

    wikitoc.oneDayPixel = function(x){
      if (!arguments.length) return oneDayPixel;
      oneDayPixel = x;
      return wikitoc;
    }

    wikitoc.getPixel = function(x){
      if (!arguments.length) return;
      var pos =  allDatesString.indexOf(x)
      var pixel = x2(d3.time.day.floor(new Date(x))) + (pos*maxRectWidth);
      return pixel;
    }

    wikitoc.morePixel = function(x){
      if (!arguments.length) return morePixel;
      morePixel = x;
      return wikitoc;
    }

    var colors = {
		'Adverse_effects': '#993333',
		'Birth_control_methods': '#449093',
		'Effectiveness': '#998250',
		'Effects': '#998250',
		'Etymology_and_movement': '#094A65',
		'Definition': '#094A65',
		'External_Links': '#819A90',
		'External_links': '#819A90',
		'Further_reading': '#B8DBCD',
		'History': '#4F8D3C',
		'History_of_Birth_Control': '#4F8D3C',
		'History_of_birth_control': '#4F8D3C',
		'History_of_birth_control_2': '#4F8D3C',
		'History_of_birth_control_techniques_and_methods': '#4F8D3C',
		'In_other_animals': '#346280',
		'Legality': '#662B84',
		'Mechanisms_of_action': '#A0BCA4',
		'Methods': '#449093',
		'Misconceptions': '#CC6632',
		'Modern_Birth_Control_Methods:': '#662B84',
		'Modern_Folklore': '#CC6632',
		'Modern_birth_control_methods': '#662B84',
		'Modern_birth_control_methods:': '#662B84',
		'Modern_birth_control_methods_2': '#662B84',
		'Myths': '#CC6632',
		'Other_animals': '#346280',
		'Prevalence': '#94616D',
		'Quotes': '#A0BCA4',
		'Quote': '#A0BCA4',
		'References': '#78AEAA',
		'Religious_and_Cultural_Attitudes_to_Birth_Control': '#E9AB45',
		'Religious_and_cultural_attitudes': '#E9AB45',
		'Religious_and_cultural_attitudes_to_birth_control': '#E9AB45',
		'Religious_and_cultural_attitudes_toward_birth_control': '#E9AB45',
		'Religious_and_cultural_attitudes_to_birth_control_2': '#E9AB45',
		'Research': '#845597',
		'Research_directions': '#845597',
		'See_also': '#B8DBCD',
		'Side_effects': '#74A460',
		'Society_and_culture': '#E9AB45',
		'Traditional_Birth_Control_Methods:': '#449093',
		'Traditional_birth_control_methods': '#449093',
		'Traditional_birth_control_methods:': '#449093',
		'Traditional_birth_control_methods_2': '#449093',
		//for family planning
		'Components_of_Family_Planning': '#CC6632',
		'Definitions': '#449093',
		'Purposes': '#449093',
		'Policy': '#662B84',
		'Regional_variations': '#662B84',
		'Family_Planning_Policy_in_the_United_States':'#662B84',
		'Modern_methods': '#E9AB45',
		'Planning_Children': '#EA9651',
		'World_Contraception_Day': '#B83935',
		'Birth_control': '#4F8D3C',
		'Natural_family_planning': '#998250',
		'See_Also': '#B8DBCD',
		'International_oversight': '#998250'
	}

	function wrap(text, width, x) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}

	var months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

    d3.rebind(wikitoc, dispatch, 'on');

    return wikitoc;
  }
  
})();