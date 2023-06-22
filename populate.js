require('dotenv').config();

const connectDB = require('./db/connect');
const  Product = require('./models/product');

//json file containing arrray of  product objects
const jsonProducts = require('./products.json');

const start = async() =>{
    try {
        await connectDB(process.env.MONGO_URI);
        //delete all products
        await Product.deleteMany();
        //populating database with all objects/collection in jsonproducts
        await  Product.create(jsonProducts);
        console.log('Sucess !!!')
        //exits the process with sucess (for error it's 1)
        process.exit(0);
    }catch (error){
        console.log(error);
    }
}

start();