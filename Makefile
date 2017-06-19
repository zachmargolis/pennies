_site: _site/index.html _site/pennies.csv _site/bundle.js _site/screenshot.jpg

browserify=node_modules/.bin/browserify
d3_pre=node_modules/.bin/d3-pre

node_modules/.bin/%: package.json
	npm install
	touch node_modules/.bin/*

_site/index.html: index.html _site/bundle.js $(d3_pre)
	mkdir -p _site
	cp index.html _site/index.html
	$(d3_pre) _site/index.html

_site/pennies.csv: pennies-orig.csv scripts/convert.rb
	mkdir -p _site
	cat pennies-orig.csv | ruby scripts/convert.rb > _site/pennies.csv

_site/bundle.js: assets/javascripts/pennies.js $(browserify)
	mkdir -p _site
	$(browserify) assets/javascripts/pennies.js -o _site/bundle.js -t [ babelify --presets [ es2015 ] ]

_site/screenshot.jpg: assets/images/screenshot.jpg
	mkdir -p _site
	cp assets/images/screenshot.jpg _site/screenshot.jpg

run: _site
	cd _site && python -m SimpleHTTPServer

.PHONY: run
