const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middle wares
app.use(cors());
app.use(express.json());

//server root directory
app.get('/', (req, res) => {
    res.send('Welcome to Creative Canvas express server');
})






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cwjhhvi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//database CRUD functions
async function run() {
    try {
        const serviceCollection = client.db('CreativeCanvasDB').collection('services')

        app.get('/services', async (req, res) => {
            let size = Infinity;
            const query = {}
            if (req.query) {
                size = +req.query.limit;
            }
            const cursor = serviceCollection.find(query);
            if (req.query?.limit) {

            }
            const services = await cursor.limit(size).toArray();
            res.send(services);
        })

    }
    finally {

    }
}
run().catch(err => console.log(err));






app.listen(port, () => {
    console.log(`Creative Canvas server running on port: ${port}`);
})