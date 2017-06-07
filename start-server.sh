#!/bin/bash

#
# This script will start wildfly in standalone mode and use the properties found in
# jobss.properties
# to stop the wildfly server simple hit ^C
#

#
# Make a deployment directory 
#
mkdir -p server/deployments

# 
# Copy the base configruation incase something was deployed in standalone
#
cp server/configuration/standalone.base.xml server/configuration/standalone.xml

#
# Start wildfly. Make sure $WF_HOME/bin is in your PATH environment variable.
#
standalone.sh --properties=./jboss.properties -Djboss.server.log.dir=./server/log 
