(function(){

  var who = window.who || (window.who = {});

  who.wikitoclegend = function(){

    var height = 600,
        width = 600,
        dispatch = d3.dispatch("clicked");


    function wikitoclegend(selection){
      selection.each(function(data){
        var chart;

        if (selection.select('svg').empty()){
          chart = selection.append('svg')
          .attr('width', width)
          .attr('height', height)
        }
        else
        {
          chart = selection.select('svg')
          .attr('width', width)
          .attr('height', height)
        }

        var legend = chart.selectAll('text').data(data, function(d){return d.name})

        legend.text(function(d){return d.label.replace(/(<([^>]+)>)/ig,"")})
              .attr("x", 0)
              .attr("text-decoration",null)
              //.transition()
              .attr("y", function(d){return d.y})
              .filter(function(d){
                return d.type == "dead"
              })
              .attr("text-decoration","line-through")

        legend.enter().append('text')
              .attr("class", function(d){return d.name})
              .attr("x", 0)
              .attr("y", function(d){return d.y})
              .attr("dy", "0.8em")
              .attr("font-family", "Georgia, serif")
              .attr("font-size", "10pt")
              .attr("text-decoration",null)
              .text(function(d){return d.label.replace(/(<([^>]+)>)/ig,"")})
              //.transition()
              //.attr("x", 0)
              .filter(function(d){
                return d.type == "dead"
              })
              .attr("text-decoration","line-through")

        legend.exit()
              //.transition()
              .attr("x", -200)
              .remove()


      }); //end selection
    } // end wikitoclegend


  wikitoclegend.height = function(x){
    if (!arguments.length) return height;
    height = x;
    return wikitoclegend;
  }

  wikitoclegend.width = function(x){
    if (!arguments.length) return width;
    width = x;
    return wikitoclegend;
  }

  d3.rebind(wikitoclegend, dispatch, 'on');

  return wikitoclegend;

  }

})();