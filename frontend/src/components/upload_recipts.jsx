import React, { useEffect, useState } from "react";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";

function UploadReciptData({ token }) {
  const [file, setFile] = useState(null);
  const [percentage, setPercentage] = useState(0);

  const axiosPostRequest = (receipt_data) => {
    const options = {
      headers: {
        token: token,
      },
      onUploadProgress: (progessEvent) => {
        const { loaded, total } = progessEvent;
        let precent = Math.floor((loaded * 100) / total);
        if (precent < 100) {
          setPercentage(precent);
        }
      },
    };
    axios
      .post(
        `http://localhost:5000/receipts/uploadReceiptData`,

        receipt_data,
        options
      )
      .then((res) => {
        setPercentage(100);
        setTimeout(() => {
          setPercentage(0);
        }, 1000);
        console.log(res);
        window.alert(res.data.message);
      })
      .catch((err) => console.log(err));
  };

  // handle file upload
  const sendUploadedFile = () => {
    const data = new FormData();
    data.append("file", file);
    axiosPostRequest(data);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    console.log("file", file);
    console.log("percentage", percentage);
  }, [file, percentage]);

  return (
    <div>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
      <button onClick={sendUploadedFile}>Upload Recipts Data</button>
      {percentage > 0 ? (
        <LinearProgress variant="determinate" value={percentage} />
      ) : (
        ""
      )}
    </div>
  );
}

export default UploadReciptData;
