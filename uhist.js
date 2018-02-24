
// globally accessible data variables, primarily for debugging
var myData;
var myVar;

// globally accessible bin number variable
var currentBins = 10;
var currentVar;

// create an svg - everything will be drawn on this
var svg = d3.select('#viz').append('svg')
	.attr('height', '550px')
	.attr('width', '700px');

// add text elements for warnings about the data load
var categoricalWarning = svg.append('text').attr('y', 25);
var missingnessWarning = svg.append('text').attr('y', 50);

// create a histogram group
var histogram = svg.append('g')
	.attr('id','histogram')
	.attr('transform','translate(200,100)');

// histogram dimensions
var histHeight = 300;
var histWidth = 300;

// draw axes of histogram
// default to (0,1) scale
y_scale = d3.scaleLinear().domain([0,1]).range([histHeight, 0]);
histogram.append('g')
  .attr('class', 'axis yAxis')
  .call(d3.axisLeft(y_scale).ticks(5));

x_scale = d3.scaleLinear().domain([0,1]).range([0, histWidth]);
histogram.append('g')
  .attr('class', 'axis xAxis')
  .attr('transform', 'translate(0,' + histHeight + ')')
  .call(d3.axisBottom(x_scale).ticks(5));

// add a label on the x axis
histLabel = histogram.append('text')
	.attr("x", 150)
    .attr("y", 340)
    .attr("text-anchor", "middle")
    .attr("text", "");;


// function for calculating the counts necessary for producing a histogram
// input: data, lower end of lowest bin, high end of highest bin, desired # of bins
// output: JS object with variable "value" = count for each bin
function calcHist(x, low, high, bins) {
  // scale the data & take floor to collapse into bins
  histScale = d3.scaleLinear().domain([low, high]).range([0,bins]);
  scaled = x.map(function(a) {return Math.floor(histScale(a));});

	// find the # of points in each bin
	hist = Array(bins);
	for (i=0; i < hist.length; i++){
	  bool = scaled.map(function (a) {return (a == i);});
	  val = d3.sum(bool);
	  hist[i] = val;
	}

  return hist;
}


// function for updating the histogram with input variable (array) x
// also updates the y variable of the scatterplot
function updateHist(x, bins, dur) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	// calculate the counts of the chosen variable using calcHist
	// var bins = 10;
	var counts = calcHist(x, Math.round(xMin)-1, Math.round(xMax)+1, bins);
	myVar = counts;
	var stepSize = (Math.ceil(xMax) - Math.floor(xMin)) / bins;

	// rescale/relabel x axis of histogram
	histScaleX = d3.scaleLinear().domain([Math.round(xMin)-1, Math.round(xMax)+1]).range([0, histWidth]);
	d3.select('#histogram').select('.xAxis').call(d3.axisBottom(histScaleX).ticks(5));

  	// rescale/relabel y axis of histogram
	histScaleY = d3.scaleLinear().domain([0, Math.ceil(d3.max(counts))]).range([histHeight, 0]);
	d3.select('#histogram').select('.yAxis').call(d3.axisLeft(histScaleY).ticks(5));

	// update bars
    d3.selectAll('.bar')
      .transition()
      .duration(dur)
      .attr('height', function (d,i) {return histHeight - histScaleY(counts[i])})
      .attr('y', function (d,i) {return histScaleY(counts[i])});

} // end of updateHist()



// function for creating a variable selector
function makeVariableSelector(id, data, variables, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = histWidth;
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

	selector.append('text')
		.attr('x', -80)
		.attr('y', 12)
		.text('variable: ');

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

	// function for updating the histogram using the selector
	function moveHist() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		histLabel.text(variables[i]);
	
		// update the histogram to view the selected variable
		currentVar = data.map(function(d) {return +d[variables[i]]});
		updateHist(currentVar, currentBins, 100);
	}


    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;")
        .on("mousemove", moveHist);;

    return(selector);
} // end of makeVariableSelector();


// function for creating a variable selector
function makeBinSelector(id, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = histWidth;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

    // bin size options: 5 to 35, by 5
    binOptions = Array.apply(null, Array(7)).map(function (_, i) {return 5*i + 5;});

	// create the scales
    var x = d3.scaleLinear()
    	.domain([0, binOptions.length - 1])
    	.range([0, width - 2*margin]);

    var y = d3.scaleLinear()
    	.domain([0, 1])
    	.range([height/2, height/2]);

    // a line based on the scales
    var line = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(i); });

    // create a selector group
	var selector = svg.append('g')
		.attr('id', id)
		.attr('transform', transform);

	selector.append('text')
		.attr('x', -80)
		.attr('y', 12)
		.text('# bins: ');

	// add the line to the selector
	var path = selector.append('path')
      .datum(binOptions)
      .attr('d', line)
      .attr('style', 'fill: none; stroke: #000; stroke-width: 0.5px;');

    // dot shows the current variable selection
    var dot = selector.append("circle")
    	.attr('class', 'dot')
        .attr('cx', x(1))
        .attr('cy', y(0))
        .attr("r", 5);

	// function for updating the histogram using the selector
	function changeBins() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), binOptions.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
	
		// check to make sure the # of bins has changed
		if (currentBins != binOptions[i]) {
			// update the number of bins
			currentBins = binOptions[i];

			// remove the existing bars
			d3.select('#histogram').selectAll('.bar').remove();

			// add bars with height 0 to the histogram
			var barWidth = histWidth / currentBins;
			d3.select('#histogram').selectAll('.bar')
			    .data(Array(currentBins))
			    .enter()
			    .append('rect')
			    .attr('class', 'bar')
			    .attr('width', barWidth)
			    .attr('height', 0)
			    .attr('x', function (d, i) {return i * barWidth})
			    .attr('y', histHeight)
			    .attr('fill', 'steelblue')
			    .attr('stroke', d3.rgb('steelblue').darker());

			// update the histogram values
			updateHist(currentVar, currentBins, 0);
		}
	}



    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;")
        .on("mousemove", changeBins);;

    return(selector);
} // end of makeBinSelector();




// function to plot the data
function explore(data) {

	// get a list of the variable names
	var varNames = Object.keys(data[0]);

	// convert all factor variables to numeric
	// if a column contains no numbers, find all unique values (other than "NA", "", or ".") and assign a number
	var n = data.length;
	var p = varNames.length;
	var factorVars = [];
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
		// if nNaN/n > 0.5, classify as a factor variable. assign a number to each unique value
		if (nNaN/n > 0.5) {
			factorVars.push(varNames[j]);
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
	if (factorVars.length > 0 & factorVars.length < 4) {
		categoricalWarning.text('The following variables have been identified as factor variables: ' + factorVars);	
	} else if (factorVars.length > 3) {
		categoricalWarning.text('Warning: ' + factorVars.length + ' columns were identified as categorical variables.');
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
	if (missingRows.length > 0 & missingRows.length < 4) {
		missingnessWarning.text('The following observations have been removed due to missing data: ' + missingRows);
	} else if (missingRows.length > 3) {
		missingnessWarning.text('Warning: ' + missingRows.length + ' observations were removed due to missing data.');
	}
	


	// remove all histogram bars
	d3.select('#histogram').selectAll('.bar').remove();

    // create a toolbar for switching the histogram variable
    var selector1 = makeVariableSelector('selector1', data, varNames, 'translate(207,450)');

    // create a toolbar for changing number of bins
    var selector2 = makeBinSelector('selector2', 'translate(207,490)');

	// add bars with height 0 to the histogram
	var barWidth = histWidth / currentBins;
	d3.select('#histogram').selectAll('.bar')
	    .data(Array(currentBins))
	    .enter()
	    .append('rect')
	    .attr('class', 'bar')
	    .attr('width', barWidth)
	    .attr('height', 0)
	    .attr('x', function (d, i) {return i * barWidth})
	    .attr('y', histHeight)
	    .attr('fill', 'steelblue')
	    .attr('stroke', d3.rgb('steelblue').darker());

	// default to selecting the first column of the csv for the histogram
	// later the user will be able to try all the different variables
	histLabel.text(varNames[0]);
	currentVar = data.map(function(d) {return +d[varNames[0]]});
	updateHist(currentVar, currentBins, 100);
	

} // end of explore

myData = ```jsonData''';
explore(myData);




