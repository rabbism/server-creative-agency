const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.elm9b.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Mongo Data Base Working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("services");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const reviewCollection = client.db("creativeAgency").collection("reviews");
    const adminCollection = client.db("creativeAgency").collection("admins");

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    // app.post('/addReview', (req, res) => {
    //     const review = req.body;
    //     reviewCollection.insertMany(review)
    //     .then(result => {
    //         res.send(result.insertedCount)
    //     })
    // })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })



    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    });

    app.get('/admins', (req, res) => {
        adminCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addOrder', (req, res) => {
        
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const price = req.body.price;
        const details = req.body.details;
        const design = req.body.design;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, image, price, details, design })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/orderList', (req, res) => {
        orderCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents)
        })
    })


    app.get('/orderByEmail', (req, res) => {
        //   console.log(req.query.email)
        // console.log(req.headers.authorization)
        const bearer = req.headers.authorization;
        
        if(bearer && bearer.startsWith('Bearer ')){
          const idToken = bearer.split(' ')[1];
          console.log({idToken})
          admin.auth().verifyIdToken(idToken)
          .then(function(decodedToken) {
            // let uid = decodedToken.uid;
            // console.log({uid})
            // ...
            const emailId = decodedToken.email;
            const emailQuery = req.query.email;
    
            console.log(emailId, emailQuery);
    
            if(emailId === emailQuery){
               orderCollection.find({email: emailQuery})
              .toArray( (err, documents) => {
                  res.status(200).send(documents);
              })
            }
            else{
              res.status(401).send('Un-authorized access request');
            }
          }).catch(function(error) {
            // Handle error
            res.status(401).send('Un-authorized access request');
          });
        }
        else{
          res.status(401).send('Un-authorized access request');
        }
          // booking.find({email: req.query.email})
          // .toArray( (err, documents) => {
          //     res.send(documents);
          // })
      })
});

app.listen(process.env.PORT || port)