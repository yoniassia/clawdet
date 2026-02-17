#!/bin/bash
# Test script for Stripe webhook

# Get a test user ID from the database
USER_ID=$(cat data/users.json 2>/dev/null | jq -r '.[0].id // "test_user_123"')

echo "Testing Stripe webhook with user ID: $USER_ID"
echo ""

# Mock Stripe checkout.session.completed event
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_mock123",
        "customer_email": "test@example.com",
        "metadata": {
          "userId": "'$USER_ID'",
          "xUsername": "testuser"
        },
        "payment_status": "paid"
      }
    }
  }' | jq

echo ""
echo "Check user status:"
cat data/users.json 2>/dev/null | jq '.[] | select(.id == "'$USER_ID'")'
