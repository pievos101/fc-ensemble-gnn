# FeatureCloud Ensemble GNN

## What is this app about?

Feature Cloud Ensemble GNN is a federated learning app that uses a graph neural network to train a model on distributed
data. The app is based on the [EnsembleGNN](https://github.com/pievos101/Ensemble-GNN) Method 1.
Upon start, the app can be controlled via an web interface or by giving input parameters in the config.yml file. The app
can be run in the FeatureCloud test-bed as workflow or via user interaction.

## IMPORTANT WORKAROUND

Currently (7.11.2023) the FeatureCloud controller does not support web workers (CSP Error missing CSP policy for
worker-src).
Therefore the graph rendering does not work without disabling the browsers CSP in Featurecloud mode.
For Chrome there is an extension to do
this: https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden

This does not occur when running the app locally without featurecloud.

## Run this app

### Building the Docker Image

Important: The Dockerfile contains an arm64 Image to optimize for M1 Macs

To run this application, you should install Docker and FeatureCloud pip package.

I also recommend to use virtualenv to install the requirements.txt in a virtual environment.

```shell
pip install -r requirements.txt
```

To build the docker image, run the following command:

```shell
sh build.sh 
```

### Changing the UI

To change the UI, NodeJS and the package manager Yarn need to be installed.
Install node: https://nodejs.org/en
Install yarn: https://classic.yarnpkg.com/en/docs/install/#mac-stable

To run the front with the dev server, run the following command

```shell
yarn start
```

To generate a new React build run:

```shell
yarn build
```

This will create an production build and place it inside "react-build-output"
Creating the docker image again will include the new react build.