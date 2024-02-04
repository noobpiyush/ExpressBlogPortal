const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secret = "YOUR SECRET KEY ";
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMidddleWare = multer({ dest: 'uploads/' });
const fs = require("fs");
const Post = require("./models/Post");
const path = require("path");
const PORT = 4000

app.use(cors({
    credentials: true,
    origin: "*",
}))
app.use(express.json());
const _dirname = path.dirname("");
const buildpath = path.join(_dirname,"../client/dist/index.html");
app.use(express.static(buildpath))
app.use(cookieParser());
app.use("/uploads",express.static(__dirname+ "/uploads"));

mongoose.connect("mongodb+srv://piyush:Cuting%40123@cluster0.fsovu8y.mongodb.net/BlogApp")
    .then(function () {
        console.log("db connected");
    })
    .catch(err => console.log(err));

app.post("/register", async function (req, res) {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        });
        res.json(userDoc);

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }

})

app.post("/login", async function (req, res) {
    const { username, password } = req.body;

    const userDoc = await User.findOne({ username });

    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);

        if (passOk) {
            jwt.sign({
                username,
                id: userDoc._id
            }, secret, {},
                function (err, token) {
                    if (err) {
                        throw err;
                    }
                    res.cookie("token", token).json({
                        id: userDoc._id,
                        username
                    });
                }
            )
        }
        else {
            res.status(400).json("wrong credentials");
        }
    }
    else {
        res.status(400).json("username not found");
    }
});

app.get("/profile", function (req, res) {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json("No token provided");
    }
    jwt.verify(token, secret, {}, function (err, info) {
       if(err) throw err;
        res.json(info);
    });
});


app.post("/logout", function (req, res) {
    res.cookie("token", "").json("ok");
})

app.post("/post", uploadMidddleWare.single("file"), async function (req, res) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {},async function (err, info) {
        if (err) {
            throw err;
        }

        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });

        res.json(postDoc);
    });

});



app.put("/post",uploadMidddleWare.single("file"),async function(req,res){
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {},async function (err, info) {
        if (err) {
            throw err;
        }
        const {id,title,summary,content,cover} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
           return res.status(400).json("your are not the author");
            
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover:newPath?newPath:postDoc.cover,
        })
        res.json(postDoc);
    });

})



app.get("/post", async function (req, res) {
  res.json(
    await Post.find()
        .populate("author", ['username'])
        .sort({createdAt:-1})
        .limit(20)
  );
});

app.get("/post/:id", async (req,res)=>{
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate("author",["username"]);

    if (postDoc) {
        res.json(postDoc);
    }
    else{
        res.json({
            msg:"sorry",
        });
    }
})



app.listen(PORT);
