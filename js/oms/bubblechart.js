(function(){

  var who = window.who || (window.who = {});

  who.bubbleChart = function(){

    var diameter = 600,
    	query = [],
    	xMax,
	 	 dimension,
	 	 group,
	 	 filter,
     rScale;


    function bubbleChart(selection){
    	selection.each(function(data){

        var chart = selection;



        var bubble = d3.layout.pack()
          .sort(null)
          .size([diameter, diameter])
          .value(function(d){return d.value})
          .padding(1.5);

        if (!rScale){
          var _data = bubble.nodes({"key": "root", "children" : group.top(Infinity)})
          var domain = _data.map(function(d){return d.value})
          var range = _data.map(function(d){return d.r})
          domain.push(0)
          range.push(0)
          var maxVValues = d3.max(_data, function(d){return d.value})
          rScale = d3.scale.linear()
                    .domain(domain)
                    .range(range)
        }

        var bgBubbles = chart.selectAll(".bgBubble").data(bubble.nodes({"key": "root", "children" : group.top(Infinity)}))

        bgBubbles.enter().append("circle")
          .attr("r", function(d) { return d.r; })
          .attr("cx", function(d){return d.x})
          .attr("cy", function(d){return d.y})
          .attr("class", "bgBubble")
          .filter(function(d){return d.key == "root"})
          .attr("style", "display:none")

        var bubbles = chart.selectAll(".bubble").data(bubble.nodes({"key": "root", "children" : group.top(Infinity)}))

        bubbles.enter().append("circle")
          .on("click", function(d){
             var bubble = d3.select(this)
             var cl = checkSelected(bubble.attr("class"))
             bubble.attr("class", cl)
             checkQuery(d.key)
             if(query.length == 0){dimension.filterAll()}
             else(dimension.filter(function(d) { return query.indexOf(d) >= 0; }))
          })
          .attr("r", function(d) { return d.r; })
          .attr("cx", function(d){return d.x})
          .attr("cy", function(d){return d.y})
          .attr("class", "bubble")
          .attr("cursor", "pointer")
          .filter(function(d){return d.key == "root"})
          .attr("style", "display:none")


        bubbles.transition().duration(500)
          .attr("r", function(d) {return rScale(d.value); })

        bubbles.exit().remove()

        var bubblesLegend = chart.selectAll(".bubbleLegend").data(bubble.nodes({"key": "root", "children" : group.top(Infinity)}))
        
        bubblesLegend.enter().append("text")
          .attr("dy", ".3em")
          .attr("x", function(d){return d.x})
          .attr("y", function(d){return d.y})
          .style("text-anchor", "middle")
          .attr("class", "bubbleLegend")
          .text(function(d) { return d.key; })
          .filter(function(d){return d.key == "root"})
          .attr("style", "display:none")

      d3.rebind(chart, bubbles, "on")

    	}); //end selection
    } // end bubbleChart

    bubbleChart.diameter = function(x){
      if (!arguments.length) return diameter;
      diameter = x;
      return bubbleChart;
    }

    bubbleChart.xMax = function(x){
      if (!arguments.length) return xMax;
      xMax = x;
      return bubbleChart;
    }

    bubbleChart.dimension = function(x){
      if (!arguments.length) return dimension;
      dimension = x;
      return bubbleChart;
    }

    bubbleChart.group = function(x){
      if (!arguments.length) return group;
      group = x;
      return bubbleChart;
    }

    function checkSelected(x){
    	return x == 'bubble' ? 'bubble selected' : 'bubble'
    }

    function checkQuery(x){
    	var index = query.indexOf(x);
    	if (index > -1){query.splice(index, 1)}
    	else {query.push(x)}
    }

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

    return bubbleChart;
  }
  
})();