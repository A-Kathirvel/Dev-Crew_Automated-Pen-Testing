const express=require("express")
const bodyParser = require('body-parser');
const mongoose=require("mongoose")
const cors=require("cors")
const EmployeeModel=require('./models/Employee')
const UrlDetails=require('./models/UrlDetails')
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const app=express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());

//DB Connection
mongoose.connect("mongodb://localhost:27017/Userdb")

app.post('/register',(req,res)=>{
  EmployeeModel.create(req.body)
  .then(employees=>res.json(employees))
  .catch(err=>res.json(err))
})

app.post('/login',(req,res)=>{
    const {name}=req.body;
    // console.log(name)
    EmployeeModel.findOne({name:name})
    .then(user=>{
        // console.log(user)
        if(user){
            if(user.name===name){
                res.json("Success")
            }else{
                res.json("Incorrect")
            }
        }else{
            res.json("No record Found")
        }
    })
})

app.post('/add',(req,res)=>{
    UrlDetails.create(req.body.urls)
    .then(urls=>res.json(urls))
    .catch(err=>res.json(err))
})

// nmap and zap
app.get('/geturl', async (req, res) => {
  try {
    const urls = await UrlDetails.find();
    console.log(urls);

    for (const url of urls) {
      const domainToScan = url.url_name;
      await processUrlWithNmap(domainToScan);
      await processUrlWithZap(domainToScan);

      UrlDetails.updateOne(
        { url_name: domainToScan },
        { $set: { url_status: "In Progress" } }    //Status Update
      );
    }
    res.json(urls)
  } catch (error) {
    console.error('Error processing URLs:', error);
    res.status(500).send('Error processing URLs');
  }
});

let isExecutionCompleted = false;
//NMAP
async function processUrlWithNmap(domainToScan) {
  if (isExecutionCompleted) {
    console.log('Execution already completed, skipping further execution.');
    return;
  }
  return new Promise((resolve, reject) => {
    const urlWithoutProtocol = domainToScan.replace(/(^\w+:|^)\/\//, ''); // Remove protocol (http:// or https://)
    const domainOnly = urlWithoutProtocol.split('/')[0]; // Get only the domain (e.g., www.google.com)

    const outputFilePath = `scan_results_${domainOnly.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    const nmapCommand = `"C:\\Program Files (x86)\\Nmap\\nmap.exe" -p 80,443,21,25 ${domainOnly} > "${outputFilePath}"`;

    exec(nmapCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Nmap for ${domainToScan}: ${error.message}`);
        reject(error.message);
      } else if (stderr) {
        console.error(`Nmap stderr for ${domainToScan}: ${stderr}`);

        UrlDetails.updateOne(
          { url_name: domainToScan },
          { $set: { url_status: "Test Error" } }  //Status Update
        );
        reject(stderr);
      } else {
        console.log(`Scan results for ${domainToScan}:\n${stdout}`);

        UrlDetails.updateOne(
          { url_name: domainToScan },
          { $set: { url_status: "Completed" } }   //Status Update
        );
        isExecutionCompleted = true;
        resolve(stdout);
      }
    });
  });
}

//ZAP
async function processUrlWithZap(targetUrl) {
  try {
    const zapApiKey = 'ogjg47h47i6ecvmfiiasg4jhp9';
    const zapApiUrl = 'http://localhost:8080';
    const spiderResponse = await axios.get(`${zapApiUrl}/JSON/spider/action/scan/?url=${targetUrl}&apikey=${zapApiKey}`);
    console.log('Spidering started:', spiderResponse.data);

    const scanResponse = await axios.get(`${zapApiUrl}/JSON/ascan/action/scan/?url=${targetUrl}&apikey=${zapApiKey}`);
    console.log('Active scanning started:', scanResponse.data);

    const scanProgressResponse = await axios.get(`${zapApiUrl}/JSON/ascan/view/scanProgress/?scanId=${scanResponse.data.scan}&apikey=${zapApiKey}`);
    const scanStatusResponse = await axios.get(`${zapApiUrl}/JSON/ascan/view/status/?scanId=${scanResponse.data.scan}&apikey=${zapApiKey}`);

    fs.writeFileSync('zap_scan_results.txt', JSON.stringify({ progress: scanProgressResponse.data, status: scanStatusResponse.data }, null, 2));
    console.log('Detailed scan results saved to zap_detailed_scan_results.txt.');

    UrlDetails.updateOne(
      { url_name: targetUrl },
      { $set: { url_status: "Completed" } }  //Status Update
    );
  } catch (error) {
    UrlDetails.updateOne(
      { url_name: targetUrl },
      { $set: { url_status: "Test Error" } }  //Status Update
    );
    console.error('Error processing URL with ZAP Proxy:', error);
  }
}

// Paths to the two input files
const inputFile1 = 'scan_results_www_google_com.txt';
const inputFile2 = 'zap_scan_results.txt';

// Path to the output file
const outputFile = 'combined.txt';

// Function to read the content of inputFile1
const readInputFile1 = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFile1, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// Function to read the content of inputFile2
const readInputFile2 = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFile2, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// Function to write content to the outputFile
const writeOutputFile = (content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('Files written successfully.');
      }
    });
  });
};

// Reading and writing files
Promise.all([readInputFile1(), readInputFile2()])
  .then(([file1Content, file2Content]) => {
    const combinedContent = `${file1Content}\n\n\n${file2Content}`;
    return writeOutputFile(combinedContent);
  })
  .then((message) => {
    console.log(message);
  })
  .catch((err) => {
    console.error('Error:', err);
  });

  app.get('/download', (req, res) => {
    const filePath = outputFile; 
    const fileName = 'downloaded_file.txt';
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Set headers to trigger file download
      res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-type', 'text/plain');
  
      // Create read stream from file and pipe it to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  });


app.listen(3001,()=>{
    console.log("Server is running")
})

