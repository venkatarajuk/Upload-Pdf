import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [pdfEntries, setPdfEntries] = useState([]);

  const { name, email, phoneNumber } = formData;
  const fileInputRef = useRef(null);

  const fetchPdfEntries = async () => {
    try {
      const response = await axios.get("http://localhost:8002/pdf-files");
      setPdfEntries(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching PDF entries:", error);
    }
  };

  console.log(pdfEntries, "pdfEntries");
  useEffect(() => {
    // Fetch PDF entries when component mounts
    fetchPdfEntries();
  }, []);
  const handleChange = (e) => {
    if (e.target.type === "file") {
      const selectedFiles = e.target.files;
      console.log("Selected files:", selectedFiles); // Debugging
      const newFiles = Array.from(selectedFiles);
      const allFiles = [...files, ...newFiles];
      console.log("All files:", allFiles); // Debugging
      setFiles(allFiles);
      const names = allFiles.map((file) => file.name);
      console.log("File names:", names); // Debugging
      setFileNames(names);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    const updatedNames = updatedFiles.map((file) => file.name);
    setFileNames(updatedNames);
  };

  // Convert pdfUrl to array if it's not already an array
  // const pdfUrlsArray = Array.isArray(pdfEntries[0].pdfUrl)
  //   ? pdfEntries[0].pdfUrl
  //   : [pdfEntries[0].pdfUrl];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        formDataToSend.append(key, formData[key]);
      }
    }
    for (let i = 0; i < files.length; i++) {
      formDataToSend.append("files", files[i]);
    }

    try {
      const response = await axios.post(
        "http://localhost:8002/upload-files",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      // Update pdfEntries state with the newly uploaded PDF files
      const uploadedFiles = response.data.uploadedFiles;
      const urls = uploadedFiles.map((file) => file.url);
      setPdfEntries([...pdfEntries, urls]);
      // Refetch PDF entries after successful upload
      fetchPdfEntries();
    } catch (error) {
      console.error("Error uploading files:", error);
      // Handle error appropriately
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h4>Upload PDFs in React</h4>
        <span onClick={handleClick}>Upload file</span>
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleChange}
          ref={fileInputRef}
          // style={{ display: 'none' }} // Temporarily remove this to make the input visible
        />
        <p>Selected files:</p>
        <ul>
          {fileNames.map((name, index) => (
            <li key={index}>
              {name}
              <button type="button" onClick={() => removeFile(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <br />
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={handleChange}
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
        />
        <br />
        <input
          type="tel"
          placeholder="Phone Number"
          name="phoneNumber"
          value={phoneNumber}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Upload</button>
      </form>

      {/* Display PDF entries */}
      <div>
        <h2>PDF Entries</h2>
    
        <ul>
          {pdfEntries.map((pdfEntry, index) => (
            
            <li key={index}>
                <p>Name: {pdfEntry.name}</p>
              <p>Email: {pdfEntry.email}</p>
              <p>Phone Number: {pdfEntry.phoneNumber}</p>
              <ul>
                {(() => {
                  try {
                    const urls =(pdfEntry.pdfUrl);
              
                    if (Array.isArray(urls)) {
                      return urls.map((url, idx) => (
                        <li key={idx} style={{width:"500px"}}>
                          <iframe
                            src={url}
                            title={`PDF-${index}-${idx}`}
                            width="100%"
                            height="200px"
                          ></iframe>
                        </li>
                      ));
                    } else {
                      return <li>Error: Invalid PDF URL data</li>;
                    }
                  } catch (error) {
                    console.error("Error parsing PDF URL:", error);
                    return <li>Error: Unable to parse PDF URL data</li>;
                  }
                })()}
              </ul>
           
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
