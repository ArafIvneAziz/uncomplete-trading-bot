const { MongoClient } = require('mongodb');

const uri = 'your-mongodb-uri';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect().then(() => {
  const database = client.db('my-trading-bot');
  const apiKeysCollection = database.collection('api-keys');

  // Save API keys
  apiKeysCollection.insertOne({
    exchange: 'binance',
    apiKey: 'your-api-key',
    secretKey: 'your-secret-key',
  }).then(() => {
    console.log('API keys saved to MongoDB.');
    client.close();
  }).catch((error) => {
    console.error('Error saving API keys:', error);
    client.close();
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
