# ivr_html.R
# create the html templates for the uhist and mplot functions

setwd('~/github/ivr')

# library for combining text files 
library(glue)

# load templates
uhist_template <- readChar('uhist_template.html', file.info('uhist_template.html')$size)
mplot_template <- readChar('mplot_template.html', file.info('mplot_template.html')$size)
iview_template <- readChar('iview_template.html', file.info('iview_template.html')$size)

# load dependencies
bootstrap <- readChar('css/bootstrap.min.css', file.info('css/bootstrap.min.css')$size)
d3 <- readChar('lib/d3.v4.min.js', file.info('lib/d3.v4.min.js')$size)
crossfilter <- readChar('lib/crossfilter.min.js', file.info('lib/crossfilter.min.js')$size)
queue <- readChar('lib/queue.min.js', file.info('lib/queue.min.js')$size)

# load ivr javascript files
uhist <- readChar('uhist.js', file.info('uhist.js')$size)
mplot <- readChar('mplot.js', file.info('mplot.js')$size)
iview <- readChar('iview.js', file.info('iview.js')$size)

# glue them together
uhist.html <- glue(uhist_template)
mplot.html <- glue(mplot_template)
iview.html <- glue(iview_template)

# save html content
save(uhist.html, mplot.html, iview.html, file='ivr.RData')