/*
 * A URL shortener using Redis and Node.js.
 */
var PORT = 8080;
var HOST = 'localhost'

var sys = require('sys'),
    http = require('http'),
    url_mod = require('url'),
    redis = require('./redis-node-client/redisclient');

var client = new redis.Client();

var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Check whether a URL is in the request URI's querystring.
var url_query = function(parsed) {
    if ('query' in parsed) {
        if ('url' in parsed.query) {
            return true;
        }
    }
    return false;
}

http.createServer(function(req, res) {

        var parsed = url_mod.parse(req.url, true);

        if (url_query(parsed)) {

            var url = parsed.query.url;

            // Check for whether there's a key for this URL.
            // This is so we don't store duplicates.
            client.get(url).addCallback(function (val) {

                // This URL is already being stored. Return
                // the encoded key.
                if (val) {
                    res.sendHeader(200, {'Content-Type': 'text/plain'});
                    res.sendBody('http://' + HOST + ':' + PORT + '/' + val);
                    res.finish();

                // This is a new URL.
                } else {

                    // Increment the ids key. 
                    // Each URL that we saved corresponds to an increment
                    // on this key. The value of the key (once incremented)
                    // is converted to base64 to create the short URL.
                    client.incr('ids').addCallback(function (id) {

                        var encoded = baseEncode(String(id), keyStr);

                        // Store the URL on the key of the base64
                        // encoding of the corresponding ids value.
                        client.set(encoded, url).addCallback(function() {

                            // Also store the reverse: The URL as the key
                            // with the encoded ID as the value. This ensures
                            // that we do not store duplicates, and also allows
                            // us to show the short URL for a long URL that's already
                            // been shortened.
                            client.set(url, encoded).addCallback(function() {

                                // Once the short and long URLs are stored, show
                                // the short version.
                                res.sendHeader(200, {'Content-Type': 'text/plain'});
                                res.sendBody('http://' + HOST + ':' + PORT + '/' + encoded);
                                res.finish();
                            });

                        });

                    });

                }

            });

        // There's no ?url= in the query. The client is
        // either requesting a short URL (in which case we
        // redirect to the long URL) or there's an error.
        } else {

            // Remove the leading slash from the pathname.
            path = parsed.pathname.replace(/^\//, '');

            if (path) { // The request isn't for /

                // Look up the path.
                client.get(path).addCallback(function(val) {
                    if (val) { // A corresponding long URL exists.
                        res.sendHeader(301, {'Location': val}); // Redirect to the long URL.
                        res.finish();

                    } else { // No corresponding long URL exists. 404.
                        res.sendHeader(404, {});
                        res.finish();
                    }

                });

            } else { // The request is for /. 404.
                res.sendHeader(404, {});
                res.finish();
            }
        }

}).listen(PORT);


/*
 * Adapted from http://www.webtoolkit.info/javascript-base64.html
 *
 * Encode a string as Base n, where n = keyStr.length
 */
var baseEncode = function (input, keyStr) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & (keyStr.length-1);

        if (isNaN(chr2)) {
            enc3 = enc4 = keyStr.length;
        } else if (isNaN(chr3)) {
            enc4 = keyStr.length;
        }

        output = output +
        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }

    return output;
}

sys.puts('Server running at http://' + HOST + ':' + PORT);
