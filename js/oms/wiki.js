
function wikiGraph(id,dataFile) {
	

		
	var parseDate = d3.time.format("%Y-%m").parse,
    formatYear = d3.format("02d"),
    formatDate = function(d) { return formatYear(d.getFullYear()); };
    
var margin = {top: 10, right: 20, bottom: 20, left: 60},
    width = $("#"+id).width() - margin.left - margin.right,
    height = $("#"+id).height() - margin.top - margin.bottom;

var y0 = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2);

var yst = d3.scale.linear();

var y1 = d3.scale.linear();

var y2 = d3.scale.linear();

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 0);
    
var xlab = d3.time.scale()


var xAxis = d3.svg.axis()
    .scale(xlab)
    .orient("bottom")
    //.ticks(d3.time.years,5)
    //.tickFormat(formatDate)

var nest = d3.nest()
    .key(function(d) { return d.group; });

var stack = d3.layout.stack()
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; })
    .out(function(d, y0) { d.valueOffset = y0; });

var color = d3.scale.ordinal().range(["#3c5863","#ef3528","#d4c439","#83a292"]);

var svg = d3.select("#"+id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv(dataFile, function(error, data) {
	
	
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
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });

  group.filter(function(d, i) { return !i; }).append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y0.rangeBand() + ")")
      .call(xAxis);

  d3.selectAll("input").on("change", change);


  function change() {
    
    if (this.value === "multiples") transitionMultiples();
    else transitionStacked();
  }

  function transitionMultiples() {
    var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
    g.selectAll("rect").attr("y", function(d) { return y1(d.value); })
    .attr("height",function(d) { return (y0.rangeBand() - y1(d.value)); })
    g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })
    .style("opacity",1)
  }

  function transitionStacked() {
  	
    var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", "translate(0," + y0(y0.domain()[0]) + ")");
    g.selectAll("rect")
    .attr("height",function(d) { return (y0.rangeBand() - y1(d.value))*4; })
    .attr("y", function(d) { return y1(d.value*4 + d.valueOffset*4); });
    g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2 + d.values[0].valueOffset); })
    .style("opacity",0)
  }
});
}