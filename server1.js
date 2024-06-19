const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Project = require('./models/project.model'); // Adjust based on your project structure
const app = express();
const PORT = process.env.PORT || 5100;

// Set up mongoose connection
mongoose.connect('mongodb+srv://realestate:realestate@cluster0.mmmbecv.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Set the view engine to EJS (assuming you use EJS for rendering)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname)); // Set views directory to root

// Route to render the PDF viewer
app.get('/pdf-viewer', async (req, res) => {
  try {
    // Fetch any project from MongoDB
    const project = await Project.findOne({ name: "Pareena Coban Residences" });

    if (!project) {
      return res.status(404).send('No project found');
    }

    // Assuming floor_plan contains the array of PDF file names (e.g., ['a.pdf', 'b.pdf'])
    const floorPlans = project.floor_plan;
    console.log(floorPlans);
    // Render the PDF viewer page with URLs to render each PDF file
    res.render('pdfviewer1', { floorPlans }); // Render pdfviewer1.ejs from root directory
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to serve the PDF file directly
app.get('/pdf', (req, res) => {
  const fileName = req.query.fileName;
  const filePath = path.join(__dirname, fileName); // Assuming PDF files are in the root directory accessible by Express

  if (!fileName || !fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Set the content type header to application/pdf
  res.setHeader('Content-Type', 'application/pdf');

  // Send the PDF file
  fs.createReadStream(filePath).pipe(res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
