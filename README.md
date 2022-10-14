# Media chat based on Janus

Some simple chat to use on own purpose. Made with [Janus](https://janus.conf.meetecho.com/) and with help of Docker.  
Text chat only and admin panel for rooms.


### Setup
1. Make copies of .dist files: .env.dist, make.env.dist, config-ice-servers.js.dist 
2. Make changes in `.env`, `make.env` according to your environment
3. Place your ssl certificates to `./docker/containers/ssl-certs/` as ssl_media_chat.crt, ssl_media_chat.key, or set their names in config files
4. ```$ git clone git@github.com:meetecho/janus-gateway.git```
5. ```$ cp ./janus-gateway/html/janus.js ./media-chat/common/js/vendor/janus.js```
6. ```$ docker-compose up```

### Use make commands

### Files

- `./docker/containers/` - config files for janus, nginx, app, etc. 
- `./docker/logs/` - log files from inside of docker 
- `./janus-gateway/` - original janus repo with demo apps
