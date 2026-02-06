#!/bin/bash
BUILD_ID="03f6daf5-98f0-44ee-ba67-b261305ff85e"
TARGET="8469257821"

echo "Monitoring build $BUILD_ID..."

while true; do
  # Fetch build info
  if ! JSON=$(eas build:view $BUILD_ID --json 2>/dev/null); then
    echo "Failed to fetch build status. Retrying..."
    sleep 30
    continue
  fi
  
  STATUS=$(echo "$JSON" | jq -r .status)

  if [ "$STATUS" == "FINISHED" ]; then
    ARTIFACT_URL=$(echo "$JSON" | jq -r .artifacts.buildUrl)
    # Fallback if buildUrl is null (sometimes it's in a different field or needs applicationArchiveUrl)
    if [ "$ARTIFACT_URL" == "null" ] || [ -z "$ARTIFACT_URL" ]; then
        ARTIFACT_URL=$(echo "$JSON" | jq -r .artifacts.applicationArchiveUrl)
    fi
    
    MSG="Dog Translator Android build complete! 🚀 Download here: $ARTIFACT_URL"
    echo "Sending success: $MSG"
    # Use the CLI to send message
    openclaw message send --target "$TARGET" --message "$MSG"
    break
  elif [ "$STATUS" == "ERRORED" ] || [ "$STATUS" == "CANCELED" ]; then
    MSG="Dog Translator Android build failed/canceled. Status: $STATUS"
    echo "Sending failure: $MSG"
    openclaw message send --target "$TARGET" --message "$MSG"
    break
  fi
  
  echo "Status: $STATUS. Waiting..."
  sleep 30
done
