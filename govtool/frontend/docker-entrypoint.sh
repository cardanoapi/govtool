#!/bin/sh
set -eu

envsubst < /usr/share/nginx/html/env.js > /tmp/env.js
mv /tmp/env.js /usr/share/nginx/html/env.js

rm -f /usr/share/nginx/html/env.js.br /usr/share/nginx/html/env.js.gz

exec nginx -g "daemon off;"