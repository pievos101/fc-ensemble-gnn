# FeatureCloud Ensemble GNN

## What is this APP about?

Feature Cloud Ensemble GNN is a federated learning APP that uses a graph neural network to train a model on distributed
data. The APP is based on the [EnsembleGNN](https://github.com/pievos101/Ensemble-GNN) Method 1.
The idea is to train multiple models locally with the clients data and then aggregate the models to a global model.
Before start, the input files need to be provided and linked the config.yml file.
Upon start, the APP can be controlled via an web interface.
The APP can be run in an automated workflow or it waits for user interaction after the workflow finished for analysis.

### Workflow mode

In Workflow mode, the APP goes through the following steps:

1. Data is loaded from the provided files (conig.yml + data files)
2. The data is split into train, test and validation set
3. The model is trained on the train set
4. The model is evaluated on the validation set and the test set
5. The model is sent to the coordinator and the APP is waiting for the global model
6. The coordinator aggregates the models and sends the global model back
7. After receiving global model is evaluated on validation and test set
8. The metrics are stored into files and stored as downloadable output with the training data of the model

### UI mode

In UI mode, the APP is intended to be used for analysis of the data and the models, by applying domain knowledge.

- Steps 1-7 are the same as in workflow mode
- After receiving the global model, the APP is waiting for user interaction
- The user can analyse the ensemble classifiers from his local model and the global model
    - The weighted knowledge graph can be analysed in a 2D Rendered view
    - The nodes and eges with their weighting can be analysed in a table view
- Based on his domain knowledge (or just guessing to experiment), the user can weight the ensemble classifiers
    - The weighting is done by the user in the UI
    - The local model can be weighted to see how the performance changes
    - The global model can be weighted to see how the performance changes, but here, we also have a weight aggregation
      method

#### Weight Aggregation Method

1. The user weights the global model
2. The user sends the weights to the coordinator
3. The coordinator weights for all clients to either finish or send their weights
4. The coordinator aggregates the weights
    1. Currently, the weights are aggregated by averaging them
5. The coordinator sends the aggregated weights to the clients
6. Now each client has a set of aggregated weights and can apply them to the global model

This weighting circle can be repeated as often as the user wants.

## IMPORTANT WORKAROUND

Currently (7.11.2023) the FeatureCloud controller does not support web workers (CSP Error: missing CSP policy for
worker-src).
Therefore the graph rendering does not work without disabling the browsers CSP.
For Chrome there is an extension to do
this: https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden

This does not occur when running the APP locally without FeatureCloud. (yarn start + local_main.py)

## Run this APP

### Run the APP as a FeatureCloud APP

#### Input Data

An example for the input data can be found in the data/client folder on the github repository.

1. config
    1. config.yml
    2.     input_features_name: "KIDNEY_RANDOM_mRNA_FEATURES.txt"  # features
           input_ppi_name: "KIDNEY_RANDOM_PPI.txt"  # Knowledge graph
           input_target_name: "KIDNEY_RANDOM_TARGET.txt"  # response vector
           wait_for_ui: true
    3. The wait_for_ui flag determines if the APP should wait for user interaction after the workflow finished
2. features data
    1. can be either a .txt or .csv file
3. Knowledge graph data
    1. can be either a .txt or .csv file
4. Response vector data
    1. can be either a .txt or .csv file

These files need to be provided to start the APP.

#### Output Data

1. analysis
    1. local_performance.txt - the performance metrics of the local model
    2. global_performance.txt - the performance metrics of the local model


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

### Running the APP for local development

The make life easier, local development can be done with a script which starts the API server and provides one model.
Local and Global model are equal with this setup.
The data entry point needs to be adjusted in the config.yml file. Default is the synthetic data set (its the fastest to
train on)

```shell
python3 local_main.py
```

After this, start the react APP with "yarn start" and open the browser at "localhost:3000"

## Additional Information

### Dynamic hosting route

The FeatureCloud Controller always serves the APP at a different subroute which changes dynamically. Normally this would
not work with React.
To fix this, we build the React APP with an prefixed route. The placeholder "_DYNAMIC_URL_PREFIX_PLACEHOLDER_" is used
as seen in the package.json file.
Upon startup, the dynamic subroute is provided as an environment variable and the placeholder is replaced with the real
route by the script dynamic-url-changer.py.
