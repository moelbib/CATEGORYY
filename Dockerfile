# Utilise une image officielle de Node.js
FROM node:16

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier uniquement les fichiers package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Exposer le port utilisé par le backend
EXPOSE 8080

# Commande pour démarrer le serveur
CMD ["npm", "start"]
