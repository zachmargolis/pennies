_site: _site/index.html _site/pennies.csv _site/bundle.js _site/screenshot-2019.jpg

browserify=node_modules/.bin/browserify
d3_pre=node_modules/.bin/d3-pre

node_modules/.bin/%: package.json
	npm install
	touch node_modules/.bin/*

_site/index.html: index.html _site/bundle.js _site/pennies.csv $(d3_pre)
	mkdir -p _site
	cp index.html _site/index.html
	$(d3_pre) _site/index.html

# old bit to disable JS
# perl -i -ne'print unless /<script/;' _site/index.html

_site/preview.html: index.html _site/bundle.js _site/pennies.csv $(d3_pre)
	mkdir -p _site
	cp index.html _site/preview.html

_site/pennies.csv: pennies-orig.csv scripts/convert.rb
	mkdir -p _site
	cat pennies-orig.csv | ruby scripts/convert.rb > $@

_site/bundle.js: assets/javascripts/pennies.js $(browserify)
	mkdir -p _site
	$(browserify) $< -o $@ -t [ babelify --presets [ es2015 ] ]

_site/screenshot.jpg: assets/images/screenshot.jpg
	mkdir -p _site
	cp $< $@

_site/screenshot-2019.jpg: assets/images/screenshot-2019.jpg
	mkdir -p _site
	cp $< $@

preview: _site/preview.html

run: _site
	cd _site && python -m SimpleHTTPServer

clean:
	rm -rf _site

.PHONY: run preview clean
