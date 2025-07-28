FROM node:lts-buster

# Cloner ton repo GitHub personnalisé
RUN git clone https://github.com/kasmbafumoja/TERMUX-MD /root/termux-md

# Définir le répertoire de travail
WORKDIR /root/termux-md

# Installer les dépendances
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1

# Copier les fichiers dans le conteneur
COPY . .

# Exposer le port du bot
EXPOSE 9090

# Commande de démarrage
CMD ["npm", "start"]
