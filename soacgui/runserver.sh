#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
HOME="$(getent passwd $USER | awk -F ':' '{print $6}')"
UWSGI_ENV_DIR="$HOME/.pyenv/versions/uwsgi-env"

killall uwsgi;
sleep 1s;
#svn update;
source $UWSGI_ENV_DIR/bin/activate;
cd $SCRIPT_DIR;
python manage.py migrate;
python manage.py collectstatic --noinput;
deactivate;
sudo $UWSGI_ENV_DIR/bin/uwsgi -i $SCRIPT_DIR/sdsec/.config/uwsgi/uwsgi.ini &
sudo service nginx restart;
