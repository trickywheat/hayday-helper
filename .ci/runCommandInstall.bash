#!/bin/bash -evx

INSTALL_COMMAND=true

# for x in new-commands/**/index.js; do
#   echo "Attempting to install ${x}"
#   INSTALL_COMMAND=${INSTALL_COMMAND} node ${x}
# done

x="new-commands/ping/index.js"

echo "Attempting to install ${x}"
INSTALL_COMMAND=${INSTALL_COMMAND} node ${x}