d3.csv('data/cs_analytics.csv', function(data) {


	// Create the crossfilter for the relevant dimensions and groups.
	var category = crossfilter(data),
    all = category.groupAll(),
    host = category.dimension(function(d) { return d.HOST; }),
	hosts = host.group(),
	query = category.dimension(function(d) { return d.QUERY; }),
	queries = query.group(),
	tag = category.dimension(function(d) { return d.TAG; }),
	tags = tag.group(),
	tld = category.dimension(function(d) { return d.TLD; }),
	tlds = tld.group(),
	url = category.dimension(function(d) { return d.URL; }),
	urls = tld.group();

	var width = 500,
		height = 100;

	var tagContainer = d3.select("#category")
						.append("svg")
	     					.attr("width", width)
	     					.attr("height", height)
	     					.on("click", function(){
	     						domainContainer.call(domainChart)
	     						queryContainer.call(queryChart)
	     					})

	var domainContainer = d3.select("#domain")
						.append("svg")
	     					.attr("width", width)
	     					.attr("height", height*4)
	     					.on("click", function(){
	     						tagContainer.call(tagChart)
	     						queryContainer.call(queryChart)
	     					})

	var queryContainer = d3.select("#query")
						.append("svg")
	     					.attr("width", width)
	     					.attr("height", width)
	     					.on("click", function(){
	     						tagContainer.call(tagChart)
	     						domainContainer.call(domainChart)
	     					})

    var tagChart = who.barChart()
    				.height(height)
    				.width(width)
    				.xMax(tags.top(1)[0].value)
    				.dimension(tag)
    				.group(tags)

    var domainChart = who.barChart()
    				.height(height*4)
    				.width(width)
    				.xMax(tlds.top(1)[0].value)
    				.dimension(tld)
    				.group(tlds)

    var queryChart = who.bubbleChart()
				.diameter(width)
				.xMax(queries.top(1)[0].value)
				.dimension(query)
				.group(queries)

    tagContainer.call(tagChart)
    domainContainer.call(domainChart)
    queryContainer.call(queryChart)

});