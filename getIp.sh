#!/bin/sh

SLEEP_SEC=$((60 * 10))
COUNT_DOWN=$SLEEP_SEC

while true
do
	#The file that contains the current pubic IP
	EXT_IP_FILE="./curIp.txt"
	#Get the current public IP from whatsmyip.com
	CURRENT_IP="$(dig +short myip.opendns.com @resolver1.opendns.com)"
	#CURRENT_IP=$(curl http://ifconfig.me/ip)
	#CURRENT_IP=$(date +%s)
	#Check file for previous IP address
	if [ -f $EXT_IP_FILE ]; then
		KNOWN_IP=$(cat $EXT_IP_FILE)
	else
		KNOWN_IP=
	fi
	#See if the IP has changed
	if [ -z "$CURRENT_IP" ]; then
		echo "Empty IP Address $CURRENT_IP"
	elif [ "$CURRENT_IP" != "$KNOWN_IP" ]; then
		echo $CURRENT_IP > $EXT_IP_FILE
		#If so send an alert
		echo "The IP Address at home has changed
		The IP address at home has been changed to $CURRENT_IP"
		git commit -am "[AUTO_COMMIT] IP change"
		git pull
		git push
	else
		#If not just report that it stayed the same
		echo "The IP Address at home is the same
		The IP address at home stayed the same $CURRENT_IP"
	fi
	echo "sleep $SLEEP_SEC s"
	sleep $SLEEP_SEC
	: <<'countDown'
	while [ $COUNT_DOWN -gt 0 ]
	do
		echo "COUNT DOWN $COUNT_DOWN"
		COUNT_DOWN=$((COUNT_DOWN-1))
		sleep 1
	done
	COUNT_DOWN=$SLEEP_SEC
countDown
done
