
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

# should be set in project specific commands, failsafe not to delete anything important
SYMFONY_DIR ?= _some_incorrect_symfony_dir

symfony-clear-cache: ## Clear cache
	sudo rm -fr ${SYMFONY_DIR}var/cache

symfony-reset: symfony-clear-cache ## Prepare symfony to clean vendors install
	sudo rm -fr ${SYMFONY_DIR}var/log
	sudo rm -fr ${SYMFONY_DIR}vendor
	sudo rm -f ${SYMFONY_DIR}composer.lock
	sudo rm -f ${SYMFONY_DIR}symfony.lock

symfony-fix-permissions: ## Fix file permissions for symfony vendor/ and var/
	sudo chown $(USER):$(USER) ${SYMFONY_DIR}config -R
	sudo chmod gu+rw,o-w ${SYMFONY_DIR}config -R
	sudo chown $(USER):www-data ${SYMFONY_DIR}var -R
	sudo chmod gu+rw,o-w ${SYMFONY_DIR}var -R
	sudo chown $(USER):$(USER) ${SYMFONY_DIR}vendor -R
	sudo chmod gu+rw,o-w ${SYMFONY_DIR}vendor -R
	#sudo chown $(USER):www-data ${SYMFONY_DIR}.phpunit.result.cache
	#sudo chmod gu+rw,o-w ${SYMFONY_DIR}.phpunit.result.cache

symfony-truncate-logs: ## Truncate log files
	sudo truncate -s 0 ${SYMFONY_DIR}var/log/*.log
