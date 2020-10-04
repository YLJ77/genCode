const {debugLog} = require('./util/appFunc');
global.debugLog = debugLog;
const express = require('express');
const cors = require('cors');
const pageRouter = require('./routers/page');
const userRouter = require('./routers/user');
require('./db/mongoose');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(pageRouter);
app.use(userRouter);
app.use(express.static('public'))


app.listen(port, () => {
    debugLog({info:`Server is up on port ${port}.`, color:'green'});
})