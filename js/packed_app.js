var graphWidth = 900; 
var graphHeight = 600;
var teamBuffer = 20;
var transitionDuration = 750;
var fontSize = 12;
var fontFamily = 'Julius Sans One';
var pack;

var dsv_egg = d3.dsv(";", "text/plain");

dsv_egg("data/threads.csv",function(d) {
  return {
  	lang: d.lang,
    forum: d.forum,
    title: d.title,
    orig_author: d.original_author,
    time : +d.time,
    nb_authors : +d.nb_authors,
    nb_replies : +d.nb_replies,
    post_length : +d.avg_post_length
  };
}, 
	function(error, rows) {
	  
		//COMMENT EN	  
      	rows=rows.filter(function(row){
	    if(row.lang=="en") return false;
	    else return true; 
	  });
    
   		var data = d3.nest()
        .key(function(d) {return d.lang; })
        .key(function(d) {return d.forum; })
        .entries(rows);
        
        var chart = d3.select("#packedgraph").append("svg")
	    .attr("width", graphWidth)
	    .attr("height", graphHeight+200);
	     
	   
  	pack = who.packed()	
	chart.datum(data).call(pack)


	d3.select('#buttons').append("button").text('depth to 1')
		.on("click", function(){
			
				pack.deep(1)	
				
				})
			

		
	d3.select('#buttons').append("button").text('depth to 2')
		.on("click", function(){
			
			pack.deep(2);
				})

    
    d3.select('#buttons').append("button").text('depth to 3')
		.on("click", function(){
			
			pack.deep(3);
				})
	
		
	d3.select('#buttons').append("button").text('by Time')
		.on("click", function(){
			$("svg").fadeOut(200,function(){
				
				pack.bindByTime()	
				
				$("svg").fadeIn(500);
				})
			
		})

	
    

	});

