var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var studentSchema=new Schema(
    {
        'regid':
        {
            type:String,
            required:true
        },
        'Collegeid':
        {
            type:String,
            required:true
        },
        'password':
        {
            type:String,
            required:true
        },
        'book':
        {
            type:Array,
            default: []
        }
    }
)
module.exports=mongoose.model('Student',studentSchema)