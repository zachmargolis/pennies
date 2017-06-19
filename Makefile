_site/: _site
_site: _site/index.html _site/pennies.csv _site/bundle.js

_site/index.html: index.html
	mkdir -p _site
	cp index.html _site/index.html
	# TODO: d3-pre

_site/pennies.csv: pennies-orig.csv scripts/convert.rb
	mkdir -p _site
	cat pennies-orig.csv | ruby scripts/convert.rb > _site/pennies.csv

browserify = "node_modules/.bin/browserify"

_site/bundle.js: assets/javascripts/pennies.js $(browserify)
	$(browserify) assets/javascripts/pennies.js -o _site/bundle.js -t [ babelify --presets [ es2015 ] ]

$(browserify): package.json
	# npm install
	touch -h $(browserify) || exit 1

run: _site
	cd _site && python -m SimpleHTTPServer

.PHONY: run
