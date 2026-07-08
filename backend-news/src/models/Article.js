const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true,
        trim:true
    },

    handle:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    excerpt:{
        type:String,
        default:""
    },

    content:{
        type:String,
        default:""
    },

    image:{
        url:{
            type:String,
            default:""
        },
        altText:{
            type:String,
            default:""
        }
    },

    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog",
        required:true
    },

    seoTitle:{
        type:String,
        default:""
    },

    seoDescription:{
        type:String,
        default:""
    },

    seoKeywords:{
        type:String,
        default:""
    },

    publishedAt:{
        type:Date,
        default:Date.now
    },

    status:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
}
);

articleSchema.index({
    title:1
});

articleSchema.index({
    handle:1
});

articleSchema.index({
    blog:1
});

module.exports=mongoose.model("Article",articleSchema);
