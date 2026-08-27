import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

let lambdaClient: LambdaClient | undefined;
let documentClient: DynamoDBDocumentClient | undefined;

function region(): string {
  return process.env.AWS_REGION || "us-east-1";
}

/**
 * Production: exchange the Vercel OIDC token for short-lived AWS credentials
 * using AWS_ROLE_ARN. Local development: fall back to the default AWS SDK
 * credential chain (AWS profile, SSO, or temporary env-var credentials).
 */
function credentials() {
  const roleArn = process.env.AWS_ROLE_ARN;
  if (roleArn) {
    return awsCredentialsProvider({ roleArn });
  }
  return undefined;
}

export function getLambdaClient(): LambdaClient {
  lambdaClient ??= new LambdaClient({
    region: region(),
    credentials: credentials(),
  });
  return lambdaClient;
}

export function getDocumentClient(): DynamoDBDocumentClient {
  documentClient ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: region(), credentials: credentials() }),
  );
  return documentClient;
}
