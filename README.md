# FeatureCloud Ensemble GNN

## What is this app about?

Feature Cloud Ensemble GNN is a federated learning app that uses a graph neural network to train a model on distributed
data. The app is based on the [EnsembleGNN](https://github.com/pievos101/Ensemble-GNN) Method 1.
The idea is to train multiple models locally with the clients data and then aggregate the models to a global model.
Before start, the input files need to be provided and linked the config.yml file.
Upon start, the app can be controlled via an web interface.
The app can be run in an automated workflow or it waits for user interaction after the workflow finished for analysis.

## IMPORTANT WORKAROUND

Currently (7.11.2023) the FeatureCloud controller does not support web workers (CSP Error: missing CSP policy for
worker-src).
Therefore the graph rendering does not work without disabling the browsers CSP.
For Chrome there is an extension to do
this: https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden

This does not occur when running the app locally without FeatureCloud. (yarn start + local_main.py)

## Run this app

### Building the Docker Image

Important: The Dockerfile contains an arm64 Image (which runs optimally on Apple Silicon), but the "
--platform=linux/arm64" can be omitted for x86_64 systems.

To run this application, you should install Docker and FeatureCloud pip package.

I also recommend to use virtualenv to install the requirements.txt in a virtual environment. (either via console or IDE)

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

To run the front with the development server, run the following command:
```shell
yarn start
```

To generate a new React build run:
```shell
yarn build
```

This will create a production build and place it inside "react-build-output" folder. NGINX does serve the index file
from this folder.
Creating the docker image again will include the new react build in the image.

### Running the app for local development

The make life easier, local development can be done with a script which starts the API server and provides one model.
Local and Global model are equal with this setup.
The data entry point needs to be adjusted in the config.yml file. Default is the synthetic data set (its the fastest to
train on)

```shell
python3 local_main.py
```

After this, start the react app with "yarn start" and open the browser at "localhost:3000"

## Additional Information

### Dynamic hosting route

The FeatureCloud Controller always serves the app at a different subroute which changes dynamically. Normally this would
not work with React.
To fix this, we build the React app with an prefixed route. The placeholder "_DYNAMIC_URL_PREFIX_PLACEHOLDER_" is used
as seen in the package.json file.
Upon startup, the dynamic subroute is provided as an environment variable and the placeholder is replaced with the real
route by the script dynamic-url-changer.py.
