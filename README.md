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

Set the port and host in little.js.

## In action

Go to [ltlr.us/?url=http://example.com](http://ltlr.us/?url=http://example.com)
