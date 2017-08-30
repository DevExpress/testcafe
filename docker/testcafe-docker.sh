#!/bin/sh
XVFB_SCREEN_WIDTH=${SCREEN_WIDTH-1280}
XVFB_SCREEN_HEIGHT=${SCREEN_HEIGHT-720}

dbus-daemon --session --fork
Xvfb :1 -screen 0 "${XVFB_SCREEN_WIDTH}x${XVFB_SCREEN_HEIGHT}x24" >/dev/null 2>&1 &
export DISPLAY=:1.0
fluxbox >/dev/null 2>&1 &
node /opt/testcafe/bin/testcafe.js --ports 1337,1338 "$@"
