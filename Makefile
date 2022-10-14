SHELL := /bin/bash
cnf ?= .env
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

dpl ?= make.env
include $(dpl)
export $(shell sed 's/=.*//' $(dpl))

# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help


# the commands

delete-logs:	## Delete all logs
	sudo rm -fr ./docker/logs/janus/log/*
	sudo rm -fr ./docker/logs/nginx/log/*
	sudo rm -fr ./docker/logs/php/admin/*
	sudo rm -fr ./docker/logs/php/api/*

build: ## Build docker containers and images
	docker-compose build


mysql-console: ## Mysql console
	docker-compose exec mysql mysql --ssl-mode=DISABLED ${MYSQL_DATABASE} -u${MYSQL_USER} -p${MYSQL_PASSWORD}

mysql-create-db: ## Create database on dev server
	mysql -h${EXPOSE_IP} -P${EXPOSE_MYSQL_PORT} --ssl-mode=DISABLED -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "CREATE DATABASE ${MYSQL_DATABASE}"


shell-janus: ## Enter janus container
	docker-compose exec janus-gateway bash

shell-admin: ## Enter admin container
	docker-compose exec media-chat-admin bash

shell-api: ## Enter api container
#	docker-compose exec media-chat-api bash # for default
	docker-compose exec media-chat-api sh # for alpine

shell-nginx: ## Enter admin container
	docker-compose exec nginx sh



# symfony related:
SYMFONY_DIR_ADMIN = ./media-chat/admin/
SYMFONY_DIR_API = ./media-chat/api/


admin-symfony-clear-cache: ## admin: clear cache
	make -f symfony.mk symfony-clear-cache -e SYMFONY_DIR=${SYMFONY_DIR_ADMIN}
admin-symfony-reset: ## admin: reset for fresh install
	make -f symfony.mk symfony-reset -e SYMFONY_DIR=${SYMFONY_DIR_ADMIN}
admin-symfony-fix-permissions: ## admin: fix permissions
	make -f symfony.mk symfony-fix-permissions -e SYMFONY_DIR=${SYMFONY_DIR_ADMIN}
admin-symfony-truncate-logs: ## admin: truncate logs
	make -f symfony.mk symfony-truncate-logs -e SYMFONY_DIR=${SYMFONY_DIR_ADMIN}


api-symfony-clear-cache: ## api: clear cache
	make -f symfony.mk symfony-clear-cache -e SYMFONY_DIR=${SYMFONY_DIR_API}
api-symfony-reset: ## api: reset for fresh install
	make -f symfony.mk symfony-reset -e SYMFONY_DIR=${SYMFONY_DIR_API}
api-symfony-fix-permissions: ## api: fix permissions
	make -f symfony.mk symfony-fix-permissions -e SYMFONY_DIR=${SYMFONY_DIR_API}
api-symfony-truncate-logs: ## api: truncate logs
	make -f symfony.mk symfony-truncate-logs -e SYMFONY_DIR=${SYMFONY_DIR_API}
