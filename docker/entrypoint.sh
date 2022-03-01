#!/bin/bash
set -e

rm -f /var/run/apache2/apache2.pid
apachectl -D FOREGROUND &
npm --prefix '/home/tno-eats/client' run serve &
ganache -h 0.0.0.0 
