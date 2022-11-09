const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewCollection = client.db('CreativeCanvasDB').collection('reviews')
        //post api for services
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log(service);
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        })

        //get api for services
        app.get('/services', async (req, res) => {
            let size = Infinity;
            let sortOrder = { $natural: 1 }
            const query = {}
            if (req.query.limit) {
                size = +req.query.limit;
                // sortOrder = { $natural: -1 }
                sortOrder.$natural = -1;
            }
            const cursor = serviceCollection.find(query);
            if (req.query?.limit) {
            }
            const services = await cursor.sort(sortOrder).limit(size).toArray();
            res.send(services);
        })


        //get a specific service from the DB
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //post review api
        app.post('/reviews', async (req, res) => {
            const review = req.body
            review.created = new Date().toLocaleString();
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })


        //get api for reviews
        app.get('/reviews', async (req, res) => {
            let sortOrder = { $natural: 1 }
            let query = {}
            if (req.query.service) {
                query = { serviceId: req.query.service }
                sortOrder.$natural = -1;
            }
            //query by email
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.sort(sortOrder).toArray();
            res.send(reviews);
        })
        //delete a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(err => console.log(err));






app.listen(port, () => {
    console.log(`Creative Canvas server running on port: ${port}`);
})