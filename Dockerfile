FROM node:12.13 as builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile
COPY src src
COPY .prettierrc tsconfig.json .eslintrc.js ./
RUN yarn run build

FROM node:12.13-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --production
COPY --from=builder /app/build /app/build

EXPOSE 3000

CMD ["node", "./build/src/index.js"]
