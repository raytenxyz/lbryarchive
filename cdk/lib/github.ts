import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import {ManagedPolicy} from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";

export class GithubStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const user = new iam.User(this, 'github-ci', {
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess'),
                // WARNING: this would allow github to create new users in our AWS accounts.
                // ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess'),
            ],
        });

        const accessKey = new iam.CfnAccessKey(this, 'github-ci-key', {
            userName: user.userName,
        });

        new cdk.CfnOutput(this, 'accessKeyId', { value: accessKey.ref });
        new cdk.CfnOutput(this, 'secretAccessKey', { value: accessKey.attrSecretAccessKey });
    }
}