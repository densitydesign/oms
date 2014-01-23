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
		height = 100,
		tagContainer = d3.select("#category")
						.append("svg")
	     					.attr("width", width)
	     					.attr("height", height),
	    domainContainer = d3.select("#domain")
						.append("svg")
	     					.attr("width", width)
	     					.attr("height", height*5);

    var tagChart = who.barChart()
    				.height(height)
    				.width(width)
    				.dimension(tag)
    				.group(tags)

    var domainChart = who.barChart()
    				.height(height*6)
    				.width(width)
    				.dimension(tld)
    				.group(tlds)

    tagContainer.call(tagChart)

    domainContainer.call(domainChart)

});