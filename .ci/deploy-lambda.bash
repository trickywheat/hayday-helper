#!/bin/bash -evx

##### ENVIRONMENT FILES #####
envFiles=(".ci/lambda.env" ".ci/.env" ".env")
# Each file serves different purposes for the project:
#
# .ci/lambda.env - Lambda Function defaults, such as memory, 
#                  architecture, etc.  This can be committed 
#                  without issues
#
# .ci/.env - Lambda Function Meta Secrets, such as role ARN,  
#            etc. that are considered private as they contain 
#            information about the account.  Do not commit this
#            file.
#
# .env - Lambda function environment variables, typically function
#        secrets like API keys.  Do not commit this file.
#        
# Files are processed in the above order so variables set in the last
# file supercede those in previous files.  This also means that when
# this file is run in Github Actions, environment variables set above
# will supercede those set by Github so it's important that variable
# names do not overlap.


function loadEnv {
  # Parsing an .env file in bash: https://stackoverflow.com/a/20909045/1652942
  echo "Parsing ${1} file"
  export $(grep -v '^#' ${1} | xargs -d '\n')
}

for i in ${!envFiles[@]};
do
  file=${envFiles[$i]}

  if [[ -f $file ]]; then
    loadEnv $file
  fi
done

# Set LAMBDA_RUNTIME if not set by other environment variables
if [[ -z "$LAMBDA_RUNTIME" ]]; then
  echo "Setting LAMBDA_RUNTIME to nodejs16.x"
  LAMBDA_RUNTIME=nodejs16.x
else
  echo "LAMBDA_RUNTIME set to ${LAMBDA_RUNTIME}"
fi


function createFunction {
  echo "CREATING Lambda Function"

  aws lambda create-function \
    --function-name ${LAMBDA_FUNCTION_NAME} \
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
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --architectures ${LAMBDA_ARCHITECTURE} \
    --zip-file fileb://function.zip
}

function createFunctionUrl {
  echo "Adding resource permissions to enable Function URL"
  aws lambda add-permission \
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --statement-id "FunctionURLAllowPublicAccess" \
    --action "lambda:InvokeFunctionUrl" \
    --function-url-auth-type "NONE" \
    --principal "*"

  echo "Requesting a Function Url"

  aws lambda create-function-url-config \
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --auth-type NONE
}

function updateFunctionMetadata {
  if [[ -z $LAMBDA_ENV_VARS ]] && [[ -f .env ]]; then 
    echo "Parsing function .env file..."
    LAMBDA_ENV_VARS=$(sed -z 's/\n/,/g' .env)

    echo $LAMBDA_ENV_VARS
  fi

  if [[! -z GITHUB_ACTION ]]; then
    echo "Hello Github Actions Worflow: ${GITHUB_WORKFLOW}"
    GIT_SHA=$GITHUB_SHA
    BUILD_ID=${GITHUB_RUN_ID}
  else 
    echo "Adding git SHA"
    GIT_SHA=$(git rev-parse HEAD)

    echo "Setting BUILD_ID to local-build"
    BUILD_ID="local-build"
  fi

  LAMBDA_ENV_VARS=${LAMBDA_ENV_VARS},SHA=${GIT_SHA},BUILD_ID=${BUILD_ID}

  echo "Updating Lambda Function's Metadata..."
  aws lambda update-function-configuration \
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --runtime ${LAMBDA_RUNTIME} \
    --role ${LAMBDA_EXECUTION_ROLE} \
    --timeout ${LAMBDA_TIMEOUT} \
    --memory-size ${LAMBDA_MEMORY_SIZE} \
    --environment Variables={${LAMBDA_ENV_VARS}}
}

function addTags {
  echo "Adding tags..."

  aws lambda tag-resource \
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --tags githubRepo="trickywheat/hayday-helper"
}


if [[ ! -f function.zip ]]; then
  echo "function.zip must be created before running deployment."
  exit 1;
fi

if [[ $1 == 'create' ]]; then
  createFunction && createFunctionUrl
elif [[ $1 == 'update' ]]; then
  updateFunction
elif [[ $1 == 'update-metadata' ]]; then
  updateFunctionMetadata
else
  echo "Attempting to create the function..."
  createFunction && createFunctionUrl

  if [[ $? != 0 ]]; then
    echo "Create failed, attempting to update function..."
    updateFunction
  fi
fi
