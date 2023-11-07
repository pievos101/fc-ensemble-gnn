# Important: The Dockerfile contains an arm64 Image!!!

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

### Run YOUR_APPLICATION

#### Prerequisite

To run YOUR_APPLICATION, you should install Docker and FeatureCloud pip package:

```shell
pip install featurecloud
```

Then either download fc-ensemble-gnn image from the FeatureCloud docker repository:

```shell
featurecloud app download featurecloud.ai/fc-ensemble-gnn
```

Or build the app locally with the provided build script:

```shell
sh build.sh 
```

#### Run YOUR_APPLICATION in the test-bed

You can run YOUR_APPLICATION as a standalone app in the [FeatureCloud test-bed](https://featurecloud.ai/development/test) or [FeatureCloud Workflow](https://featurecloud.ai/projects). You can also run the app using CLI:

```shell
featurecloud test start --app-image featurecloud.ai/YOUR_APPLICATION --client-dirs './sample/c1,./sample/c2' --generic-dir './sample/generic'
```
