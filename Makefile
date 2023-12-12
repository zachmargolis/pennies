_site:
	mkdir -p _site

browserify=node_modules/.bin/browserify

node_modules/.bin/%: package.json
	npm install
	touch node_modules/.bin/*

_site/index.html: index.html _site/bundle.js _site/pennies.csv _site/styles.css | _site
	cp index.html _site/index.html

# old bit to disable JS
# perl -i -ne'print unless /<script/;' _site/index.html

_site/pennies.csv: pennies-orig.csv scripts/convert.rb | _site
	cat pennies-orig.csv | ruby scripts/convert.rb > $@

_site/styles.css: assets/stylesheets/styles.css | _site
	cp $< $@

_site/bundle.js: assets/javascripts/pennies.js $(browserify) | _site
	$(browserify) -p esmify $< -o $@ -t [ babelify --presets [ es2015 ] ]

_site/screenshot-%.jpg: assets/images/screenshot-%.jpg | _site
	cp $< $@

_site/favicon.ico: assets/images/favicon.ico | _site
	cp $< $@

site: _site _site/index.html _site/favicon.ico _site/screenshot-2022.jpg _site/screenshot-2020.jpg _site/screenshot-2019.jpg _site/screenshot-2018.jpg

.DEFAULT_GOAL := site

run: site
	cd _site && python3 -m http.server

clean:
	rm -rf _site

.PHONY: run site clean
