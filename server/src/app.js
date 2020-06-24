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

app.listen(port, () => {
    console.log(`Server is up on port ${port}.`);
})