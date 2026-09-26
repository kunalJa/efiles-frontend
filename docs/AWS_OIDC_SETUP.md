# AWS IAM Setup for E-Files Frontend (Vercel OIDC)

This guide creates the least-privilege AWS role the Next.js backend assumes on
Vercel via OIDC. No long-lived AWS access key is stored in Vercel.

Vercel team slug: `kunalja`
Vercel project:   `efiles-frontend`
AWS account ID:   `800618367364` (confirm before applying)
AWS region:       `us-east-1`

## 1. Create the Vercel OIDC identity provider in AWS

1. Open the AWS Console → IAM → Identity providers → Add provider.
2. Choose **OpenID Connect**.
3. Provider URL:
   ```
   https://oidc.vercel.com
   ```
   (Use the "Global" issuer mode. If your Vercel team is set to "Team" issuer
   mode, use `https://oidc.vercel.com/kunalja` instead.)
4. Audience:
   ```
   https://vercel.com/kunalja
   ```
5. Add the provider and note its ARN:
   ```
   arn:aws:iam::800618367364:oidc-provider/oidc.vercel.com
   ```
   (or `.../oidc-provider/oidc.vercel.com/kunalja` for Team issuer mode)

## 2. Create the permissions policy

Create an IAM policy named `efiles-nextjs-backend-policy` with this document:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeOrderProcessor",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-1:800618367364:function:efiles-order-processor"
    },
    {
      "Sid": "ReadOrderStatus",
      "Effect": "Allow",
      "Action": "dynamodb:Query",
      "Resource": "arn:aws:dynamodb:us-east-1:800618367364:table/kz-pdf-files-db/index/OrderID-index"
    }
  ]
}
```

## 3. Create the role with a Vercel OIDC trust policy

Create an IAM role named `efiles-nextjs-backend` and attach the policy above.

Trust policy (Global issuer mode):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::800618367364:oidc-provider/oidc.vercel.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.vercel.com:aud": "https://vercel.com/kunalja",
          "oidc.vercel.com:sub": "owner:kunalja:project:efiles-frontend:environment:production"
        }
      }
    }
  ]
}
```

Trust policy (Team issuer mode) — use this only if your Vercel team is set to
"Team" issuer mode in Vercel → Settings → OIDC:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::800618367364:oidc-provider/oidc.vercel.com/kunalja"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.vercel.com/kunalja:aud": "https://vercel.com/kunalja",
          "oidc.vercel.com/kunalja:sub": "owner:kunalja:project:efiles-frontend:environment:production"
        }
      }
    }
  ]
}
```

The exact `sub` condition scopes the role to the `efiles-frontend` production
environment inside the `kunalja` team. To support Preview deployments, add
`owner:kunalja:project:efiles-frontend:environment:preview` as another allowed
`sub` value.

## 4. Add the role ARN to Vercel

In Vercel → `kunalja/efiles-frontend` → Settings → Environment Variables, add
for Production (and Preview if you want it there too):

```
AWS_ROLE_ARN=arn:aws:iam::800618367364:role/efiles-nextjs-backend
```

The Next.js AWS clients automatically exchange the Vercel OIDC token for
short-lived AWS credentials when `AWS_ROLE_ARN` is set. See
`src/lib/server/aws.ts`.

> **Note on `AWS_LAMBDA_FUNCTION_NAME`:** Vercel reserves this variable name.
> The Lambda function name is stored in `EFILES_LAMBDA_FUNCTION_NAME` instead.
> All other `AWS_*` variables (`AWS_REGION`, `AWS_DYNAMO_DB_NAME`,
> `AWS_ORDER_ID_INDEX_NAME`, `AWS_ROLE_ARN`) work normally on Vercel. Pin
> `AWS_REGION=us-east-1` explicitly so multi-region routing does not redirect
> AWS SDK calls to the wrong region.

## 5. Local development (no OIDC)

OIDC only works on Vercel. For local development, use an AWS profile, SSO, or
temporary credentials. Do not set `AWS_ROLE_ARN` locally.

```bash
aws configure sso          # or use a named profile
AWS_PROFILE=your-profile pnpm dev
```

The AWS SDK default credential chain is used automatically when
`AWS_ROLE_ARN` is absent.

## What this role can do

- Invoke `efiles-order-processor` Lambda asynchronously.
- Query the `OrderID-index` on `kz-pdf-files-db`.

It cannot read S3, modify DynamoDB items, access Secrets Manager, capture
Stripe, or call Printful. Those are Lambda execution-role responsibilities.
