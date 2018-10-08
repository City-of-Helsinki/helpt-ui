#!/bin/sh

./create_config.sh

httpd -p 8000 -h /www; tail -f /dev/null
