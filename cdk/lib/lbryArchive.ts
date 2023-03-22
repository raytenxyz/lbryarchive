import * as cdk from 'aws-cdk-lib';
import {Tag} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class LbryArchive extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use the default VPC
    const defaultVpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true,
    });

    // Create a Security Group
    const mySecurityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
      vpc: defaultVpc,
      description: 'Allow SSH and HTTP(S) access',
      allowAllOutbound: true,
    });

    // Add Ingress Rules to Security Group
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH');
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    // Add the tag "tag=lbry" to the EC2 instance
    const tag = new Tag('tag', 'lbry');

    // Create an EC2 instance
    const myInstance = new ec2.Instance(this, 'MyInstance', {
      instanceName: "lbry",
      vpc: defaultVpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: new ec2.LookupMachineImage({
        name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*',
        owners: ['099720109477'], // Canonical (Ubuntu) owner ID
      }),
      securityGroup: mySecurityGroup
    })
    tag.visit(myInstance)

    // allow to pull image from ecr.
    const repo = ecr.Repository.fromRepositoryName(this, "lbry-repo", "lbryarchive")
    repo.grantPull(myInstance)

    // Allocate a static Elastic IP address
    const myEip = new ec2.CfnEIP(this, 'MyEIP', {tags: [tag]});

    // Associate the Elastic IP address with the EC2 instance
    new ec2.CfnEIPAssociation(this, 'MyEIPAssociation', {
      instanceId: myInstance.instanceId,
      eip: myEip.ref,
    });
  }
}