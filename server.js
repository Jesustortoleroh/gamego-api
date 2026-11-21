require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const customerController = require("./controllers/customer")
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.use(require("./routes/customer"))

app.get('/', (req, res) => {
  res.status(200).json({ message: 'GameGo API is running!' });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});