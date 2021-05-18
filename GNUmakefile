test : node_modules
	node_modules/.bin/jest
.PHONY : test

format : node_modules
	git ls-files -z '*.js' | xargs -0 prettier -w
.PHONY : format

watch :
	git ls-files | entr -r -c $(MAKE) -s test
.PHONY : watch

node_modules : yarn.lock
	yarn
	touch $@
