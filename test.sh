#!/bin/sh

EXT_IP_FILE="./curIp.txt"
echo "$(date +%s)" > $EXT_IP_FILE

git commit -am "[AUTO_COMMIT] TEST BASH"
git pull
git push
cd ./frontend || exit
yarn build
cd ..
pwd

