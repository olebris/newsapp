const { MongoClient } = require('mongodb');
const axios = require('axios');

const mongoURL = 'mongodb://localhost:27017';
const dbName = 'mydb';
const collectionName = 'articles';

async function connectToDatabase() {
  try {
    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connexion à la base de données établie');
    return client.db(dbName);
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données', error);
    throw error;
  }
}

async function fetchAndInsertData() {
  try {
    const db = await connectToDatabase();

    const response = await axios.get('https://newsapi.org/v2/top-headlines?country=fr&apiKey=21bcf87a3c5c45579ab75fb4452829f8');
    const data = response.data;

    const articles = data.articles;

    for (const article of articles) {
      const existingArticle = await db.collection(collectionName).findOne({ url: article.url });
      if (!existingArticle) {
        await db.collection(collectionName).insertOne(article);
      }
    }

    console.log('Insertion des données terminée');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données', error);
    throw error;
  }
}

fetchAndInsertData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Une erreur s\'est produite', error);
    process.exit(1);
  });
