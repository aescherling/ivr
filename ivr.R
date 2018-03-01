# ivr.R
# interactive visualizations in R

# two functions:
# uhist (univariate histogram)
# mplot (multivariate scatterplot)


# directory containing the ivr files
setwd('~/github/ivr')

# load the html text
load("ivr.RData")

# uhist function (univariate histograms)
uhist <- function(X, view=TRUE, save=FALSE, file=NULL) {

	# required packages
	require(htmltools)
	require(jsonlite)
	require(glue)

	# convert the input to a data frame, in case it isn't already
	df <- data.frame(X)

	# if only a single variable was passed, keep the variable name
	if (dim(df)[2]==1) {
		colnames(df) <- deparse(substitute(X))
	}


	# convert any character vectors to factors & represent factors as numeric
	for (j in 1:ncol(df)) {
		if (class(df[,j])=="character") {
			df[,j] <- as.numeric(as.factor(df[,j]))
			warning(paste0("Character variable '", colnames(df)[j], "' has been converted to a factor and represented by numeric factor level for plotting purposes."))
		} else if (class(df[,j])=="factor") {
			df[,j] <- as.numeric(df[,j])
			warning(paste0("Factor variable '", colnames(df)[j], "' has been converted to numeric for plotting purposes."))
		}
	}

	# calculate the number of missing values per variable
	nMissing <- data.frame(t(apply(df, 2, function(j) {sum(is.na(j))})))

	# again, if only a single variable was passed, keep the variable name
	if (dim(df)[2]==1) {
		names(nMissing) <- deparse(substitute(X))
	}

    # convert the data to JSON format
	jsonData <- toJSON(list(df, nMissing))

	# glue the JSON data into the uhist html
	html <- HTML(glue(uhist.html, .open="```", .close="'''"))

	# if `view' is true, open in browser
	if (view) print(html, browse=TRUE)

	# if `save' is true, save the file
	if (save) {
		# if the file name is not provided, try saving as uhist.html. 
		# If that already exists try uhist1.html, uhist2.html, etc.
		if (is.null(file)) {
			localFiles <- list.files()
			if (!("uhist.html" %in% localFiles)) {
				cat(html, file="uhist.html")
			} else {
				go <- TRUE
				i <- 1
				while (go) {
					filename <- paste0("uhist", i, ".html")
					if (!(filename %in% localFiles)) {
						cat(html, file=filename)
						go <- FALSE
					} else {
						i <- i + 1
					}
				}
			}
		} else {
			cat(html, file=file)
		}
	}
}


# mplot function (multivariate plots)
# mplot <- function(X) {
# 	jsonData <- toJSON(X)
# 	html <- HTML(glue(mplot.html, .open="```", .close="'''"))
# 	print(html, browse=TRUE)
# }

# save to ivr.RData
save(uhist, uhist.html, file='ivr.RData')
