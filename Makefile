all:
	uglifyjs jquery-svgpan.js > jquery-svgpan.min.js

clean:
	rm jquery-svgpan.min.js
