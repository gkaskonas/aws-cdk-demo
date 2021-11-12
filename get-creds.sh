#!/bin/bash
export TEMP_CREDS=$(aws sts assume-role --role-arn arn:aws:iam::269065460843:role/test-role --role-session-name test --profile services)

echo export AWS_ACCESS_KEY_ID=$(echo $TEMP_CREDS | jq .Credentials.AccessKeyId | xargs)
echo export AWS_SECRET_ACCESS_KEY=$(echo $TEMP_CREDS | jq .Credentials.SecretAccessKey | xargs)
echo export AWS_SESSION_TOKEN=$(echo $TEMP_CREDS | jq .Credentials.SessionToken | xargs)

echo $TEMP_CREDS
