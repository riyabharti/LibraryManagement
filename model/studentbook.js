var mongoose=require('mongoose')
var Schema=mongoose.Schema
var studBook=new Schema(
    {
        'isbn':
        {
            type:Number,
            required:true,
            unique:true,
            index:true
        },
        'libid':
        {
            type:String,
            required:true,
            unique:true,
            index:true
        },
        'branch':
        {
            type:String,
            required:true
        },
    }
)
module.exports=mongoose.model('StuBook',studBook)