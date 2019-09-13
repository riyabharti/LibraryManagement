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
        'isbn':
        {
            type:Number,
            required:true,
            unique:true,
            index:true
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
        },
        'branch':
        {
            type:Array,
            default: []
        }
    }
)
module.exports=mongoose.model('Book',BookSchema)