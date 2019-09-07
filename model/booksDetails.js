var mongoose=require('mongoose')
var Schema=mongoose.Schema
var BookSchema=new Schema(
    {
        'name':
        {
            type: String,
            required:true
        },
        'author':
        {
            type: String,
            required:true
        },
        'total':
        {
            type:Number,
            default: 0
        },
        'issued':
        {
            type:Number,
            default:0
        }
    }
)
module.exports=mongoose.model('Book',BookSchema)