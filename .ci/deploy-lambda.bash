#!/bin/bash -ev

if [[ -f .ci/lambda.env ]]; then
  # Parsing an .env file in bash: https://stackoverflow.com/a/20909045/1652942
  echo "Parsing lambda.env file"
  export $(grep -v '^#' .ci/lambda.env | xargs -d '\n')
fi

if [[ -f .ci/.env ]]; then
  echo "Parsing ci/.env file"
  export $(grep -v '^#' .ci/.env | xargs -d '\n')
fi


if [[ -f .env ]]; then
  echo "Parsing local .env file"
  export $(grep -v '^#' .env | xargs -d '\n')
fi

if [[ -z "$LAMBDA_RUNTIME" ]]; then
  echo "Setting LAMBDA_RUNTIME to nodejs16.x"
  LAMBDA_RUNTIME=nodejs16.x
else
  echo "LAMBDA_RUNTIME set to ${LAMBDA_RUNTIME}"
fi


function createFunction {
  echo "CREATING Lambda Function"

  aws lambda create-function \
    --function-name ${FUNCTION_NAME} \
    --runtime ${LAMBDA_RUNTIME} \
    --role ${LAMBDA_EXECUTION_ROLE} \
    --timeout ${LAMBDA_TIMEOUT} \
    --memory-size ${LAMBDA_MEMORY_SIZE} \
    --architectures ${LAMBDA_ARCHITECTURE} \
    --handler index.handler \
    --zip-file fileb://function.zip
}

function updateFunction {
  echo "UPDATING Lambda Function"
  
  aws lambda update-function-code \
    --function-name ${FUNCTION_NAME} \
    --zip-file fileb://function.zip
}

function createFunctionUrl {
  echo "Requesting a Function Url"

  aws lambda create-function-url-config \
    --function-name ${FUNCTION_NAME} \
    --auth-type NONE
}

if [[ ! -f function.zip ]]; then
  echo "function.zip must be created before running deployment."
  exit 1;
fi

if [[ $1 == 'create' ]]; then
  createFunction && createFunctionUrl
elif [[ $1 == 'update' ]]; then
  updateFunction
else
  echo "Attempting to create the function..."
  createFunction && createFunctionUrl

  if [[ $? != 0 ]]; then
    echo "Create failed, attempting to update function..."
    updateFunction
  fi
fi


