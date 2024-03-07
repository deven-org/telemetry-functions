import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnAccount } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class ApiGatewayLoggingPermissionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, "ApiGatewayLoggingRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
        ),
      ],
    });

    new CfnAccount(this, "ApiGatewayAccount", {
      cloudWatchRoleArn: role.roleArn,
    });
  }
}
