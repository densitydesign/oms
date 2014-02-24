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

	var width = 300,
		height = 100;

	var tagContainer = d3.select("#category")
								.on("click", function(){
	     						domainContainer.call(domainChart)
	     						queryContainer.call(queryChart)
	     					})

	var domainContainer = d3.select("#domain")
							.on("click", function(){
	     						tagContainer.call(tagChart)
	     						queryContainer.call(queryChart)
	     					})

	 var queryContainer = d3.select("#query")
	// 					.append("svg")
	//      					.attr("width", '100%')
	//      					.attr("height", '100%')
	//      					.on("click", function(){
	//      						tagContainer.call(tagChart)
	//      						domainContainer.call(domainChart)
	//      					})

    var tagChart = who.barChart()
    				//.xMax(tags.top(1)[0].value)
    				.xMax(tlds.top(1)[0].value)
    				.dimension(tag)
    				.group(tags)
    				.responsive(true)

    var domainChart = who.barChart()
    				.xMax(tlds.top(1)[0].value)
    				.dimension(tld)
    				.group(tlds)
    				.responsive(true)

     var queryChart = who.bubbleChart()
				 .xMax(queries.top(1)[0].value)
				 .dimension(query)
				 .group(queries)
				 .responsive(true)

    tagContainer.call(tagChart)
    domainContainer.call(domainChart)
    queryContainer.call(queryChart)

    $( window ).resize(function() {
  			    tagContainer.call(tagChart.resize(true))
    			domainContainer.call(domainChart.resize(true))
    			queryContainer.call(queryChart.resize(true))
		});

});