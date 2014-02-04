
(function(){

  var who = window.who || (window.who = {});

  who.chart = function(){
	
	
    
    var id = "", // default width
      dataFile = ""; // default height	
		
	var parseDate = d3.time.format("%Y-%m").parse,
    formatYear = d3.format("02d"),
    formatDate = function(d) { return formatYear(d.getFullYear()); };
    var w,h;

var yst = d3.scale.linear();

var y1 = d3.scale.linear();

var y2 = d3.scale.linear();

var y0;

var svg;


	function chart(selection){
		
		
    	selection.each(function(data){
    		
    		console.log(data)
		
var margin = {top: 10, right: 10, bottom: 20, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
	
	
	var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 0);
    
var xlab = d3.time.scale()

	y0 = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2);

var xAxis = d3.svg.axis()
    .scale(xlab)
    .orient("bottom")


var nest = d3.nest()
    .key(function(d) { return d.group; });

var stack = d3.layout.stack()
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; })
    .out(function(d, y0) { d.valueOffset = y0; });

var color = d3.scale.ordinal().range(["#3c5863","#ef3528","#d4c439","#83a292"]);

	svg = selection.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	
	xlab.domain([new Date(data[0].date), d3.time.day.offset(new Date(data[data.length - 1].date), 1)])
.rangeRound([0, width - margin.left - margin.right]);
	
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  var dataByGroup = nest.entries(data);

  stack(dataByGroup);
  x.domain(dataByGroup[0].values.map(function(d) { return d.date; }));
  y0.domain(dataByGroup.map(function(d) { return d.key; }));
  yst.domain([0, d3.max(data, function(d) { return d.value; })]).range([height, 0]);
  y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);
  y2.domain([0, d3.max(data, function(d) { return d.value; })]).range([height, 0]);

  var group = svg.selectAll(".group")
      .data(dataByGroup)
    .enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
      
  group.append("line")
  .attr("x1",0)
  .attr("y1",function(d) { return y1(d.values[0].value / 2)+1; })
  .attr("x2",width)
  .attr("y2",function(d) { return y1(d.values[0].value / 2)+1; })
  .style("stroke","#666")
  

  group.append("text")
      .attr("class", "group-label")
      .attr("x", -6)
      .attr("y", function(d) { return y1(d.values[0].value / 2); })
      .attr("dy", ".35em")
      .text(function(d) { return d.key; });

  group.selectAll("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .style("fill", function(d) { return color(d.group); })
      .attr("x", function(d) { return x(d.date); })
      .attr("y", function(d) { return y1(d.value); })
      .attr("width", x.rangeBand()-1)
      .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });

  group.filter(function(d, i) { return !i; }).append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y0.rangeBand() + ")")
      .call(xAxis);
      
      
      stack = function() {
      	 	
      }

});

};


chart.transitionStacked=function() {
  	
  	console.log("Ahi!")
  	
  	svg=chart.svg();
  	 var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", "translate(0," + chart.y0()(chart.y0().domain()[0]) + ")");
	    g.selectAll("rect")
	    .attr("height",function(d) { return (chart.y0().rangeBand() - chart.y1()(d.value))*4; })
	    .attr("y", function(d) { return chart.y1()(d.value*4 + d.valueOffset*4); });
	    g.select(".group-label").attr("y", function(d) { return chart.y1()(d.values[0].value / 2 + d.values[0].valueOffset); })
	    .style("opacity",0)
   
    return chart;
  }

chart.transitionMultiples=function() {
	
	console.log("ehi!")
	
	svg=chart.svg();
    var t = svg.transition().duration(750),
    g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + chart.y0()(d.key) + ")"; });
    g.selectAll("rect").attr("y", function(d) { return chart.y1()(d.value); })
    .attr("height",function(d) { return (chart.y0().rangeBand() - chart.y1()(d.value)); })
    g.select(".group-label").attr("y", function(d) { return chart.y1()(d.values[0].value / 2); })
    .style("opacity",1)
    
    return chart;
  }


chart.change=function (x) {
    
    if (x === "multiples") chart.transitionMultiples();
    else chart.transitionStacked();
    return chart;
  }

chart.y0 = function() {
	if (!arguments.length) return y0;
}

chart.y1 = function() {
	 if (!arguments.length) return y1;
}

chart.id = function(value) {
    if (!arguments.length) return id;
    id = value;
    return chart;
  };
  
  
chart.svg = function(value) {
    if (!arguments.length) return svg;
    svg = value;
    return chart;
  };
  
chart.w = function(value) {
    if (!arguments.length) return w;
    
    w = value;
    console.log(w);
    return chart;
  };
  
chart.h = function(value) {
    if (!arguments.length) return h;
    h = value;
    console.log(h);
    return chart;
  };


  chart.dataFile = function(value) {
    if (!arguments.length) return dataFile;
    dataFile = value;
    return chart;
  };



return chart;

}
})();
