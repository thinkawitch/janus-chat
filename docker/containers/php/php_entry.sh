#!/usr/bin/env bash

echo "*** Prepare php log file"
#mkdir /var/log/php # no need, dir is created by docker when volume is added
touch /var/log/php/php_errors.log
#chmod 666 /var/log/php/php_errors.log

echo "*** Set /var/log/php permissions"
# set permissions for local files, make editable
chown www-data:www-data -R /var/log/php
chmod gu+rw,o-w -R /var/log/php

echo "*** Set ./var/log permissions"
# fix symfony var/log permissions
chown www-data:www-data -R ./var/log/
chmod gu+rw,o-w -R ./var/log/

echo "*** Install symfony vendors"
composer install

# do next entry point command
echo "*** Execute $@"
exec "$@"
