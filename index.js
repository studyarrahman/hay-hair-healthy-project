const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

routes(app);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
