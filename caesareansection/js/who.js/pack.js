(function(){

  var who = window.who || (window.who = {});

  who.packed = function(){

    
        var graphWidth = 1200,
 		graphHeight = 600,
	 	transitionDuration = 750,
	 	fontSize = 12,
	 	dep=3,
	 	fontFamily = 'Arial',
	 	pack;
	 	
	 	var rebindData;


    function packed(selection){
    	selection.each(function(data){

        	var chart = selection
        	var finData={"key":"data",
        	"values":data}
        	
        	
        	var diameter = 900,
		    format = d3.format(",d");
		
			pack = d3.layout.pack()
			.sort(function(d){return d.time})
			.children(function(d) {return d.values})
		    .size([diameter - 4, diameter - 4])
		    .padding(1)
		    .value(function(d) { return 1; });
		    
		    
		   var node = chart.datum(finData).selectAll(".node")
	       .data(pack.nodes)
	       //.data(function(d) )
	       
	        node.enter().append("g")
	       .attr("class", function(d) { return d.values ? "node" : "leaf node"; })
	       .attr("depth", function(d) { return d.depth; })
	       //.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })	
			
			
			circles=node.filter(function(d){if(d.depth>dep) return false; else return true})
			.append("circle")
      		//.attr("r", function(d) { return d.r; })
      		.style("opacity",function(d){if (d.depth==3) return 1; else return 0.25})
      		.style("fill",function(d){if (d.depth==3) return "#ff7f0e"; else return "#C6DBEB"})
      		
      		.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; })
		    .attr("r", function(d) { return d.r; });	
      		
      		
      		$(".node:first-child").remove();
      		//node.filter(function(d){return d.depth<=depth})
      		
      		node.exit().remove();
      		
      		
      		 dataByTime = function() {
      		 	
      			pack = d3.layout.pack()
				.children(function(d) {return d.values})
			    .size([diameter - 4, diameter - 4])
			    .padding(1)
			    .value(function(d) {return d.time; });
			    
			    pack.nodes(finData);

		  
		    circles.transition()
		        .duration(1000)
		        .attr("cx", function(d) { return d.x; })
		    	.attr("cy", function(d) { return d.y; })
		        .attr("r", function(d) { return d.r; });
      		}
      		
      		 defaultData = function() {
      		 	
      			pack = d3.layout.pack()
				.children(function(d) {return d.values})
			    .size([diameter - 4, diameter - 4])
			    .padding(1)
			    .value(function(d) {return 1; });
			    
			    pack.nodes(finData);

		  
		    circles.transition()
		        .duration(1000)
		        .attr("cx", function(d) { return d.x; })
		    	.attr("cy", function(d) { return d.y; })
		        .attr("r", function(d) {return d.r; });
      		}
      		
      		deep = function(x) {
      			dep=x;
      			
      		d3.selectAll("circle").transition().duration(500).filter(function(d){if(d.depth>dep) return false; else return true})
      		.style("opacity",function(d){ if (d.depth>2) {return 1} else {return 0.25}});
		    
  			d3.selectAll("circle").transition().duration(500).filter(function(d){if(d.depth>dep) return true; else return false})
		    .style("opacity",function(){ return 0});
      		
      		}

    	}); //end selection
    } // end packed

    packed.graphWidth = function(x){
      if (!arguments.length) return graphWidth;
      graphWidth = x;
      return packed;
    }

    packed.graphHeight = function(x){
      if (!arguments.length) return graphHeight;
      graphHeight = x;
      return packed;
    }
    
    packed.deep = function(x){
      
      deep(x);
      return packed;
    }
    
    packed.bindByTime = function(){
      dataByTime();
      
      return packed;
    }
    
    packed.defaultData = function(){
      defaultData();
      
      return packed;
    }
    
    

    return packed;
  }
  
})();