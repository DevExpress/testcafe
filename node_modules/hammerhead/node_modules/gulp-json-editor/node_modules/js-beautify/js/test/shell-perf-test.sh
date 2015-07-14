#!/bin/bash

REL_SCRIPT_DIR="`dirname \"$0\"`"
SCRIPT_DIR="`( cd \"$REL_SCRIPT_DIR\" && pwd )`"


test_performance_js_beautify()
{
  echo ----------------------------------------
  echo Testing js-beautify cli performance...
  CLI_SCRIPT=$SCRIPT_DIR/../bin/js-beautify.js

  mkdir -p /tmp/js-beautify-perf
  if [ ! -f /tmp/js-beautify-perf/jquery-2.0.2.js ];
  then
      curl -o /tmp/js-beautify-perf/jquery-2.0.2.js http://code.jquery.com/jquery-2.0.2.js
  fi

  time $CLI_SCRIPT -o /tmp/js-beautify-perf/jquery-2.0.2-output.js /tmp/js-beautify-perf/jquery-2.0.2.js

}

test_performance_js_beautify

echo ----------------------------------------
echo $0 - DONE.
echo ----------------------------------------
