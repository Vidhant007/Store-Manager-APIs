//import the schema model.
const Product = require('../models/product');

const getAllProductsStatic = async (req,res)=>{
    const products = await Product.find({price:{$gt:30 , $lt : 50}})
        .sort('price').select('name price');
    res.status(200).json({products,nbHits:products.length});
    //nbHits : returns the number of products
}


const getAllProducts = async (req,res)=>{
    const {featured,company,name,sort,fields,numericFilters} = req.query;

    const queryObject = {}; //empty query object

    if(featured){
        queryObject.featured = featured === 'true'? true : false
    }
    if(company){
        queryObject.company = company;
    }
    if(name){
        queryObject.name = {$regex: name,$options: 'i'};
    }

    //numericFilters
    if(numericFilters){
        //replacing mongoose variables with user friendly ones
        const operatorMap = {
            '>':'$gt',
            '>=': '$gte',
            '=' :'$eq',
            '<' : '$lt',
            '<=' : '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(regEx,
            (match)=>`-${operatorMap[match]}-`)

        const options = ['price','rating']
        filters = filters.split(',').forEach((item)=>{
            const [field,operator,value] = item.split('-');
            if(options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
        })
    }


    console.log(queryObject);
    let result = Product.find(queryObject)
    //sort
    if(sort){
        const sortList = sort.split(',').join((' '));
        result = result.sort(sortList);
    }else {
        result = result.sort('createdAt');
    }
    //selecting specific feilds to output
    if(fields){
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList);
    }

    //Same functionality as Amazon to display items on a page.
    //setting limit and page number from req.query or passing a default value
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    // this gives the actual products that are displayed in a page
    const skip = (page-1)*limit;

    result = result.skip(skip).limit(limit);

    const products = await result;
    res.status(200).json({products,nbHits:products.length})
}

module.exports = {getAllProducts,getAllProductsStatic};
