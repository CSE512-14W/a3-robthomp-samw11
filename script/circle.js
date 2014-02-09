(function() {

	var dataPath = "./dataset/songs.json";
	var margin = 40,
		offset = 30,
		width = 1024,
		height = 720;
		radius = 240,
		r = 600;
		center = {x:radius + margin, y:radius + margin};

	var legendBackground = "black",
		circleFillRangeMin = "#ffeda0",
		circleFillRangeMax = "#f03b20";

	var svg;
	var minYear, min, maxYear, max, year_apart = 15;
	var radiScale;
	var color;
	var tip, cir;

	function initVar(data) {
		min = d3.min(data, function(d) { return d.year; });
		max = d3.max(data, function(d) { return d.year; });

		minYear = new Date(min, 1, 1);
		maxYear = new Date(max, 1, 1);

		color = d3.scale.sqrt()
					.domain([min, max])
					.range([circleFillRangeMin, circleFillRangeMax]);

		cir = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.hotArr.length; }))
			.range([7, 30]);

		radiScale = d3.scale.linear()
					.domain([min, max])
					.range([0, radius]);
	}

	// Load the data
	d3.json(dataPath,
			function(d) {
				var data = d.map(function(d) {
					return {
						popularity: d.popularity,
						hotArr:d.hotArr,
						popArr:d.popArr,
						hotness: d.hotness,
						year: d.year
				 		};
				 	});
				
	 			start(data);
			});

	svg = d3.select("body").append("svg")
		   	.attr("width", width)
	    	.attr("height", height)
	  		.append("g")
	  		.attr("transform", "translate(" + (width - r) / 2 + "," + margin+ ")");
	    	//.attr("transform", "translate(" + margin + "," + margin + ")");

	var tip = d3.tip()
		.attr('class', 'd3-tip');
		// .attr("id", "tip_hot")
		// .offset([-10, 0])
		// .html(function(d) {
		// 	return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
		// 	"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
		// 	"<strong>#Hotness:</strong> <span style='color:red'>" + d.hotArr.length + "</span>"; 
		// });

	// var tip_pop = d3.tip()
	// 	.attr("class", "d3-tip")
	// 	.attr("id", "tip_pop")
	// 	.offset([-10, 0])
	// 	.html(function(d) {
	// 		return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
	// 		"<strong>Popularity:</strong> <span style='color:red'>" + d.popularity + "</span><br />" +
	// 		"<strong>#Popularity:</strong> <span style='color:red'>" + d.popArr.length + "</span>";
	// 	});

	svg.call(tip);
	//svg.call(tip_pop);

	function start(data){
			d3.select("img").remove();
			initVar(data);
			drawAxis();
			drawLine();
			drawYearScale();
			drawLegend();
			bindData(data);
		}

	function drawAxis(){
		var xLeft, xRight, xLeftAxis, xRightAxis, bottom;

		xLeft = d3.time.scale()
			.domain([maxYear, minYear])
			.range([margin, radius + margin]);

		xRight = d3.time.scale()
			.domain([minYear, maxYear])
			.range([radius + margin, 2*radius + margin]);

		xLeftAxis = d3.svg.axis()
		    .scale(xLeft)
		    .tickPadding(5)
		    .ticks(d3.time.years, year_apart);
	    	//.orient("bottom");

	    xRightAxis = d3.svg.axis()
		    .scale(xRight)
		    .tickPadding(5)
		    .ticks(d3.time.years, year_apart);
		    //.orient("bottom");

		svg.append("line")
			.attr("class", "bottom_xAxis")
			.attr("x1", margin)
			.attr("y1", center.y + offset)
			.attr("x2", margin + 2 * radius)
			.attr("y2", center.y + offset);
			//.style("stroke", "white");


		svg.append("g")
		    .attr("class", "xLeft axis")
		    .attr("transform", "translate(0," + center.y + ")")
		    .call(xLeftAxis);

	    svg.append("g")
	    	.attr("class", "xRight axis")
	    	.attr("transform", "translate(0," + center.y + ")")
	    	.call(xRightAxis);
	}

	function drawLine(data){
		var line_offset = 25,
			text_offset = 35;
		// hotness line scale
		for (var i = 1; i <= 9; i++) {
			svg.append("line")
				.attr("class", "line_scale")
				.attr("x1", center.x - (Math.cos(i*Math.PI/10) * (radius + line_offset)))
				.attr("y1", center.y - (Math.sin(i*Math.PI/10) * (radius + line_offset)))
				.attr("x2", center.x)
				.attr("y2", center.y);

			var text_x = center.x - (Math.cos(i*Math.PI/10) * (radius + text_offset)),
				text_y = center.y - (Math.sin(i*Math.PI/10) * (radius + text_offset)),
				rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add the number
			svg.append("text")
				.attr("id", "scale_number" + i)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(i)
				.attr("transform", "rotate(" + rotate + " " + text_x + "," + text_y + ")");
		}
		// draw the popularity line scale
		for (var i = 11; i <= 19; i++){
			svg.append("line")
				.attr("class", "line_scale")
				.attr("x1", center.x - (Math.cos(i*Math.PI/10) * (radius + line_offset)))
				.attr("y1", center.y + offset - (Math.sin(i*Math.PI/10) * (radius + line_offset)))
				.attr("x2", center.x)
				.attr("y2", center.y + offset);

			var text_x = center.x - (Math.cos(i*Math.PI/10) * (radius + text_offset)),
				text_y = center.y + offset - (Math.sin(i*Math.PI/10) * (radius + text_offset)),
				rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add text
			svg.append("text")
				.attr("id", "scale_number" + i)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(i-10)
				.attr("transform", "rotate(" + rotate + " " + text_x + "," + text_y + ")");
		}


	}

	function drawYearScale(data){
		var arr = [1935, 1950, 1965, 1980, 1995, 2010];
		var points = 50;

		var up_angle = d3.scale.linear()
		    .domain([0, points-1])
		    .range([-Math.PI/2, Math.PI/2]);

		var down_angle = d3.scale.linear()
		    .domain([0, points-1])
		    .range([Math.PI/2, 3*Math.PI/2]);

		//svg.selectAll("year_scale")
		for (var i = 0; i < 6; i++){
			svg.append("path")
			.datum(d3.range(points))
		    .attr("class", "year_scale")
		    .attr("d", d3.svg.line.radial()
		    				.radius(radiScale(arr[i]))
		    				.angle(function(d, j) { return up_angle(j); }))
		    .attr("transform", "translate(" + center.x + ", " + center.y + ")");
		}
		
		for (var i = 0; i < 6; i++){
			svg.append("path")
			.datum(d3.range(points))
		    .attr("class", "year_scale")
		    .attr("d", d3.svg.line.radial()
		    				.radius(radiScale(arr[i]))
		    				.angle(function(d, j) { return down_angle(j); }))
		    .attr("transform", "translate(" + center.x + ", " + (center.y + offset) + ")");
		}

	}

	function drawLegend(){
		var grad = svg.append("defs")
			.append("svg:linearGradient")
				.attr("id", "grad1")
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "0%");

		grad.append("svg:stop")
			.attr("offset", "0%")
			.style("stop-color", circleFillRangeMin)
			.style("stop-opacity", "1");
		
		grad.append("svg:stop")
			.attr("offset", "100%")
			.style("stop-color", circleFillRangeMax)
			.style("stop-opacity", "1");

		var legend = svg.append("g")
		//background
		legend.append("rect")
			.attr("width", 140)
			.attr("height", 65)
			//.attr("fill", legendBackground)
			//.attr("stroke", "black");
		
		legend.append("text")
			.attr("x", 20)
			.attr("y", 15)
			.attr("font-size", 12)
			.style("fill", "white")
			.text("Year");
	
		legend.append("rect")
			.attr("width", 80)
			.attr("height", 20)
			.attr("x", 20)
			.attr("y", 25)
			.attr("fill", "url(#grad1)");
		
		legend.append("text")
			.attr("x", 20)
			.attr("y", 55)
			.attr("font-size", 10)
			.style("fill", "white")
			.attr("text-anchor", "middle")
			.text(min);
		
		legend.append("text")
			.attr("x", 100)
			.attr("y", 55)
			.attr("font-size", 10)
			.style("fill", "white")
			.attr("text-anchor", "middle")
			.text(max);
		
		legend.attr("transform", "translate(" + (5 - (width - r) / 2) + "," + (height - 185) + ")");
	}

	function bindData(data){

		svg.selectAll("hotness")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "hotness" + i; })
			.attr("class", "hotness")
			.attr("cx", function(d) { return coord(d, "x", "hotness"); }) // center x
			.attr("cy", function(d) { return coord(d, "y", "hotness"); }) // center y
			.attr("r", function(d) { return cir(d.hotArr.length); })
			//.style("fill-opacity", 0.3)
			.style("fill", function(d) { return color(d.year); })
			.style("fill-opacity", 0.3)
			//.style("stroke", "#cc00cc")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer);

		svg.selectAll("popularity")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "pop" + i; })
			.attr("class", "popularity")
			.attr("cx", function(d) { return coord(d, "x", "pop"); }) 
			.attr("cy", function(d) { return coord(d, "y", "pop"); }) 
			.attr("r", function(d) { return cir(d.popArr.length); })
			.style("fill", function(d) { return color(d.year); })
			.style("fill-opacity", 0.3)
			//.style("stroke", "#cc00cc")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer);
	}

	function coord(d, coordinate, type){
		var year = radiScale(d.year);
		var len, val, array, sign, low;
		if (coordinate === "x") {
			array = (type === "hotness") ? d.hotArr : d.popArr;
			sign = (type === "hotness") ? -1 : 1;
			len = array.length == 0 ? 0 : array.length - 1;
			val = center.x + sign * (Math.cos(Math.PI * array[Math.round(Math.random()*(len - 0))]) * year);
		} else {
			if (type === "hotness"){
				array = d.hotArr;
				sign = -1;
				low = 0;
			} else {
				array = d.popArr;
				sign = 1;
				low = offset;
			}
			len = array.length == 0 ? 0 : array.length - 1;
			val = center.y + low + sign * (Math.sin(Math.PI * array[Math.round(Math.random()*(len - 0))]) * year); 
		}
		return Math.round(val);
	}

	// TODO highlight the scale line
	function mouseover(d, i){
		svg.select("#pop" + i)
			.style("fill", "white")
			// .style("fill", "black")
			.style("fill-opacity", 1);			
		
		svg.select("#hotness" + i)
			.style("fill", "white")
			// .style("fill", "black")
			.style("fill-opacity", 1);
			
		var coord = d3.mouse(this);
		
		if (coord[1] > center.y + 20) {
				tip.offset([-10, 0])
			.html(function(d) {
			return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
			"<strong>Popularity:</strong> <span style='color:red'>" + d.popularity + "</span><br />" +
			"<strong>#Popularity:</strong> <span style='color:red'>" + d.popArr.length + "</span>";
		});

			
		} else {

			tip.offset([-10, 0])
			.html(function(d) {
				return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
			"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
			"<strong>#Hotness:</strong> <span style='color:red'>" + d.hotArr.length + "</span>"; 
			
		});
			
		}
		tip.show(d);
		
	}

	// TODO highlight the scale line
	function mouseleave(d, i){
		svg.select("#pop" + i)
			.style("fill-opacity", 0.3)
			.style("fill", function(d) { return color(d.year); });

		svg.select("#hotness" + i)
			.style("fill-opacity", 0.3)
			.style("fill", function(d) { return color(d.year); });

		var coord = d3.mouse(this);
		tip.hide(d);
		// if (coord.y > center.y) {
		// 	tip_pop.hide(d);
		// } else {
		// 	tip_hot.hide(d);	
		// }
	}

	function toSecLayer(d, i){
	    // var xy = d3.mouse(this);
	    // console.log(xy);
		tip.hide(d);
		window.location.href = "./vis.html?year=" + d.year + "&hotness=" + d.hotness + "&popularity=" + d.popularity;
	}
}());