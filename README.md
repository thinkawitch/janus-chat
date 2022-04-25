# Media chat based on Janus

Some simple chat to use on own purpose. Made with [Janus](https://janus.conf.meetecho.com/) and with help of Docker.


### Setup
1. Make copies of .dist files: .env.dist, make.env.dist, config-ice-servers.js.dist 
3. Make changes in `.env`, `make.env` according to your environment
4. Place your ssl certificates to `docker-containers/ssl-certs/` and set their names in config files
5. ```$ git clone git@github.com:meetecho/janus-gateway.git```
6. ```$ docker-compose up```

### Use make commands

### Files

- `./docker-containers/` - config files for janus, nginx, app, etc. 
- `./docker-logs/` - log files from inside of docker 
- `./janus-gateway/` - original janus repo with demo apps
