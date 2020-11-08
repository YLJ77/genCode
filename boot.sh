#!/bin/sh

cd ~/document/repo/genCode
./getIp.sh &
cd ./server
yarn serve &
