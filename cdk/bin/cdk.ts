import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {LbryArchive} from '../lib/lbryArchive';
import * as process from "process";
import {config} from "dotenv"
import {GithubStack} from "../lib/github";


config()

const app = new cdk.App();
const env = {
    account: process.env.ASW_ACCOUNT_ID,
    region: process.env.AWS_REGION,
};

const lbry = new LbryArchive(app, 'LbryArchive', {
    env
});
const github = new GithubStack(app, 'github-ci', {env})
