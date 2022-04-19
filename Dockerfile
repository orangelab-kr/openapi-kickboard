FROM node:16-alpine
ARG GITHUB_TOKEN

RUN echo ${GITHUB_TOKEN}

COPY . /app
WORKDIR /app
RUN apk --no-cache add tzdata && \
  cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
  echo "Asia/Seoul" > /etc/timezone && \
  npm config set 'https://npm.pkg.github.com/:_authToken' ${GITHUB_TOKEN} && \
  yarn --prod=false && yarn build && \
  yarn --prod=true && rm -rf src ~/.npmrc

CMD yarn start