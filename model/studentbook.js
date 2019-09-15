var mongoose=require('mongoose')
var Schema=mongoose.Schema
var studBook=new Schema(
    {
        'isbn':
        {
            type:Number,
            required:true,
        },
        'libid':
        {
            type:String,
            required:true,
        },
        'issueDate':
        {
            type:Date,
            required:true
        }
    }
)
module.exports=mongoose.model('StuBook',studBook)