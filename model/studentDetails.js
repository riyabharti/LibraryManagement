var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var studentSchema=new Schema(
    {
        'regid':
        {
            type:String,
            required:true,
            unique: true,
            index: true
        },
        'libid':
        {
            type:String,
            required:true,
            unique:true,
            index:true
        },
        'name':
        {
            type:String,
            required:true
        },
        'branch':
        {
            type:String,
            required:true
        },
        'password':
        {
            type:String,
            required:true
        },
        'profilePath':
        {
            type:String,
            default:""
        }
    }
)
module.exports=mongoose.model('Student',studentSchema)