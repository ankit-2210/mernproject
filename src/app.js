require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcrypt");

require("./db/conn");
const Register = require("./models/register");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);
// app.use(express.static("img"));


app.get("/", (req, res) => {
    res.render("index");
})

app.get("/register", (req, res) => {
    res.render("register");
})
app.get("/login", (req, res) => {
    res.render("login");
})

// Create a new user in our database
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })

            console.log("The success part" + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            // console.log("The token part" + token);

            const registered = await registerEmployee.save();
            res.status(201).render("index");
        }
        else {
            res.send("Password are not matching");
        }
    }
    catch (error) {
        res.status(400).send(error);
        console.log("The error part page");
    }
})

// login check
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("The token part" + token);

        if (isMatch) {
            res.status(201).render("index");
        }
        else {
            res.send("Invalid Password details");
        }
    }
    catch (error) {
        res.status(400).send("Invalid login details");
    }
})


app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
})