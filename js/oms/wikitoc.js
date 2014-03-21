(function(){

  var who = window.who || (window.who = {});

  who.wikitoc = function(){

    var showLines = false,
    	normalized = false,
        width = 900,
 		height = 600,
	 	dispatch = d3.dispatch("clicked");


    function wikitoc(selection){
    	selection.each(function(data){

    		var chart = selection;

    		var data = d3.entries(data)

    		console.log(new Date(data.map(function(d){return d.key})[0]))

    		var maxChapter = d3.max(data, function(d){return d.value.clusters.length})

    		var allMainChapter = d3.merge(data.map(function(d){return d.value.clusters})).filter(function(d){return d.group == 1})



    		var allName = d3.nest()
    			.key(function(d) {return d.name; })
    			.entries(allMainChapter)

    		allName = allName.map(function(d){return d.key})

    		// var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.5, 0);
    		// var xDomain = data.map(function(d){return d.key})
    		// x.domain(xDomain)

    		var allDates = data.map(function(d){return new Date(d.key)});

    		var x = d3.time.scale().rangeRound([0, width]);
    		var xDomain = [allDates[0], allDates[allDates.length-1] ]
    		//console.log(data.map(function(d){return new Date(d.key)}))
    		x.domain(xDomain).nice()
 	
 			var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.1, 0);
    		var yDomain = d3.range(maxChapter)
    		y.domain(yDomain)


    		var colorScale = d3.scale.category20()
						.domain(allName)

			var editGroup = chart.selectAll('.editGroup').data(data)

			editGroup
				.enter()
				.append("g")
				.attr("class", "editGroup")
				.attr("transform", function(d,i){ return "translate(" + x(new Date(d.key)) + ",0)"})
		
				

			
			var editToc = editGroup.selectAll('rect').data(function(d){return d.value.clusters})

			editToc
				.enter()
				.append('rect')
				//.filter(function(d){return d.status != "old"})
				//.attr("y", function(d){return y(d.rank - 1)})
				.attr("y", function(d,i){return y(i)})
				.attr("x", function(d){
						if(d.group == 1){return 0}
						//else{return (x.rangeBand()/8)}
						else{return 0}
					})
				.attr("width", function(d){
						//if(d.group == 1){return x.rangeBand()}
						//else{return (x.rangeBand() - (x.rangeBand()/2))}
						if(d.group == 1){return 5 }
						else{return 2}
					})
				.attr("height", function(d){
						if(d.group == 1){return y.rangeBand()}
						else{return (y.rangeBand()/1.5)}
					})
				.attr("fill", function(d,i){
						if(d.group == 1){return colors[d.name]}
						else{
							var data = d3.select(this.parentNode).data()[0].value.clusters[i-1]
							if(data && data.group == 1){
								var pn = data.name; 
								//var pnl = d3.rgb(colorScale(pn)).brighter().toString()
								var pnl = colors[pn]
								return  pnl
							}
							else if (data){
								var pnl = d3.select(this.parentNode.childNodes[i-1]).attr("fill")
								return pnl
							}else{return colors[d.name]}
						}
					})
				// .attr("fill", function(d,i){
				// 		return colors[d.name]
				// 	})
				.on("click", function(d){console.log(d)})



			var allValues = d3.merge(data.map(function(d){return d.value.clusters}))

			var nestValues = d3.nest()
				.key(function(d) { return d.name; })
				.entries(allValues);

			console.log(nestValues)

			// var pointsGroup = chart.selectAll('.pointGroup').data(nestValues, function(d){return d.key})

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

    	}); //end selection
    } // end wikitoc

    wikitoc.width = function(x){
      if (!arguments.length) return width;
      width = x;
      return wikitoc;
    }

    wikitoc.height = function(x){
      if (!arguments.length) return height;
      height = x;
      return wikitoc;
    }

    wikitoc.showLines = function(x){
      if (!arguments.length) return showLines;
      showLines = x;
      return wikitoc;
    }

	wikitoc.normalized = function(x){
      if (!arguments.length) return normalized;
      normalized = x;
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
    d3.rebind(wikitoc, dispatch, 'on');

    return wikitoc;
  }
  
})();