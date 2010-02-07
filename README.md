# little

A URL shortener using Redis and Node.js

## Requirements

redis-node-client (included; authored by Brian Hammond, Fictorial)

Node.js [http://nodejs.org](http://nodejs.org)

Redis [http://github.com/antirez/redis](http://github.com/antirez/redis)

## Usage

Start the server:

    $ node little.js
    Server running at http://localhost:8080

Shorten a URL by sending a request to http://localhost:8080?url=http://example.com

The server will respond with a short URL.

By default, the server runs on port 8080 and uses Redis database No. 5. Different values can be given in command-line arguments:

    $node little.js -p 8888 -db 2

## In action

Go to [ltlr.us/?url=http://example.com](http://ltlr.us/?url=http://example.com)
