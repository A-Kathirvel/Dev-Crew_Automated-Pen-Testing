import React, { useState,useEffect } from 'react';
import axios from 'axios'
import './Request1.css'
const App = () => {
  const [url_name, setUrlname] = useState('');
  const [urls, setUrls] = useState([]);
  const [url_id, setCounter] = useState(1);
  const [urldetails, setUrlDetails] = useState([]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await axios.get('http://localhost:3001/geturl'); // Assuming your server is running on the same host
        // console.log(response.data);
        setUrlDetails(response.data);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      }
    };

    fetchUrls();
  }, []);

  const handleInputChange = (e) => {
    setUrlname(e.target.value);
  };

  const addUrl = () => {
    if (url_name.trim() !== '') {
      setUrls([...urls, { url_id,url_name, url_status: 'Scheduled',file_path:"" }]);
      setUrlname('');
      setCounter(url_id+1);
    }
  };
  const handleSubmit=(e)=>{
    e.preventDefault()
    axios.post('http://localhost:3001/add',{urls})
    .then(result=>{console.log(result)
     navigate('/login')
    })
    .catch(err=>console.log(err))
}
  
const downloadFile = async () => {
  try {
    const response = await axios.get('http://localhost:3001/download', {
      responseType: 'blob', // Important to receive binary data
    });

    // Create a blob object from the response
    const blob = new Blob([response.data], { type: 'text/plain' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'downloaded_file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};
  return (
    <div>
        <form action="" onSubmit={handleSubmit}>  
        <h5>Enter the URL</h5>
        <input
        type="text"
        value={url_name}
        onChange={handleInputChange}
        placeholder="Enter URL"
      /><br/>
      <button onClick={addUrl}>Submit</button>
      </form>

      <br/>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {urldetails.map(url => (
            <tr key={url.url_id}>
              <td>{url.url_id}</td>
              <td>{url.url_name}</td>
              <td>{url.url_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br /><br /><br />
      <div>
      <button onClick={downloadFile}>Download File</button>
    </div>
    </div>
  );
};

export default App;
