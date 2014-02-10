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

function layer1(trans) {
	var dataPath = "./dataset/songs.json";
	var margin = 40,
		offset = 28,
		width = 1024,
		height = 640;
		radius = 240,
		r = 600;
		center = {x:radius + margin, y:radius + margin},
		inTransLength = 1000,
		outTransLength = 1000;

	var svg,
		minYear, min, maxYear, max, year_apart = 15,
		radiScale,
		color, tip, cir;

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
				// start drawing the visualization
	 			start(data);
			});

	// the tool tip
	tip = d3.tip().attr('class', 'd3-tip');

	svg = d3.select("body").append("svg")
		   	.attr("width", width)
	    	.attr("height", height)
	  		.append("g")
	  		.attr("transform", "translate(" + (width - r) / 2 + "," + (height - r) / 2 + ")")
	  		.call(tip);
	
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

		xLeftAxis = d3.svg.axis()
		    .scale(xLeft)
		    .tickPadding(3)
		    .ticks(d3.time.years, year_apart);

	    xRightAxis = d3.svg.axis()
		    .scale(xRight)
		    .tickPadding(3)
		    .ticks(d3.time.years, year_apart);

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
				
		svg.append("g")
		    .attr("class", "xLeft axis")
		    .attr("transform", "translate(0," + center.y + ")")
		    .call(xLeftAxis)
		    .attr("opacity", 0)
			.transition()
			.duration(inTransLength)
			.attr("opacity", 1);

	    svg.append("g")
	    	.attr("class", "xRight axis")
	    	.attr("transform", "translate(0," + center.y + ")")
	    	.call(xRightAxis)
	    	.attr("opacity", 0)
			.transition()
			.duration(inTransLength)
			.attr("opacity", 1);
	}

	function drawLine(data){
		var line_offset = 25,
			text_offset = 30;
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

			var text_x = center.x - (Math.cos(i*Math.PI/10 - 0.02) * (radius + text_offset)),
				text_y = center.y - (Math.sin(i*Math.PI/10 - 0.02) * (radius + text_offset)),
				rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add the number
			svg.append("text")
				.attr("id", "hot_number" + i)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(i)
				.attr("transform", "rotate(" + rotate + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
					.duration(inTransLength)
					.attr("opacity", 1);
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

			var text_x = center.x - (Math.cos(i*Math.PI/10 - 0.02) * (radius + text_offset)),
				text_y = center.y + offset - (Math.sin(i*Math.PI/10 - 0.02) * (radius + text_offset)),
				rotate = 180 - Math.atan2(text_x-center.x, text_y-center.y)/(Math.PI/180);
			
			// add text
			svg.append("text")
				.attr("id", "pop_number" + (i-10))
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(i-10)
				.attr("transform", "rotate(" + rotate + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
					.duration(inTransLength)
					.attr("opacity", 1);
		}

		var text_x = center.x - radius - 30,
			text_y = center.y + 10;

		svg.append("text")
				.attr("id", "hot_number" + 0)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(0)
				.attr("transform", "rotate(" + 270 + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
				.duration(inTransLength)
				.attr("opacity", 1);

		text_x = center.x + radius + 30,
		text_y = center.y;

		svg.append("text")
				.attr("id", "hot_number" + 10)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(1)
				.attr("transform", "rotate(" + 90 + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
				.duration(inTransLength)
				.attr("opacity", 1);

		text_x = center.x - radius - 30,
		text_y = center.y + offset;

		svg.append("text")
				.attr("id", "pop_number" + 10)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(1)
				.attr("transform", "rotate(" + 270 + " " + text_x + "," + text_y + ")")
				.attr("opacity", 0)
				.transition()
				.duration(inTransLength)
				.attr("opacity", 1);

		text_x = center.x + radius + 30,
		text_y = center.y + 20;

		svg.append("text")
				.attr("id", "pop_number" + 0)
				.attr("class", "scale_number")
				.attr("x", text_x)
				.attr("y", text_y)
				.text(0)
				.attr("transform", "rotate(" + 90 + " " + text_x + "," + text_y + ")")
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

		//svg.selectAll("year_scale")
		for (var i = 0; i < 6; i++){
			svg.append("path")
			.datum(d3.range(points))
		    .attr("class", "year_scale")
		    .attr("d", d3.svg.line.radial()
		    				.radius(radiScale(arr[i]))
		    				.angle(function(d, j) { return up_angle(j); }))
		    .attr("transform", "translate(" + center.x + ", " + center.y + ")")
		    .attr("opacity", 0)
			.transition()
				.duration(inTransLength)
				.attr("opacity", 1);
		}
		
		for (var i = 0; i < 6; i++){
			svg.append("path")
			.datum(d3.range(points))
		    .attr("class", "year_scale")
		    .attr("d", d3.svg.line.radial()
		    				.radius(radiScale(arr[i]))
		    				.angle(function(d, j) { return down_angle(j); }))
		    .attr("transform", "translate(" + center.x + ", " + (center.y + offset) + ")")
		    .attr("opacity", 0)
			.transition()
				.duration(inTransLength)
				.attr("opacity", 1);
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
			.attr("width", 165)
			.attr("height", 75)
			.attr("fill", legendBackground)
			.attr("stroke", "black");
		
		legend.append("text")
			.attr("x", 7)
			.attr("y", 30)
			.attr("font-size", 11.5)
			.style("fill", legendTextColor)
			.text("Year");

		legend.append("text")
			.attr("x", 7)
			.attr("y", 15)
			.attr("font-size", 11.5)
			.style("fill", legendTextColor)
			.text("Size: Num. hotness/popularity");
	
		legend.append("rect")
			.attr("width", 125)
			.attr("height", 20)
			.attr("x", 20)
			.attr("y", 35)
			.attr("fill", "url(#grad1)");
		
		legend.append("text")
			.attr("x", 20)
			.attr("y", 65)
			.attr("font-size", 10)
			.style("fill", legendTextColor)
			.attr("text-anchor", "middle")
			.text(min);
		
		// legend.append("text")
		// 	.attr("x", 82.5)
		// 	.attr("y", 65)
		// 	.attr("font-size", 10)
		// 	.style("fill", legendTextColor)
		// 	.attr("text-anchor", "middle")
		// 	.text((max+min)/2);

		legend.append("text")
			.attr("x", 145)
			.attr("y", 65)
			.attr("font-size", 10)
			.style("fill", legendTextColor)
			.attr("text-anchor", "middle")
			.text(max);
		
		legend.attr("transform", "translate(" + (5 - (width - r) / 2) + "," + (height - 185) + ")")
			.attr("opacity", 0)
			.transition()
				.duration(inTransLength)
				.attr("opacity", 1);
	}

	function bindData(data){

		svg.selectAll("hotness")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "hotness" + i; })
			.attr("class", "hotness")
			.attr("cx", function(d, i) { 
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return coordHuge(d, "x", "hotness");
					}
				} else {
					return coord(d, "x", "hotness"); // center x
				}
			})
			.attr("cy", function(d) { 
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return coordHuge(d, "y", "hotness");
					}
				} else {
					return coord(d, "y", "hotness"); // center y
				}
			})
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
			.style("fill-opacity", function(d) {
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 1;
					} else {
						return 0;
					}
				} else {
					return 0.3;
				}
			})
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer)
			.transition()
				.duration(outTransLength)
				.delay(function(d) {
					if (!trans || (trans && d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity)) {
						return 0;
					} else {
						return outTransLength/2;
					}
				})
				.attr("cx", function(d) { return coord(d, "x", "hotness"); })
				.attr("cy", function(d) { return coord(d, "y", "hotness"); })
				.style("fill-opacity", 0.3)
				.attr("r", function(d) { return cir(d.hotArr.length); });

		svg.selectAll("popularity")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function(d, i) { return "pop" + i; })
			.attr("class", "popularity")
			.attr("cx", function(d, i) { 
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return coordHuge(d, "x", "pop");
					}
				} else {
					return coord(d, "x", "pop"); // center x
				}
			}) 
			.attr("cy", function(d) { 
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 300;
					} else {
						return coordHuge(d, "y", "pop");
					}
				} else {
					return coord(d, "y", "pop"); // center y
				}
			})
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
			.style("fill-opacity", function(d) {
				if (trans) {
					if (d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity) {
						return 1;
					} else {
						return 0;
					}
				} else {
					return 0.3;
				}
			})
			//.style("stroke", "#cc00cc")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", toSecLayer)
			.transition()
				.duration(outTransLength)
				.delay(function(d) {
					if (!trans || (trans && d.year == trans.year && d.hotness == trans.hotness && d.popularity == trans.popularity)) {
						return 0;
					} else {
						return outTransLength/2;
					}
				})
				.attr("cx", function(d) { return coord(d, "x", "pop"); })
				.attr("cy", function(d) { return coord(d, "y", "pop"); })
				.style("fill-opacity", 0.3)
				.attr("r", function(d) { return cir(d.hotArr.length); });
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
	
	function coordHuge(d, coordinate, type){
		
		var year = radius*2;
		var len, val, array, sign, low;
		if (coordinate === "x") {
			array = (type === "hotness") ? d.hotArr : d.popArr;
			sign = (type === "hotness") ? -1 : 1;
			len = array.length == 0 ? 0 : array.length - 1;
			val = center.x + sign * (Math.cos(Math.PI * array[0]) * year);
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
			val = center.y + low + sign * (Math.sin(Math.PI * array[0]) * year); 
		}
		return Math.round(val);
	}

	function mouseover(d, i){
		svg.select("#pop" + i)
			.style("fill", "black")
			// .style("fill", "black")
			.style("fill-opacity", 1);			
		
		svg.select("#hotness" + i)
			.style("fill", "black")
			// .style("fill", "black")
			.style("fill-opacity", 1);
			
		var coord = d3.mouse(this);
		
		if (coord[1] > center.y + 20) {
				tip.offset([-10, 0])
			.html(function(d) {
			return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
			"<strong>Popularity:</strong> <span style='color:red'>" + d.popularity + "</span><br />" +
			"<strong>Num. popularity:</strong> <span style='color:red'>" + d.popArr.length + "</span>";
		});		
		} else {

			tip.offset([-10, 0])
			.html(function(d) {
				return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
			"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
			"<strong>Num. hotness:</strong> <span style='color:red'>" + d.hotArr.length + "</span>"; 
			
		});
		}
		svg.select("#pop_number" + d.popularity)
				.style("font-size", "40px");
		svg.select("#hot_number" + d.hotness)
				.style("font-size", "40px");

		if (d.popularity == 10) {
			svg.select("#hot_number" + 0)
				.style("font-size", "40px");
		}

		if (d.hotness == 10) {
			svg.select("#pop_number" + 0)
				.style("font-size", "40px");
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
		svg.select("#pop_number" + d.popularity)
				.style("font-size", "20px");
		svg.select("#hot_number" + d.hotness)
				.style("font-size", "20px");

		if (d.popularity == 10) {
			svg.select("#hot_number" + 0)
				.style("font-size", "20px");
		}

		if (d.hotness == 10) {
			svg.select("#pop_number" + 0)
				.style("font-size", "20px");
		}
		tip.hide(d);
		 //if (coord.y > center.y) {
			
		 //} else {
		// 	tip_hot.hide(d);	
		 //}
	}

	function toSecLayer(d, i){
	    // var xy = d3.mouse(this);
	    // console.log(xy);
	    
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
		
		//window.location.href = "./vis.html?year=" +  + "&hotness=" + d.hotness + "&popularity=" + d.popularity;
	}
		
};