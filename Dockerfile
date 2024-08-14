# Use an official Node.js runtime as a parent image
FROM node:10.16.3-buster

# Set the working directory
WORKDIR /usr/src/app

# Install required dependencies
RUN apt-get update && \
    apt-get install -y wget sudo && \
    apt-get install -y redis-server && \
    apt-get install -y default-jre && \
    apt-get install -y python3-pip && \
    npm install -g nodemon

# Upgrade pip and setuptools to avoid potential issues with newer packages
RUN python3 -m pip install --upgrade pip setuptools

# Install NVM and Node.js
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash && \
    . ~/.nvm/nvm.sh && nvm install 10.16.3

# Download and install Elasticsearch
RUN wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.2.2.deb && \
    sudo dpkg -i elasticsearch-5.2.2.deb

# Install Python dependencies with specific versions
RUN pip3 install pymongo==4.7.3 && \
    pip3 install 'elasticsearch===5.2.0' && \
    pip3 install bs4

# Copy the application code to the container
COPY . .

# Rebuild bcrypt module
RUN npm rebuild bcrypt --build-from-source

# Expose necessary ports
EXPOSE 5100
EXPOSE 9200
EXPOSE 6379

# Start services and the Node.js application
CMD service elasticsearch start && \
    sleep 20 && \
    service redis-server start && \
    until curl -s http://localhost:9200 > /dev/null; do \
        echo "Waiting for Elasticsearch to be ready..."; \
        sleep 5; \
    done && \
    curl -XDELETE http://localhost:9200/assetzilla && \
    python3 mongo_to_elastic-latest_real_estate.py && \
    npm start
