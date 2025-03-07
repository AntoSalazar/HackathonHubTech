FROM node:18

WORKDIR /app

# Install build essentials needed for bcrypt
RUN apt-get update && apt-get install -y build-essential python3

# Copy package files
COPY package*.json ./

# Delete any existing node_modules just to be safe
RUN rm -rf node_modules

# Install dependencies and make sure we get a clean bcrypt build
RUN npm install --no-package-lock
RUN npm uninstall bcrypt
RUN npm install bcrypt --build-from-source

# Copy the rest of the application (after node_modules installation)
COPY . .

# Your app's default port
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]