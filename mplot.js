
// globally accessible data variables, primarily for debugging
var myData;
var myVar;

// create an svg - everything will be drawn on this
var svg = d3.select('#viz').append('svg')
	.attr('height', '400px')
	.attr('width', '700px');

// add text elements for warnings about the data load
var categoricalWarning = svg.append('text').attr('y', 25);
var missingnessWarning = svg.append('text').attr('y', 50);


// create a scatterplot group
var scatterplot = svg.append('g')
	.attr('id', 'scatterplot')
	.attr('transform', 'translate(400, 100)');

// draw axes of scatterplot
scatterplot.append('g')
  .attr('class', 'axis yAxis')
  .call(d3.axisLeft(y_scale).ticks(5));

scatterplot.append('g')
  .attr('class', 'axis xAxis')
  .attr('transform', 'translate(0,' + histHeight + ')')
  .call(d3.axisBottom(x_scale).ticks(5));

// label the y axis of the scatterplot
scatterplot.append('text')
	.attr('id', 'yAxisLabel')
	.attr("x", -40)
    .attr("y", 100)
    .attr('transform','rotate(-90 -40,100)')
    .attr("text-anchor", "middle")
    .text("");




// function for updating the y variable of the scatterplot
function updateY(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	// relabel y axis of scatterplot
	scatterScaleY = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([histHeight, 0]);
	d3.select('#scatterplot').select('.yAxis').call(d3.axisLeft(scatterScaleY).ticks(5));

	// update points
	d3.select('#scatterplot').selectAll('.point')
		.transition()
		.duration(100)
		.attr('cy', function(d,i) {return scatterScaleY(x[i])})
		.attr('stroke', 'black');

} // end of updateHist()


// function for updating the x variable of the scatterplot with input variable (array) x
function updateScatter(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	// rescale/relabel x axis
	scatterScaleX = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([0, histWidth]);
	d3.select('#scatterplot').select('.xAxis').call(d3.axisBottom(scatterScaleX).ticks(5));

	// update points
	d3.selectAll('.point')
		.transition()
		.duration(100)
		.attr('cx', function(d,i) {return scatterScaleX(x[i])})
		.attr('fill', 'black');

} // end of updateHist()


// function for creating a variable selector
function makeSelector(id, data, variables, mousemove, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = 200;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scales
    var x = d3.scaleLinear()
    	.domain([0, variables.length-1])
    	.range([0, width - 2*margin]);

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
        .attr('cx', function() {
        	if (mousemove=="histogram") {
        		out = x(0);
        	} else if (mousemove=="scatterplot") {
        		out = x(1);
        	}
        	return(out);
        })
        .attr('cy', y(0))
        .attr("r", 5);

    // variable name
    var varName = selector.append("text")
    	.attr("x", 100)
    	.attr("y", -10)
    	.attr("text-anchor", "middle")
    	.attr("text", "");

	// function for updating the histogram and y variable of scatterplot using the selector
	function moveHist() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text(variables[i]);
		d3.select('#yAxisLabel').text(variables[i]);
	
		// update the histogram to view the selected variable
		var newVar = data.map(function(d) {return +d[variables[i]]});
		updateHist(newVar);
	}

	// function for updating the x variable of the scatterplot using the selector
	function moveScatter() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text(variables[i]);
	
		// update the histogram to view the selected variable
		var newVar = data.map(function(d) {return +d[variables[i]]});
		updateScatter(newVar);
	}

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;");

    if (mousemove=="histogram") {
        overlay.on("mousemove", moveHist);
    } else if (mousemove=="scatterplot") {
    	overlay.on("mousemove", moveScatter);
    }

    return(selector);
} // end of makeSelector();



// function to plot the data
function explore(data) {

	// get a list of the variable names
	var varNames = Object.keys(data[1]);

	// convert all categorical variables to numeric
	// if a column contains no numbers, find all unique values (other than "NA", "", or ".") and assign a number
	var n = data.length;
	var p = varNames.length;
	var categoricalVars = [];
	// loop over each column
	for (j=0; j<p; j++) {
		// classify each observation in the column as missing, non-numeric, or numeric
		var nMissing = 0;
		var nNaN = 0;
		var nNumeric = 0;
		var varClass = data.map(function(d) {
			var out;
			var valueTmp = d[varNames[j]];
			if (valueTmp=="" | valueTmp=="." | valueTmp=="NA" | valueTmp=="NaN") {
				out = "missing";
				nMissing++;
			} else if (isNaN(valueTmp)) {
				out = "non-numeric";
				nNaN++;
			} else {
				out = "numeric";
				nNumeric++;
			}
			return(out);
		});
		// if nNaN/n > 0.5, classify as a categorical variable. assign a number to each unique value
		if (nNaN/n > 0.5) {
			categoricalVars.push(varNames[j]);
			// create an array for the jth variable
			var tmpVar = data.map(function(d) {return(d[varNames[j]]);});
			// find the unique values
			var unique = tmpVar.filter(function(item, i, ar){ return ar.indexOf(item) === i; }).sort();
			// assign each value of the variable to its index in the unique set of items
			var numVar = tmpVar.map(function(d) {return(unique.indexOf(d));})
			// recode the variable
			for (i=0; i<n; i++){
				data[i][varNames[j]] = numVar[i];
			}
		}

	}

	// display a message if any variables were identified as categorical
	if (categoricalVars.length > 0 & categoricalVars.length < 4) {
		categoricalWarning.text('The following variables have been identified as categorical variables: ' + categoricalVars);	
	} else if (categoricalVars.length > 3) {
		categoricalWarning.text('Warning: ' + categoricalVars.length + ' columns were identified as categorical variables.');
	}
	

	// remove all rows with missing values
	var missingRows = [];
	for (i=0; i<n; i++) {
		for (j=0; j<p; j++) {
			var valueTmp = data[i][varNames[j]];
			if (valueTmp==="" | valueTmp=="." | valueTmp=="NA" | valueTmp=="NaN") {
				missingRows.push(i+1);
			}
		}
	}
	var uniqueRows = missingRows.filter(function(item, i, ar){ return ar.indexOf(item) === i; }).sort();
	var newData = [];
	for (i=0; i<n; i++) {
		if (uniqueRows.indexOf(i+1)===-1) {
			newData.push(data[i]);
		}
	}
	data = newData;

	// display a message if any rows were removed
	if (categoricalVars.length > 0 & categoricalVars.length < 4) {
		missingnessWarning.text('The following observations have been removed due to missing data: ' + uniqueRows);
	} else if (categoricalVars.length > 3) {
		missingnessWarning.text('Warning: ' + uniqueRows.length + ' observations were removed due to missing data.');
	}
	


	// remove all scatterplot points
	d3.select('#scatterplot').selectAll('.point').remove();


    // create a toolbar for switching the histogram variable (and y variable of scatterplot)
    var selector1 = makeSelector('selector1', data, varNames, 'histogram', 'translate(105,350)');

    // create a toolbar for switching the x variable of scatterplot
    var selector2 = makeSelector('selector2', data, varNames, 'scatterplot', 'translate(405,350)');

	// create crossfilter
	// var cf = crossfilter(data);

	// default to selecting the first column of the csv for the histogram and y axis of scatterplot
	// later the user will be able to try all the different variables
	d3.select('#selector1').select('text').text(varNames[0]);
	d3.select('#yAxisLabel').text(varNames[0]);
	var y = data.map(function(d) {return +d[varNames[0]]});
	var yMin = d3.min(y);
	var yMax = d3.max(y);
	scatterScaleY = d3.scaleLinear().domain([Math.floor(yMin), Math.ceil(yMax)]).range([histHeight, 0]);

	// default to selecting the second column of the csv for the x axis of scatterplot
	d3.select('#selector2').select('text').text(varNames[1]);
	var x = data.map(function(d) {return +d[varNames[1]]});
	var xMin = d3.min(x);
	var xMax = d3.max(x);
	scatterScaleX = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([0, histWidth]);

	// add points to the scatterplot
	var blankArray = Array(data.length);
	d3.select('#scatterplot').selectAll(".point")
		.data(blankArray)
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 3.5)
		.attr("cx", function(d,i) {return(scatterScaleX(x[i]))})
		.attr("cy", 0)
		.style("fill", "none");

	updateHist(y);
	

} // end of explore



myData = ```jsonData''';
explore(myData);


