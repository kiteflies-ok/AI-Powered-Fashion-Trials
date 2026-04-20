FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# In local development, we normally use npm run dev. 
# For Docker production, we would build.
RUN npm run build

CMD ["npm", "start"]
