build:
	docker build -t raxdio-chat .
start:
	docker run --rm -p 3020:3020 raxdio-chat
