import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let lambdaClient: LambdaClient | undefined;
let documentClient: DynamoDBDocumentClient | undefined;

function region(): string {
  return process.env.AWS_REGION || "us-east-1";
}

export function getLambdaClient(): LambdaClient {
  lambdaClient ??= new LambdaClient({ region: region() });
  return lambdaClient;
}

export function getDocumentClient(): DynamoDBDocumentClient {
  documentClient ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: region() }),
  );
  return documentClient;
}
