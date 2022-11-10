const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

//token verification 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

//database CRUD functions
async function run() {
    try {
        const serviceCollection = client.db('CreativeCanvasDB').collection('services')
        const reviewCollection = client.db('CreativeCanvasDB').collection('reviews')

        //token for user
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const secret = process.env.ACCESS_TOKEN_SECRET
            const token = jwt.sign(user, secret, { expiresIn: '10hr' })
            res.send({ token })
        })

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
        //get api for reviews at services
        app.get('/reviews', async (req, res) => {
            let sortOrder = { created: 1 }
            let query = {}
            //query by serviceId
            if (req.query.service) {
                query = { serviceId: req.query.service }
                sortOrder = { created: -1 };
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.sort(sortOrder).toArray();
            res.send(reviews);
        })
        //get api for reviews at my reviews
        app.get('/userReviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded);
            let query = {}
            //query by email
            if (req.query.email) {
                if (decoded.email !== req.query.email) {
                    res.status(401).send({ message: 'Unauthorized access' });
                }
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        //delete a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //get a specific review from the DB
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })
        //update a review
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const updated = req.body;
            const filter = { _id: ObjectId(id) }
            const doc = {
                $set: {
                    rating: updated.rating,
                    text: updated.text
                }
            }
            const result = await reviewCollection.updateOne(filter, doc);
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