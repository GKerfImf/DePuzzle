.PHONY: all def build rm run	

def:
	echo "use make all, build, rm, run"

all: build rm run
	
build:
	docker build . -t "depuzzle"

rm:
	docker rm "depuzzle_container"

run:
	docker run --publish 8080:5000 --name "depuzzle_container" -m "200g" -ti "depuzzle"