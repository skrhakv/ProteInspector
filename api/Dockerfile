FROM ubuntu:latest

RUN apt update && apt install -y curl 
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
RUN apt install -y nodejs  && rm -rf /var/lib/apt/lists/*
RUN apt update && apt upgrade -y && apt install -y build-essential nlohmann-json3-dev libpq-dev wget unzip git bison flex && rm -rf /var/lib/apt/lists/*
RUN npm install -g node-gyp
RUN wget -O pqxx.zip https://github.com/jtv/libpqxx/archive/refs/tags/7.7.1.zip 
RUN unzip pqxx.zip && mv libpqxx-7.7.1 pqxx
WORKDIR /pqxx
RUN ./configure --enable-shared
RUN make && make install
WORKDIR /
RUN git clone https://github.com/hyrise/sql-parser.git
WORKDIR /sql-parser
RUN make && make install
WORKDIR /
ADD api api
ADD query-executor query-executor
WORKDIR /api
ENV LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH" 
RUN npm install && npm run build
ADD api/docker-config.json config.json
EXPOSE 3000
CMD ["npm", "run", "start"]
