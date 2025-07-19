FROM node:18

# Working directory is /app
WORKDIR /workdir

# Copy over the dependencies files
COPY package.json package-lock.json /workdir/

# Copy the rest of the project files into the container
# Note that this is copied after the two previous lines because it's a different layer.
# This means that the above will only re-run if package.json or package-lock.json change, instead of every time our normal files change.
COPY app /workdir/app
COPY components /workdir/components
COPY lib /workdir/lib
COPY public /workdir/public
COPY contexts /workdir/contexts
COPY components.json next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json .env /workdir/

# Run NPM install
RUN npm install

# Specify port we're using
EXPOSE 3000

# Run
CMD ["npm", "run", "dev"]