#!/bin/bash

echo "Initializing LocalStack AWS resources..."

# Create S3 bucket for day state storage
awslocal s3 mb s3://day-timeline-storage

# Create Cognito User Pool
USER_POOL_ID=$(awslocal cognito-idp create-user-pool \
  --pool-name day-timeline-users \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --query 'UserPool.Id' \
  --output text)

echo "Created User Pool: $USER_POOL_ID"

# Create User Pool Client
CLIENT_ID=$(awslocal cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name day-timeline-web \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Created User Pool Client: $CLIENT_ID"

# Create a test user for development
awslocal cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "test@example.com" \
  --temporary-password "TempPass123" \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \
  --message-action SUPPRESS

# Set permanent password for test user
awslocal cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "test@example.com" \
  --password "TestPass123" \
  --permanent

echo "Created test user: test@example.com / TestPass123"

# Save configuration for frontend/backend
mkdir -p /var/lib/localstack/config
cat > /var/lib/localstack/config/aws-config.json << EOF
{
  "userPoolId": "$USER_POOL_ID",
  "clientId": "$CLIENT_ID",
  "region": "us-east-1",
  "s3Bucket": "day-timeline-storage"
}
EOF

echo "LocalStack initialization complete!"
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
