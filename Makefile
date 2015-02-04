install:
	npm install

update:
	npm prune
	npm update

clean:
	rm -Rf docs lib lib-cov tests/lib

watch: clean
	gulp watch

build:
	gulp build-all

run-tests:
	gulp run-tests
