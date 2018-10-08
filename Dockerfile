
FROM busybox

ADD dist /www/

ENV WEB_ROOT /www

COPY deploy/start.sh .
COPY deploy/create_config.sh .

EXPOSE 8000

# Create config from env and serve web root with httpd
CMD ./start.sh 

