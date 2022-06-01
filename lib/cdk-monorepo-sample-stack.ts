import {
  Stack,
  StackProps,
  aws_apigateway,
  aws_lambda_nodejs,
  aws_s3_deployment,
  BundlingOutput,
  DockerImage,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';

import { spawnSync } from 'child_process';
import { copySync } from 'fs-extra';
import * as path from 'path';

export class CdkMonorepoSampleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Backend Deploy
     */
    const greetingHandler = new aws_lambda_nodejs.NodejsFunction(
      this,
      'GreetingHandler',
      {
        entry: 'sources/backend/api/messages.ts',
      }
    );

    const restApi = new aws_apigateway.RestApi(this, 'RestApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      },
    });

    const greetingResources = restApi.root.addResource('greeting');
    greetingResources.addMethod(
      'GET',
      new aws_apigateway.LambdaIntegration(greetingHandler),
      {
        authorizationType: aws_apigateway.AuthorizationType.NONE,
      }
    );

    /**
     * Frontend Deploy
     */
    const frontendEnvVars = {
      apiUrlBase: restApi.url,
    };

    const { s3BucketInterface: appBucket, cloudFrontWebDistribution } =
      new CloudFrontToS3(this, 'FrontendDistribution', {
        insertHttpSecurityHeaders: false,
        cloudFrontDistributionProps: {
          errorResponses: [
            {
              httpStatus: 403,
              responseHttpStatus: 200,
              responsePagePath: '/',
            },
          ],
        },
      });

    new aws_s3_deployment.BucketDeployment(this, 'AppDeployment', {
      destinationBucket: appBucket,
      distribution: cloudFrontWebDistribution,
      sources: [
        aws_s3_deployment.Source.jsonData('env.json', frontendEnvVars),
        aws_s3_deployment.Source.asset(
          path.join(__dirname, '../sources/frontend'),
          {
            bundling: {
              outputType: BundlingOutput.NOT_ARCHIVED,
              local: {
                tryBundle(outputDir: string) {
                  spawnSync('npm run web:bundling', { shell: true });
                  copySync(
                    path.join(__dirname, '../sources/frontend/dist'),
                    outputDir
                  );
                  return true;
                },
              },
              image: DockerImage.fromRegistry('node:lts'),
            },
            exclude: ['node_modules'],
          }
        ),
      ],
      memoryLimit: 2048,
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: cloudFrontWebDistribution.distributionDomainName,
    });
  }
}
