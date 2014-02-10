(function() {
	layer1();
})();

//color variables
var legendBackground = "white",
	circleFillRangeMin = "#ffeda0",
	circleFillRangeMax = "#f03b20",
	legendTextColor = "black";

var l2tooltipText = "red",
	rootCircleFill = d3.rgb(200,200,200),
	l2circleFillRangeMin = "#e5f5f9",
	l2circleFillRangeMax = "#2ca25f",
	l2backgroundFill = "white",
	l2backgroundMouseoverFill = "#d0e4e6",
	l2legendBackground = "white",
	l2legendTextColor = "black";

// start the first layer
function layer1(trans) {
	var dataPath = "./dataset/songs.json";

	var margin = 40,
		offset = 28,
		width = 1024,
		height = 720;
		radius = 240,
		r = 600;
		center = {x:radius + margin, y:radius + margin},
		inTransLength = 1000,
		outTransLength = 1000,
		year_apart = 15,
		minBubble = 7,
		maxBubble = 30;

	var svg,
		minYear, 
		min, 
		maxYear, 
		max, 
		radiScale,
		color, 
		tip, 
		cir;

	// initialize variables
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
			.range([minBubble, maxBubble]);

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
				// start drawing the visualization
	 			start(data);
			});

	// the tool tip
	tip = d3.tip().attr('class', 'd3-tip')
				.offset([-10, 0]);



	svg = d3.select("body").append("svg")
		   	.attr("width", width)
	    	.attr("height", height)
	  		.append("g")
	  		.attr("transform", "translate(" + (width - r) / 2 + "," + (height - r) / 2 + ")")
	  		.call(tip);
	
	svg.append("text")
		.attr("id", "layer1_title")
		.text("Artists grouped by hotness and familiarity per year")
		.attr("transform", "translate(" + (5 - (width - r) / 2) + "," + (-30) + ")");

	svg.attr("transform", "translate(" + (width - r) / 2 + "," + (height - r) / 2 + ")");

	function start(data){
			d3.select("img").remove();
			initVar(data);
			drawAxis();
			drawLine();
			drawYearScale();
			drawLegend();
			bindData(data);
		}

	// 3 axises in total, left, right and bottom
	function drawAxis(){
		var xLeft, xRight, xLeftAxis, xRightAxis, bottom;

		xLeft = d3.time.scale()
			.domain([maxYear, minYear])
			.range([margin, radius + margin]);

		xRight = d3.time.scale()
			.domain([minYear, maxYear])
			.range([radius + margin, 2*radius + margin]);

		xLeftAxis = getAxis(xLeft);
		xRightAxis = getAxis(xRight);

		svg.append("line")
			.attr("class", "bottom_xAxis")
			.attr("x1", margin)
			.attr("y1", center.y + offset)
			.attr("x2", margin + 2 * radius)
			.attr("y2", center.y + offset)
			.attr("opacity", 0)
			.transition()
			.duration(inTransLength)
			.attr("opacity", 1);
		
		appendAxis(xLeftAxis, "xLeft axis");
		appendAxis(xRightAxis, "xRight axis");
	}

	// helper function to init axis
	function getAxis(axis){
		return d3.svg.axis()
		    		.scale(axis)
		    		.tickPadding(3)
		    		.ticks(d3.time.years, year_apart);
	}

	// helper function to draw axis
	function appendAxis(axis, className){
		svg.append("g")
	    	.attr("class", className)
	    	.attr("transform", "translate(0," + center.y + ")")
	    	.call(axis)
	    	.attr("opacity", 0)
			.transition()
			.duration(inTransLength)
			.attr("opacity", 1);
	}

	function drawLine(data){
		var line_offset = 25,
			text_offset = 30,
			text_x,
			text_y,
			rotate;
		// hotness line scale
		for (var i = 1; i <= 9; i++) {
			svg.append("line")
				.attr("class", "line_scale")
				.attr("id", "hot_line" + i)
				.attr("x1", center.x - (Math.cos(i*Math.PI/10) * (radius + line_offset)))
				.attr("y1", center.y - (Math.sin(i*Math.PI/10) * (radius + line_offset)))
				.attr("x2", center.x)
				.attr("y2", center.y)
				.attr("opacity", 0)
				.transition()
				.duration(inTransLength)
				.attr("opacity", 1);

			text_x = center.x - (Math.cos(i*Math.PI/10 - 0.02) * (radius + text_offset)),
			text_y = center.y - (Math.sin(i*Math.PI/10 - 0.02) * (radius + text_offset)),
			rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add the number
			putText("scale_number", "hot_number" + i, text_x, text_y, rotate, i);			
		}
		// draw the popularity line scale
		for (var i = 11; i <= 19; i++){
			svg.append("line")
				.attr("class", "line_scale")
				.attr("id", "pop_line" + (i-10))
				.attr("x1", center.x - (Math.cos(i*Math.PI/10) * (radius + line_offset)))
				.attr("y1", center.y + offset - (Math.sin(i*Math.PI/10) * (radius + line_offset)))
				.attr("x2", center.x)
				.attr("y2", center.y + offset)
				.attr("opacity", 0)
				.transition()
					.duration(inTransLength)
					.attr("opacity", 1);

			text_x = center.x - (Math.cos(i*Math.PI/10 - 0.02) * (radius + text_offset)),
			text_y = center.y + offset - (Math.sin(i*Math.PI/10 - 0.02) * (radius + text_offset)),
			rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add text
			putText("scale_number", "pop_number" + (i-10), text_x, text_y, rotate, (i-10));
		}

		text_x = center.x - radius - 30,
		text_y = center.y + 10;
		putText("scale_number", "hot_number0", text_x, text_y, 270, 0);

		text_x = center.x + radius + 30,
		text_y = center.y;
		putText("scale_number", "hot_number10", text_x, text_y, 90, 1);

		text_x = center.x - radius - 30,
		text_y = center.y + offset;
		putText("scale_number", "pop_number10", text_x, text_y, 270, 1);

		text_x = center.x + radius + 30,
		text_y = center.y + 20;
		putText("scale_number", "pop_number0", text_x, text_y, 90, 0);
	}

	// helper function to put text
	function putText(className, idName, text_x, text_y, rotation, num){
			svg.append("text")
				.attr("id", idName)
				.attr("class", className)
				.attr("x", text_x)
				.attr("y", text_y)
				.text(num)
				.attr("transform", "rotate(" + rotation + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
				.duration(inTransLength)
				.attr("opacity", 1);
	}

	function drawYearScale(data){
		// need to hard code the year
		var arr = [1935, 1950, 1965, 1980, 1995, 2010];
		var points = 50;

		var up_angle = d3.scale.linear()
		    .domain([0, points-1])
		    .range([-Math.PI/2, Math.PI/2]);

		var down_angle = d3.scale.linear()
		    .domain([0, points-1])
		    .range([Math.PI/2, 3*Math.PI/2]);

		for (var i = 0; i < 6; i++){
			drawYear(0, up_angle, arr, i, points);
			drawYear(offset, down_angle, arr, i, points);
		}
	}

	// helper function to draw the year
	function drawYear(off, angle, arr, i, points){
		svg.append("path")
			.datum(d3.range(points))
		    .attr("class", "year_scale")
		    .attr("d", d3.svg.line.radial()
		    				.radius(radiScale(arr[i]))
		    				.angle(function(d, j) { return angle(j); }))
		    .attr("transform", "translate(" + center.x + ", " + (center.y + off) + ")")
		    .attr("opacity", 0)
			.transition()
			.duration(inTransLength)
			.attr("opacity", 1);
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
			.attr("width", 165)
			.attr("height", 75)
			.attr("fill", legendBackground)
			.attr("stroke", "black");
		
		drawLegendText(legend, 7, 30, 11.5, "Year");
		drawLegendText(legend, 7, 15, 11.5, "Size: Num. Artist");
	
		legend.append("rect")
			.attr("width", 125)
			.attr("height", 20)
			.attr("x", 20)
			.attr("y", 35)
			.attr("fill", "url(#grad1)");
		
		drawLegendText(legend, 20, 65, 10, min).attr("text-anchor", "middle");
		drawLegendText(legend, 145, 65, 10, max).attr("text-anchor", "middle");
		
		legend.attr("transform", "translate(" + (5 - (width - r) / 2) + "," + (height - 185) + ")")
			.attr("opacity", 0)
			.transition()
				.duration(inTransLength)
				.attr("opacity", 1);
	}

	// helper function to draw the legend text
	function drawLegendText(legend, x, y, size, text){
		return legend.append("text")
					.attr("x", x)
					.attr("y", y)
					.attr("font-size", size)
					.style("fill", legendTextColor)
					.text(text);
	}

	function bindData(data){

		svg.selectAll("hotness")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "hotness" + i; })
			.attr("class", "hotness")
			.attr("cx", function(d) { return transit(d, "x", "hotness"); })
			.attr("cy", function(d) { return transit(d, "y", "hotness"); })
			.attr("r", function(d) {
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return cir(d.hotArr.length);
					}	
				} else {
					return 0;
				}
			})
			.style("fill", function(d) { return color(d.year); })
			.style("fill-opacity", getOpacity)
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer)
			.transition()
			.duration(outTransLength)
			.delay(delayTran)
			.attr("cx", function(d) { return coord(d, "x", "hotness", radiScale(d.year)); })
			.attr("cy", function(d) { return coord(d, "y", "hotness", radiScale(d.year)); })
			.style("fill-opacity", 0.3)
			.attr("r", function(d) { return cir(d.hotArr.length); });

		svg.selectAll("popularity")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "pop" + i; })
			.attr("class", "popularity")
			.attr("cx", function(d) { return transit(d, "x", "pop"); })
			.attr("cy", function(d) { return transit(d, "y", "pop"); })
			.attr("r", function(d) {
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return cir(d.popArr.length);
					}	
				} else {
					return 0;
				}
			})
			.style("fill", function(d) { return color(d.year); })
			.style("fill-opacity", getOpacity)
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer)
			.transition()
			.duration(outTransLength)
			.delay(delayTran)
			.attr("cx", function(d) { return coord(d, "x", "pop", radiScale(d.year)); })
			.attr("cy", function(d) { return coord(d, "y", "pop", radiScale(d.year)); })
			.style("fill-opacity", 0.3)
			.attr("r", function(d) { return cir(d.popArr.length); });
	}

	// helper function to get the coordinate of x and y
	function transit(d, coor, className){
		if (trans) {
			if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
				return 300;
			} else {
				return coord(d, coor, className, radius*2);
			}
		} else {
			return coord(d, coor, className, radiScale(d.year));
		}
	}

	// helper function to get fill opacity level
	function getOpacity(d){
		if (trans) {
			if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
				return 1;
			} else {
				return 0;
			}
		} else {
			return 0.3;
		}
	}

	// helper function to get the delay time
	function delayTran(d){
		if (!trans || (trans && d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity)) {
			return 0;
		} else {
			return outTransLength/2;
		}
	}

	// helper function to get the coordinate
	function coord(d, coordinate, type, year){
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

	function mouseover(d, i){
		svg.select("#pop" + i)
			.style("fill", "black")
			.style("fill-opacity", 1);			
		
		svg.select("#hotness" + i)
			.style("fill", "black")
			.style("fill-opacity", 1);
			
		var coord = d3.mouse(this);
		
		if (coord[1] > center.y + 20) {
			tip.html(function(d) {
					return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
					"<strong>Familiarity:</strong> <span style='color:red'>" + d.popularity + "</span><br />" +
					"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
					"<strong>Num. Artist:</strong> <span style='color:red'>" + d.popArr.length + "</span>";
				});		
		} else {
			tip.html(function(d) {
					return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
					"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
					"<strong>Familiarity:</strong> <span style='color:red'>" + d.popularity + "</span><br />" +
					"<strong>Num. Artist:</strong> <span style='color:red'>" + d.hotArr.length + "</span>"; 
				});
		}
		changeFontSize(d.popularity, d.hotness, "40px");
		tip.show(d);
		
	}

	function mouseleave(d, i){
		svg.select("#pop" + i)
			.style("fill-opacity", 0.3)
			.style("fill", function(d) { return color(d.year); });

		svg.select("#hotness" + i)
			.style("fill-opacity", 0.3)
			.style("fill", function(d) { return color(d.year); });

		changeFontSize(d.popularity, d.hotness, "20px");
		tip.hide(d);
	}

	function changeFontSize(pop, hot, fontSize){
		svg.select("#pop_number" + pop)
				.style("font-size", fontSize);
		svg.select("#hot_number" + hot)
				.style("font-size", fontSize);

		if (pop == 10) {
			svg.select("#hot_number" + 0)
				.style("font-size", fontSize);
		}

		if (hot == 10) {
			svg.select("#pop_number" + 0)
				.style("font-size", fontSize);
		}
	}

	function toSecLayer(d, i){
	    //remove events immediately
	    svg.selectAll("circle")
	    	.on("mouseover", null)
			.on("mouseleave", null)
			.on("click", null)
		
		//shrink all other circles
		svg.selectAll("circle").filter(function(d, i) {
			return d != this;
		}).transition()
			.duration(inTransLength)
			.attr("r", 0);
		
		//fade all labels and axis
		svg.selectAll("text")
			.transition()
				.duration(inTransLength)
				.style("opacity", 0);
		svg.selectAll("line")
			.transition()
				.duration(inTransLength)
				.style("opacity", 0);
		svg.selectAll("path")
			.transition()
				.duration(inTransLength)
				.style("opacity", 0);
		svg.selectAll("g")
			.transition()
				.duration(inTransLength)
				.style("opacity", 0);
		
		//make clicked circle fill screen and transition to layer root bubble fill color
	    d3.select(this).transition()
	    	.duration(inTransLength)
	    	.attr("r", 300)
	    	.attr("cx", 300)
	    	.attr("cy", 300)
	    	.style("fill", rootCircleFill)
	    	.each("end", function() {
	    		tip.hide(d);
				d3.select("div").remove();
				d3.select("svg").remove();
				layer2(d.year, d.hotness, d.popularity);
	    	});	
	} 
};