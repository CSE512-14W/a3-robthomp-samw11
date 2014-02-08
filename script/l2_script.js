window.onload = function() {
	layer2();
}

function layer2() {
	//color variables
	var tooltipText = "red";
	var rootCircleFill = d3.rgb(200,200,200);
	var circleFillRangeMin = "#ffeda0";
	var circleFillRangeMax = "#f03b20";
	var backgroundFill = "white";
	var backgroundMouseoverFill = "#d0e4e6";
	var legendBackground = "white"

	//set these to specify what artists to fetch from the data
	//ranges are inclusive and (for some reason) having a zero before decimal places matters
	var yearMin = "2008";
	var yearMax = "2008";
	var famMin = "0.5";
	var famMax = "0.6";
	
	var max = -1;
	
	//various global variables
	var w = 1024,
		h = 640,
		r = 600,
		infoW = 200,
		textAnimDur = 500,
		x = d3.scale.linear().range([0, r]),
		y = d3.scale.linear().range([0, r]),
		node,
		rootNode;

	//the bubble-organizing method
	var bubble = d3.layout.pack()
		.sort(null)
		.size([r, r])
		.padding(1.5);

	//the svg tag that holds the bubble graph
	var bubSvg = d3.select("#bubDiv").insert("svg:svg", "h2")
		.attr("width", w)
		.attr("height", h);
	
	//the bubble vis g tag
	var vis = bubSvg.append("svg:g")
		.attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

	//the svg tag for the level 3 vis
	var info = d3.select("#infoDiv")
		.insert("svg:svg")
			.attr("width", infoW)
			.attr("height", h - 10);	
	
	//the accessor for tooltip functions
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Artist:</strong> <span style='color:" + tooltipText + "'>" + d.artist + "</span><br />" + 
			"<strong>Songs:</strong> <span style='color:" + tooltipText + "'>" + d.songs + "</span><br />" + 
			"<strong>Avg Dur:</strong> <span style='color:" + tooltipText + "'>" + d.avgDur + "</span>";
		});

	//activate the tooltip
	vis.call(tip);
	
	//fetch the data
	$.getJSON( "dataset/layer2.php", { yearMin: yearMin, yearMax: yearMax, famMin: famMin, famMax: famMax})
		.done(function( data ) {
			//add rect background that returns user to layer 1 if clicked
			var outText;
			bubSvg.insert("svg:rect", "g")
				.attr("width", w)
				.attr("height", h)
				.attr("fill", backgroundFill)
				.on("click", function() { alert("transition to layer 1 function goes here"); })
				.on("mouseover", function() {
					
					//show text and change background 
					outText	= bubSvg.append("svg:text")
						.attr("font-size", "12.5")
						.text("Click to Return")
						.attr("x", w - 8)
						.attr("text-anchor", "end")
						.attr("y", 15);
					
					bubSvg.select("rect")
						.attr("fill", backgroundMouseoverFill);
						
				})
				.on("mouseout", function() {
					outText.remove();
					
					bubSvg.select("rect")
						.attr("fill", backgroundFill);
				});
			
			//organize data
			var c = classes(data);
	  
			//color scale has to be defined here, after the max avgDuration has been found
			color = d3.scale.sqrt()
				.domain([0, max])
				.range([circleFillRangeMin, circleFillRangeMax]);
  
  			//make legend
			drawLegend();
			
			//draw info pane
			drawInfo();
  
			node = rootNode = c;
			
			//arrange the data into bubbles
			var bub = bubble.nodes(c);
			
			//keep track of the root bubble
			node = rootNode = bub[0];
			
			//make the bubbles
			vis.selectAll("circle")
					.data(bub)
			.enter().append("svg:circle")
					.attr("class", function(d) { return "parent" })
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr("r", function(d) { return d.r; })
					.attr("fill", function(d) { return d == rootNode ? rootCircleFill : color(d.avgDur); })
					.on("click", function(d) { 
						console.log(d == node);
						return zoom(node == d ? rootNode : d); })
					.on('mouseover', function(d) { if (d != rootNode) {tip.show(d)}})
					.on('mouseout', function(d) { if (d != rootNode) {tip.hide(d)}});

			//make the bubble labels
			vis.selectAll("text")
					.data(bub)
				.enter().append("svg:text")
					.attr("class", function(d) { return d.children ? "parent" : "child"; })
					.attr("x", function(d) { return d.x; })
					.attr("y", function(d) { return d.y; })
					.attr("dy", ".35em")
					.attr("text-anchor", "middle")
					.style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
					.text(function(d) { return d.artist; });
		});

	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classes(root) {
		var classes = [];

		root.forEach(function(child) { 
			if (child.totDur/child.songs > max) {
				max = child.totDur/child.songs;
			}
			classes.push({artist: child.artist, value: child.songs, songs: child.songs, totDur: child.totDur, avgDur: (child.totDur/child.songs).toFixed(1)});
		});

		return {children: classes, value: 0};
	}

	//zoom in on the clicked bubble and fetch and display the song information on the left
	function zoom(dTop, i) {
		var k = r / dTop.r / 2;
		//zoom only if the clicked node isn't the root node
		if (dTop != rootNode) {
			x.domain([dTop.x - 5*dTop.r, dTop.x + 5*dTop.r]);
			y.domain([dTop.y - 5*dTop.r, dTop.y + 5*dTop.r]);
		} else {
			x.domain([dTop.x - dTop.r, dTop.x + dTop.r]);
			y.domain([dTop.y - dTop.r, dTop.y + dTop.r]);
		}

		var t = vis.transition()
			.duration(d3.event.altKey ? 7500 : 750);

		t.selectAll("circle")
			.attr("cx", function(d) { return x(d.x); })
			.attr("cy", function(d) { return y(d.y); })
			.attr("r", function(d) { return dTop != rootNode ? k * d.r / 5 : k * d.r; });

		t.selectAll("text")
			.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

		node = dTop;
		d3.event.stopPropagation();

		//as long as the user didn't zoom in on the root bubble, request
		//data and present it when available
		if (dTop != rootNode) {				
			//animate any existing text over to the right and delete
			info.selectAll("g")
				.transition()
					.duration(textAnimDur)
					.attr("transform", "translate(" + 2*infoW + ")")
					.remove();
			
			//set info window size back to normal
			info.attr("height", h - 10);
			info.select("rect").attr("height", h - 10);
			info.attr("width", infoW);
			info.select("rect").attr("width", infoW);
			
			//add and animate 'loading' text from left	
			var textGroup = info.append("svg:g");
			textGroup.append("svg:text")
				.attr("x", -infoW/2)
				.attr("y", h/2)
				.attr("text-anchor", "middle")
				.text("Loading...");
			textGroup.transition()
				.duration(textAnimDur)
				.attr("transform", "translate(" + infoW + ")");
			
			//request data from layer 3 script		
			$.getJSON( "dataset/layer3.php", { artist: dTop.artist} )
				.done(function( data ) {
					
					//sort song data by year and then by title
					data.sort(function(a,b) {
						var yc = a["year"].localeCompare(b["year"]);
						if (yc == 0) {
							return a["title"].localeCompare(b["title"]);
						}
						return yc;
					});
					
					//animate any existing text over to the right and delete
					info.selectAll("g")
						.transition()
							.duration(textAnimDur)
							.attr("transform", "translate(" + 2*infoW + ")")
							.remove();
					
					//add and animate 'loading' text from left	
					var textGroup = info.append("svg:g");
					
					//if the data is too large, resize the svg window to allow scrolling
					if (data.length * 15 + 100 > h) {
						info.attr("height", data.length * 15 + 100);
						info.select("rect").attr("height", data.length * 15 + 100);
					}
						
					textGroup.selectAll("text")
						.data(data)
					.enter().append("svg:text")
						.attr("x", 10 - infoW)
						.attr("y", function(d, i) { return i*15 + 90; })
						.attr("font-size", 11)
						.text(function(d) { return d["year"] + " - " + d["title"] + " - " + parseFloat(d["duration"]).toFixed(1); });	
					
					/*	Text wrapping, works but can't figure out how to space vertically when there is wrapping
					.append("foreignObject")
						.attr("x", 10 -infoW)
						.attr("y", function(d, i) { return i*15 + 90; })
						.attr("width", infoW - 10)
						.attr("height", h)
						.append("xhtml:body")
						.append("p")
						.text(function(d) { return d["year"] + " - " + d["title"] + " - " + parseFloat(d["duration"]).toFixed(1); });*/
					
					textGroup.append("svg:text")
						.attr("x", 4 - infoW)
						.attr("y", 20)
						.attr("font-size", 20)
						.text(data[0]["artist_name"] + ":");
					
					textGroup.append("svg:text")
						.attr("x", 15 - infoW)
						.attr("y", 37)
						.attr("font-size", 14)
						.text("Total Songs: " + data.length);
					
					textGroup.append("svg:text")
						.attr("x", 15- infoW)
						.attr("y", 52)
						.attr("font-size", 14)
						.text("Familiarity: " + data[0]["artist_familiarity"]);
					
					textGroup.append("text")
						.attr("x", 15- infoW)
						.attr("y", 67)
						.attr("font-size", 14)
						.text("Hotness: " + data[0]["artist_hotttnesss"]);
					
					//after everything is added, set svg window size to match the text width and enable horizontal scrolling
					if (textGroup[0][0].getBBox().width > infoW) {
						info.attr("width", textGroup[0][0].getBBox().width + 20);
						info.select("rect").attr("width", textGroup[0][0].getBBox().width + 20);
					}
					
					//animate the whole lot in from the left
					textGroup.transition()
						.duration(textAnimDur)
						.attr("transform", "translate(" + infoW + ")");
				});
		}
	}
	
	function drawInfo() {
		//draw constant elements in the info window
		info.append("svg:rect")
			.attr("width", infoW)
			.attr("height", h - 10)
			.attr("fill", circleFillRangeMin)
			.attr("stroke", circleFillRangeMax)
			.attr("stroke-width", 1);
	
		//add instructional text
		var textGroup = info.append("svg:g");
		textGroup.append("svg:text")
			.attr("x", -infoW/2)
			.attr("y", h/2)
			.attr("font-size", 15)
			.attr("text-anchor", "middle")
			.text("Click a bubble to see");			
		textGroup.append("svg:text")
			.attr("x", -infoW/2)
			.attr("y", h/2 + 20)
			.attr("font-size", 15)
			.attr("text-anchor", "middle")
			.text("further artist information");
		textGroup.transition()
			.duration(textAnimDur)
			.attr("transform", "translate(" + infoW + ")");
	}
	
	function drawLegend() {
		var grad = bubSvg.append("svg:defs")
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
		
		var legend = bubSvg.append("g");
	
		//background
		legend.append("rect")
			.attr("width", 140)
			.attr("height", 80)
			.attr("fill", legendBackground)
			.attr("stroke", "black");
		
		legend.append("text")
			.attr("x", 4)
			.attr("y", 15)
			.attr("font-size", 11.5)
			.text("Size: Num. Songs");
	
		legend.append("text")
			.attr("x", 4)
			.attr("y", 30)
			.attr("font-size", 11.5)
			.text("Color: Avg. Song Duration");
	
		legend.append("rect")
			.attr("width", 80)
			.attr("height", 20)
			.attr("x", 20)
			.attr("y", 40)
			.attr("fill", "url(#grad1)");
		
		legend.append("text")
			.attr("x", 20)
			.attr("y", 70)
			.attr("font-size", 10)
			.attr("text-anchor", "middle")
			.text("0");
		
		legend.append("text")
			.attr("x", 100)
			.attr("y", 70)
			.attr("font-size", 10)
			.attr("text-anchor", "middle")
			.text(Math.round(max));
		
		legend.attr("transform", "translate(" + 5 + "," + (h - 85) + ")");
	}
}