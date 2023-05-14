FROM --platform=linux/arm64 python:latest

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y supervisor nginx
RUN pip3 install --upgrade pip
# We need to install torch separatly, otherwise torch-scatter will fail in the next step
RUN pip install torch
COPY requirements.txt ./requirements.txt
RUN pip3 install -r ./requirements.txt
# as there is no pip package, we install the ensemble-gnn and gnn-subnet packages from github source code
RUN git clone https://github.com/pievos101/Ensemble-GNN.git
RUN git clone https://github.com/pievos101/GNN-SubNet.git
RUN pip install GNN-SubNet/
RUN pip install Ensemble-GNN/

COPY server_config/supervisord.conf /supervisord.conf
COPY server_config/nginx /etc/nginx/sites-available/default
COPY server_config/docker-entrypoint.sh /entrypoint.sh

COPY . /app

EXPOSE 9000 9001

ENTRYPOINT ["sh", "/entrypoint.sh"]
