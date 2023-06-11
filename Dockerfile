FROM --platform=linux/arm64 python:latest

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc supervisor nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY server_config/supervisord.conf /supervisord.conf
COPY server_config/nginx /etc/nginx/sites-available/default
COPY server_config/docker-entrypoint.sh /entrypoint.sh

COPY requirements.txt /app/requirements.txt

RUN pip3 install --user --upgrade pip
    # We need to install torch separatly, otherwise torch-scatter will fail in the next step
RUN pip3 install --user torch
RUN pip3 install --user -r ./app/requirements.txt

# as there is no pip package, we install the ensemble-gnn and gnn-subnet packages from github source code
RUN git clone https://github.com/pievos101/Ensemble-GNN.git
RUN git clone https://github.com/pievos101/GNN-SubNet.git
RUN pip3 install GNN-SubNet/
RUN pip3 install Ensemble-GNN/

COPY . /app

EXPOSE 9000 9001
ENTRYPOINT ["sh", "/entrypoint.sh"]
