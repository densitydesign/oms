var col=true;
var siz=50;
var data;
var langLvl=0;
var langScale,tagScale;
var dsv_egg = d3.dsv(";", "text/plain");

dsv_egg("data/CS_img.csv",function(d) {
  return {
  	keyword: d.keyword,
    image: d.image,
    lang: d.lang,
    rank: +d.rank,
    color: d.color
  };
}, 
	function(error, rows) {
	  
   		data = d3.nest()
   		.key(function(d) {return d.lang; })
        .key(function(d) {return d.keyword; })
        .entries(rows);
        
        maxH=0
        
	    data.forEach(function (d,i) {
	    	d.count=0;
			d.y=maxH
	    	d['values'].forEach(function(e,j) {
	    		maxH+=e['values'].length
	    		d.count+=e['values'].length
	    		
	    	});
	    });
	    
		viz_googleimages();
	});
     
     var margin = {top: 40, right: 10, bottom: 10, left: 10},
    width = $("#viz_googleimages").width()*.45 - margin.left - margin.right,
    height =  $("#viz_googleimages").height() - margin.top - margin.bottom;
     
     
     var listW = width*0.45;
     
     var svg, langs, tags;
     svg = d3.select("#viz_googleimages").append("svg")
    .attr("width", (width + margin.left + margin.right))
    .attr("height", (height + margin.top + margin.bottom))
    .attr("style", "float:left")
    
    d3.select("#viz_googleimages").append("div")
    .attr("class","slider")
    
    $(".slider").slider({'min':10,'max':100, 'value':50})
    .on('slide', function(ev){
    	changeSize(ev.value)
    });
    
    d3.select("#viz_googleimages").append("div")
    .attr("class","rad")
    .attr("style","float:left; clear:right")
    
    $(".rad").append('<div class="btn-group show-lvl"><button id="language" type="button" class="btn btn-default">Images</button><button id="forum" type="button" class="btn btn-default">Colors</button></div>')
    
    
    d3.select("#viz_googleimages").append("div")
    .attr("class","imgs")
 
    offset=$(".imgs").position().top
    $(".imgs").height(height);
    
    var t=d3.select("svg").append("g").attr("class","tag-group")
    
     function viz_googleimages() {
    
    //scale function 	
	langScale = d3.scale.linear().domain([0, maxH]);
	langScale.range([0, height]) 

	//draw lang rects
    langs = svg.selectAll(".lang").data(data)
    .enter()
    .append("rect")
    .attr("class", "lang")
	.attr("x",  20)
	.attr("y", function(d){return langScale(d.y)+2})
    .attr("width", listW)
	.attr("height", function(d) {return langScale(d.count) })
    .style("fill", function(d) {return "#dddddd";})
    .style("stroke","#999999")
    .on("click", function(d){
    	
    	//color current selection
    	d3.select(".lang.sel").classed("sel",false)
    	d3.select(this).classed("sel",true)
    	
    	//ealstify list
    	elastify(d)
    	if($(".tag.sel").length) {
    		console.log(d)
    		k=d3.select(".tag.sel")[0][0].__data__.key
    		el=d.values.filter(function(e){return e.key==k})
    		loadImages(el[0])
    	}
    	});
    
    //labels for languages 
    svg.selectAll(".lang-txt")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "lang-txt")
    .attr("font-family", "serif")
	.attr("font-size", "1em")
	.attr("x",  20)
	.attr("y", function(d){return langScale(d.y)+2})
	.attr("dx", "0.4em")
	.attr("dy", "1.3em")
	.style("fill","#222222")
	.text(function(d){console.log(d);return d.key})
      
    }


     function elastify(d) {
     	
     	//compute height
     	tagH=0
		
		//t.attr("transform","rotate(30)")
		
     	d['values'].sort(function(a,b) {
     		return b['values'].length-a['values'].length
     		})
     	
     	d['values'].forEach(function(e,i){
     		
     		//e.y=tagH;
     		tagH+=e['values'].length	
     	})
     	
     	//rescale the scale 
     	
     	tagScale = d3.scale.linear().range([height/37, height/1.75]); 
     	tagScale.domain([0, tagH]).clamp(true)
     	vals=0
     	d['values'].forEach(function(e,i){
     		
     		e.y=vals;
     		e.h=tagScale(e['values'].length)
     		vals+=e.h	
     	})

     	//draw section
     	
     	tags= t.selectAll(".tag").data(d.values,function(e){return e.key})
     	
	    var enter = tags.enter()
	    .append("rect")
	    
	    //enter new elements
	    enter.attr("class","tag")
	    .attr("x",  width*.1+listW)
		.attr("y", function(e){return e.y})
	    .attr("width", listW)
		.attr("height", function(e) {return e.h })
	    .style("fill", function(e) {return "#dddddd";})
	    .style("stroke","#999999")
	    .on("click", function(d){
    	
	    	//color current selection
	    	d3.select(".tag.sel").classed("sel",false)
	    	d3.select(this).classed("sel",true)
	    	loadImages(d);
    	});
	    
	    //transition on existing
	    tags.transition().duration(500)
	    .attr("y", function(e){return e.y})
		.attr("height", function(e) {return e.h })
		.each("end",function() {
			
			rawH=t[0][0].getBBox().height;
			
			t.transition().duration(100).attr("transform","scale(1,"+height/rawH+")")
		})
	    
	    //remove old elements
	    tags.exit().remove();
	    
	    //Text
	    txt = t.selectAll(".tag-txt")
	    .data(d.values,function(e){return e.key})
	    
	    txtEnt=txt.enter()
	    .append("text")
	    
	    txtEnt
	    .attr("class", "tag-txt")
	    .attr("font-family", "serif")
		.attr("font-size", "1em")
		.attr("x",  width*.12+listW)
		.attr("y", function(e){return e.y})
		.attr("dx", "0.4em")
		.attr("dy", "1.3em")
		.style("fill","#222222")
		.text(function(d){return d.key})
		
		txt.transition().duration(500)
		.attr("y", function(e){return e.y})

		txt.exit().remove()
     }
     
     function loadImages(d) {
     	$(".imgs").empty();
     	d.values.forEach(function(e,i) {
     		$(".imgs").append("<div class='img-cont' style='width:"+siz+"px;height:"+siz+"px;background:"+e.color+"'><img class='smallImg' src='img/cs_thumb/"+e.lang+"/t_"+e.image+"'/></div>")
     		if (!col) {
     			$(".imgs img").hide();
     		} 		
     	})
     }
     
     function changeSize(n) {
	     siz=n;
	     $(".img-cont").css("width",n+"px")
	     $(".img-cont").css("height",n+"px")
     }

     $(".btn").on("click",function(e){
     	col=!col;
     	if(col) $(".imgs img").fadeIn(300)
     	else $(".imgs img").fadeOut(300)
     })
     
     d3.select(window).on("resize", function() {
     	width=$("#viz_googleimages").width()*0.45
     	listW = width*0.45;
		d3.select("svg").attr("width", width);
		d3.select("svg").attr("height", $("#viz_googleimages").height());
		d3.selectAll("rect").attr("width", listW)
		d3.selectAll(".tag") .attr("x",  width*.1+listW)
		d3.selectAll(".tag-txt").attr("x",  width*.1+listW)
	});