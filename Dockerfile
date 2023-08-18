# FROM node:18-alpine


# RUN apk update && apk upgrade && \
#     apk add --no-cache git py3-pip python3 gcc g++ make

# WORKDIR /app

# COPY . .

# RUN yarn
# RUN yarn install --frozen-lockfile
# RUN yarn install --frozen-lockfile

# RUN yarn --version
# RUN node --version

# EXPOSE 8080

# CMD ["yarn", "run", "dev", "--host"]

FROM nginx:1.17.8

RUN mkdir /app
COPY /dist /app
COPY nginx.conf /etc/nginx/nginx.conf