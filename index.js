const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth.js')

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    keys: ['lkslaseivdoso']
}));
app.use(authRouter);


app.listen(3000 || process.env.PORT, process.env.IP, (req, res) => {
    console.log("Listening");
});