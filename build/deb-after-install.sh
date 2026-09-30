#!/bin/sh
set -e
SANDBOX="/opt/Veyra/chrome-sandbox"
if [ -f "$SANDBOX" ]; then
  chown root:root "$SANDBOX"
  chmod 4755 "$SANDBOX"
fi
exit 0
