# Cahier des charges

## 1. Présentation du projet

Le secteur de Dounsy, quartier Kassognah, souhaite mettre en place une plateforme numérique de recensement afin de centraliser les informations sur les ménages et les habitants, de faciliter la collecte des données et d'améliorer leur gestion.

## 2. Objectifs

- Numériser le processus de recensement.
- Réduire les erreurs liées aux formulaires papier.
- Disposer d'une base de données centralisée.
- Permettre la consultation rapide des informations.
- Produire des statistiques fiables.
- Faciliter l'exportation des données.

## 3. Utilisateurs

### Administrateur

- Se connecter à la plateforme.
- Créer les comptes des agents recenseurs.
- Modifier, désactiver ou supprimer les comptes des agents.
- Gérer les quartiers, secteurs ou zones de recensement.
- Consulter l'ensemble des données.
- Modifier ou supprimer toute fiche de recensement.
- Consulter les statistiques.
- Exporter les données en Excel et PDF.

### Agent recenseur

- Se connecter avec un compte créé par l'administrateur.
- Ajouter de nouveaux ménages.
- Ajouter les membres d'un ménage.
- Modifier les fiches autorisées.
- Rechercher un ménage ou une personne.
- Consulter les données selon les droits accordés.

## 4. Fonctionnalités principales

### Authentification

- Connexion sécurisée.
- Déconnexion.
- Réinitialisation du mot de passe (optionnelle).
- Gestion des rôles (Administrateur et Agent).

### Gestion des ménages

- Création d'un ménage.
- Modification.
- Suppression (administrateur).
- Consultation.

#### Informations du ménage

- Numéro de ménage.
- Chef de ménage.
- Adresse.
- Quartier.
- Secteur.
- Téléphone.
- Nombre de personnes.
- Date du recensement.
- Agent recenseur.

### Gestion des personnes

Pour chaque personne :

- Nom.
- Prénom.
- Sexe.
- Date de naissance ou âge.
- Profession.
- Situation matrimoniale.
- Niveau d'instruction.
- Numéro de téléphone (si disponible).
- Lien avec le chef de ménage.

### Tableau de bord

- Nombre total de ménages.
- Nombre total de personnes.
- Nombre d'agents actifs.
- Répartition par quartier.
- Répartition par secteur.
- Statistiques de recensement.

### Recherche

- Par nom.
- Par prénom.
- Par ménage.
- Par quartier.
- Par secteur.
- Par téléphone.

### Export

- Export Excel.
- Export PDF.

## 5. Technologies

- Frontend : React.
- Backend : Node.js, Express.js.
- Base de données : MongoDB Atlas (Cloud).

## 6. Sécurité

- Comptes créés uniquement par l'administrateur.
- Mots de passe chiffrés avec bcrypt.
- Authentification par JWT.
- Protection des routes selon les rôles.
- Validation des données côté serveur.
- Journalisation des principales actions.
- Sauvegarde régulière de la base de données.

## 7. Base de données (collections)

### users

- Nom.
- Prénom.
- Email.
- Téléphone.
- Mot de passe.
- Rôle.
- Statut.
- Date de création.

### households

- Identifiant.
- Chef de ménage.
- Adresse.
- Quartier.
- Secteur.
- Téléphone.
- Agent recenseur.
- Date.

### people

- Nom.
- Prénom.
- Sexe.
- Date de naissance.
- Profession.
- Situation matrimoniale.
- Niveau d'instruction.
- Téléphone.
- Ménage associé.

### sectors

- Nom du secteur.
- Responsable.

### districts

- Nom du quartier.

### logs

- Utilisateur.
- Action.
- Date.
- Heure.

## 8. Interface utilisateur

- Tableau de bord : statistiques générales, activité récente.
- Gestion des agents : liste, création, modification, désactivation.
- Gestion des ménages : liste, ajout, modification, suppression.
- Gestion des personnes : ajout, modification, consultation.
- Rapports : export Excel, export PDF.

## 9. Compatibilité

La plateforme devra être responsive afin de fonctionner correctement sur :

- Ordinateur.
- Tablette.
- Smartphone.

## 10. Critères de réussite

- Interface simple et intuitive.
- Temps de réponse rapide.
- Sécurité des données.
- Disponibilité permanente.
- Fiabilité des statistiques.
- Facilité d'utilisation pour les agents recenseurs.

## 11. Évolutions futures

- Géolocalisation des ménages.
- Carte interactive.
- Notifications.
- Fonctionnement hors ligne avec synchronisation.
- Application mobile dédiée.
- Tableau de bord avancé avec graphiques.
