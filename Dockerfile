###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node ./package*.json ./yarn.lock ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN yarn ci

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node ./package*.json ./yarn.lock ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN yarn ci --only=production && yarn cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production
ENV DATABASE_URL pgsql://tolya:7VtyDPj60OLMpx6LbCONRZRZOxQ6Ulfs@dpg-cduacc9gp3jo9lmt17vg-a.oregon-postgres.render.com:5432/postgres_ql
ENV SUPERTOKENS_CONNECTION_URL https://d17b3dc16a5611ed907e7f200d41baee-eu-west-1.aws.supertokens.io:3567
ENV SUPERTOKENS_API_KEY BSzlq=-M02Fs=cGXkh-96H0zU938Yj
ENV APP_NAME quiz-lore
ENV API_DOMAIN http://127.0.0.1:3112
ENV WEBSITE_DOMAIN http://localhost:3001
ENV API_BASE_PATH /auth
ENV WEBSITE_BASE_PATH /auth
ENV BOT_TOKEN 5570162323:AAEks70lm2tNFUKaDDsYBIt7ePAjs5ZrxtA

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]

