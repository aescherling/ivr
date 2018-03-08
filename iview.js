
// globally accessible data variables, primarily for debugging
var myData;
var varNames;

// create an svg - everything will be drawn on this
var svg = d3.select('#viz').append('svg')
	.attr('height', '550px')
	.attr('width', '900px');

// create a table group
var table = svg.append('g')
	.attr('id', 'table')
	.attr('transform','translate(50,50)');

// set the max number of rows and columns to be viewed at a time
var nrow = 15;
var ncol = 5;


// create a range of indicators for table row IDs
var tableRowIDs = [];
for (var i = 0; i < nrow; i++) {
    tableRowIDs.push(i);
}

// create a similar range for table column IDs
var tableColIDs = [];
for (var i = 0; i < ncol; i++) {
    tableColIDs.push(i);
}

// create ranges for data row and column IDs
var dataRowIDs = [];
var dataColIDs = [];


// variable for the current first row and first column being shown
var currentRow = 0;
var currentCol = 0;



// function for creating a slider
function makeSlider(id, variables, axis, length, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = length;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scales
	if (axis=="col") {
    	var x = d3.scaleLinear()
    		.domain([0, variables.length-1])
    		.range([0, width - 2*margin]);
    } else if (axis=="row") {
    	var x = d3.scaleLinear()
    		.domain([0, variables.length-1])
    		.range([width - 2*margin, 0]);
    }

    var y = d3.scaleLinear()
    	.domain([0, variables.length-1])
    	.range([height/2, height/2]);

    // a line based on the scales
    var line = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(i); });

    // create a selector group
	var selector = svg.append('g')
		.attr('id', id)
		.attr('transform', transform);

	// add the line to the selector
	var path = selector.append('path')
      .datum(variables)
      .attr('d', line)
      .attr('style', 'fill: none; stroke: #000; stroke-width: 0.5px;');

    // dot shows the current variable selection
    var dot = selector.append("circle")
    	.attr('class', 'dot')
        .attr('cx', x(0))
        .attr('cy', y(0))
        .attr("r", 5);

    // variable name
    var varName = selector.append("text")
    	.attr("x", 145)
    	.attr("y", function() {
    		if (axis=="x") {
    			return(-10);
    		} else {
    			return(40);
    		}
    	})
    	.attr("text-anchor", "middle")
    	.attr("text", "");

	// function for sliding across rows
	function slide() {
		var tmp = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(tmp)).attr('cy', y(tmp));

		if (axis=="row") {
			currentRow = tmp;	
		} else if (axis=="col") {
			currentCol = tmp;
		}
	
		d3.selectAll('.cell').remove();
		// create a text object in each cell of the table
		for (i in tableRowIDs) {
			var tmpRow = d3.select('#row' + i)
			for (j in tableColIDs) {
				tmpRow.append('text')
					.attr('id','cell' + i + ',' + j)
					.classed('cell',true)
					.classed('col'+i, true)
					.attr('transform','translate(' + (150 * j) + ',0)')
					.attr('text-anchor','middle')
					.text(myData[+currentRow + +i][varNames[+currentCol + +j]]);
			}
		}
	}

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;")
        .on("mousemove", slide);

    return(selector);
} // end of makeSelector();



// function to plot the data
function explore(data) {

	// get the dimensions of the table
	var n = data.length;
	var p = Object.keys(data[0]).length;

	for (var i = 0; i < n; i++) {
	    dataRowIDs.push(i);
	}

	for (var i = 0; i < p; i++) {
	    dataColIDs.push(i);
	}

	// get a list of the variable names
	varNames = Object.keys(data[0]);

	// create crossfilter
	var cf = crossfilter(data);


	// create the row groups and background rects for highlighting
	table.selectAll('g')
	  .data(tableRowIDs).enter()
	  .append('g')
	  .classed('tableRow', true)
	  .attr('id', function (d) {return("row" + d);})
	  .attr('transform', function(d) {return 'translate(0,' + (20 * (d+1)) + ')'});


	// note: I also need to add a row label

	// create a text object in each cell of the table
	for (i in tableRowIDs) {
		var tmpRow = d3.select('#row' + i)
		for (j in tableColIDs) {
			tmpRow.append('text')
				.attr('id','cell' + i + ',' + j)
				.classed('cell',true)
				.classed('col'+i, true)
				.attr('text-anchor','middle')
				.attr('transform','translate(' + (150 * j) + ',0)')
				.text(data[i][varNames[j]]);
		}
	}


	// create a group for the titles and append text
	var titleGroup = table.append('g').attr('id', 'titleGroup');
	titleGroup.selectAll('text')
		.data(varNames)
		.enter()
		.append('text')
		.classed('title', true)
		.attr('id', function(d,i) {return ('column' + i);})
		.attr('text-anchor','middle')
		.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace')
		.attr('transform',function(d,i) {return 'translate(' + (150 * i) + ',0)'})
		.text(function(d) {return (d)});


	// create a slider for the rows
	if (n > nrow) {
		var slider1 = makeSlider('slider1', dataRowIDs, 'row', 300, 'translate(20,343) rotate(270)');	
	}
    

    // create a slider for the columns
    if (p > ncol) {
    	var slider2 = makeSlider('slider2', dataColIDs, 'col', 600, 'translate(107,410)');
    }
	

} // end of explore



myData = ```jsonData''';
explore(myData);


