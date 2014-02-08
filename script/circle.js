(function() {
	var dataPath = "./dataset/songs.json";
	var margin = 20,
		frame = 720,
		width = frame - 2*margin,
		height = frame - 2*margin,
		radius = width / 2,
		center = {x:frame/2, y:frame/2};

	
	var svg;
	var minYear, maxYear;
	var radiScale;

	// Load the data
	d3.json(dataPath,
			function(d) {
				var data = d.map(function(d) {
					return {
						popularity: d.popularity,
						arr:d.hotArr,
						popArr:d.popArr,
						hotness: d.hotness,
						year: d.year
				 		};
				 	});
				minYear = new Date(d3.min(data, function(d) { return d.year; }), 1, 1);
				maxYear = new Date(d3.max(data, function(d) { return d.year; }), 1, 1);
	 			start(data);
			});

	svg = d3.select("body").append("svg")
		   	.attr("width", frame)
	    	.attr("height", frame)
	  		.append("g");
	    	//.attr("transform", "translate(" + margin + "," + margin + ")");

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Year:</strong> <span style='color:red'>" + d.year + "</span><br />" + 
			"<strong>Hotness:</strong> <span style='color:red'>" + d.hotness + "</span><br />" + 
			"<strong>Popularity:</strong> <span style='color:red'>" + d.popularity + "</span>";
		});

	svg.call(tip);

	function start(data){
			d3.select("img").remove();
			drawAxis();
			drawLine();
			bindData(data);
		}

	function drawAxis(){
		var xLeft, xRight, xLeftAxis, xRightAxis;

		xLeft = d3.time.scale()
			.domain([maxYear, minYear])
			.range([margin, frame/2]);

		xRight = d3.time.scale()
			.domain([minYear, maxYear])
			.range([frame/2, width + margin]);

		xLeftAxis = d3.svg.axis()
		    .scale(xLeft)
		    .tickPadding(8);
	    	//.orient("bottom");

	    xRightAxis = d3.svg.axis()
		    .scale(xRight)
		    .tickPadding(8);
		    //.orient("bottom");

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
		// hotness line scale
		for (var i = 1; i <= 19; i++) {
			if (i == 10) continue;
			svg.append("line")
				.attr("class", "line_scale")
				.attr("x1", function(d) { return center.x - (Math.cos(i*Math.PI/10) * (radius + 10)); })
				.attr("y1", function(d) { return center.y - (Math.sin(i*Math.PI/10) * (radius + 10)); })
				.attr("x2", center.x)
				.attr("y2", center.y);
			}
		}

	function bindData(data){
		var min = minYear.getFullYear();
			max = maxYear.getFullYear();
		
		// may change to color
		radiScale = d3.scale.linear()
					.domain([min, max])
					.range([0, radius]);


		var cir = d3.scale.linear()
					.domain(d3.extent(data, function(d) { return d.arr.length; }))
					.range([7, 30]);
		
		svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", function(d, i) { return "hotness" + i; })
			.attr("cx", function(d) { return coord(d, "x", "hotness"); }) // center x
			.attr("cy", function(d) { return coord(d, "y", "hotness"); }) // center y
			.attr("r", function(d) { return cir(d.arr.length); })
			//.style("fill-opacity", 0.3)
			.style("fill", "rgba(0, 128, 0, 0.5)")
			//.style("stroke", "#cc00cc")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave);

		svg.selectAll("ellipse")
			.data(data)
			.enter()
			.append("ellipse")
			.attr("class", function(d, i) { return "pop" + i; })
			.attr("cx", function(d) { return coord(d, "x", "pop"); }) 
			.attr("cy", function(d) { return coord(d, "y", "pop"); }) 
			//.attr("r", function(d) { return cir(d.arr.length); })
			.attr("rx", function(d) { return cir(d.popArr.length); })
			.attr("ry", function(d) { return cir(d.popArr.length); })
			.style("fill-opacity", 0.3)
			//.style("stroke", "#cc00cc")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave);
	}

	function coord(d, coordinate, type){
		var year = radiScale(d.year);
		var len, val, array, sign;
		if (coordinate === "x") {
			array = (type === "hotness") ? d.arr : d.popArr;
			sign = (type === "hotness") ? -1 : 1;
			len = array.length == 0 ? 0 : array.length - 1;
			val = center.x + sign * (Math.cos(Math.PI * array[Math.round(Math.random()*(len - 0))]) * year);
		} else {
			array = (type === "hotness") ? d.arr : d.popArr;
			sign = (type === "hotness") ? -1 : 1;
			len = array.length == 0 ? 0 : array.length - 1;
			val = center.y + sign * (Math.sin(Math.PI * array[Math.round(Math.random()*(len - 0))]) * year); 
		}
		return Math.round(val);
	}

	function mouseover(d, i){
		// d is data
		svg.select(".pop" + i)
			.style("fill-opacity", 0.5)
			.style("stroke", "#0aa");
		
		svg.select(".hotness" + i)
			.style("fill", "rgba(256, 128, 0, 1)");
			
		tip.show(d);
	}

	function mouseleave(d, i){
		svg.select(".pop" + i)
			.style("fill-opacity", 0.3)
			.style("stroke", "#cc00cc");

		svg.select(".hotness" + i)
			.style("fill", "rgba(0, 128, 0, 0.5)");

		tip.hide(d);
	}
}());