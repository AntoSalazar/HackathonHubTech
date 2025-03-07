FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild bcrypt specifically
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application
COPY . .

# Your app's default port
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]