test :
	node_modules/.bin/jest
.PHONY : test

watch :
	git ls-files | entr -r -c $(MAKE) -s test
.PHONY : watch
