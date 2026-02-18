#!/bin/bash
# Update provision-openclaw.sh to use web chat interface

SCRIPT_FILE="scripts/provision-openclaw.sh"
WEB_CHAT_FILE="public/instance-landing-v2/index.html"

# Read the web chat HTML and escape it for sed
WEB_CHAT_CONTENT=$(cat "$WEB_CHAT_FILE" | sed 's/[&/\]/\\&/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Find the line numbers for the heredoc section
START_LINE=$(grep -n "cat > /var/www/html/index.html <<'EOLANDING'" "$SCRIPT_FILE" | cut -d: -f1)
END_LINE=$(grep -n "^EOLANDING$" "$SCRIPT_FILE" | head -1 | cut -d: -f1)

echo "Found HTML section from line $START_LINE to $END_LINE"
echo "Replacing with web chat interface..."

# Create temp file with everything before the HTML section
head -n $((START_LINE - 1)) "$SCRIPT_FILE" > "${SCRIPT_FILE}.tmp"

# Add the new web chat HTML
echo "cat > /var/www/html/index.html <<'EOLANDING'" >> "${SCRIPT_FILE}.tmp"
cat "$WEB_CHAT_FILE" >> "${SCRIPT_FILE}.tmp"
echo "EOLANDING" >> "${SCRIPT_FILE}.tmp"

# Add everything after the HTML section
tail -n +$((END_LINE + 1)) "$SCRIPT_FILE" >> "${SCRIPT_FILE}.tmp"

# Replace the original file
mv "${SCRIPT_FILE}.tmp" "$SCRIPT_FILE"

echo "✅ Provisioning script updated with web chat interface"
echo "📍 Location: $SCRIPT_FILE"
