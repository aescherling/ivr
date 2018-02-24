# ivr.R
# interactive visualizations in R

# two functions:
# uhist (univariate histogram)
# mplot (multivariate scatterplot)

# required packages
require(htmltools)
require(jsonlite)
require(glue)

# directory containing the ivr files
setwd('~/github/ivr')

# load the html text
load("ivr.RData")

# uhist function (univariate histograms)
uhist <- function(X) {
	jsonData <- toJSON(X)
	html <- HTML(glue(uhist.html, .open="```", .close="'''"))
	print(html, browse=TRUE)
}

# mplot function (multivariate plots)
mplot <- function(X) {
	jsonData <- toJSON(X)
	html <- HTML(glue(mplot.html, .open="```", .close="'''"))
	print(html, browse=TRUE)
}