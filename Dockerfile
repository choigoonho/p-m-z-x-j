FROM node:0.12.0

MAINTAINER Cai Guanhao (caiguanhao@gmail.com)

RUN python2.7 -c 'from urllib import urlopen; from json import loads; \
    print(loads(urlopen("http://ip-api.com/json").read().decode("utf-8" \
    ).strip())["countryCode"])' > /tmp/country

RUN test "$(cat /tmp/country)" = "CN" && { \
    echo Asia/Hong_Kong > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata; \
    (echo "deb http://mirrors.aliyun.com/debian jessie main" && \
    echo "deb http://mirrors.aliyun.com/debian jessie-updates main" && \
    echo "deb http://mirrors.aliyun.com/debian-security/ jessie/updates main") \
    > /etc/apt/sources.list; \
    (echo "registry = https://registry.npm.taobao.org" && \
    echo "disturl = https://npm.taobao.org/dist") \
    > ~/.npmrc; } || true

WORKDIR /pmzxj

RUN npm --loglevel http install -g gulp

# use global gulp so we won't install it again
RUN npm link gulp

ADD package.json /pmzxj/package.json

RUN npm --loglevel http install

CMD gulp build

ADD . /pmzxj
