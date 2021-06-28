import React, { useEffect, useState } from "react";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";
import * as XLSX from "xlsx";

function UploadReciptData({ token }) {
  const [file, setFile] = useState(null);
  const [percentage, setPercentage] = useState(0);

  const parseExcel = (fileData) => {
    const workbook = XLSX.read(fileData, {
      type: "binary",
      cellDates: true,
      cellNF: false,
      cellText: false,
    });
    let data = {};
    workbook.SheetNames.forEach(function (sheetName) {
      const XL_row_object = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName]
      );
      data[sheetName] = XL_row_object;
    });
    return data;
  };

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
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* get binary string */
      const bstr = evt.target.result;

      console.log(parseExcel(bstr));
      axiosPostRequest(parseExcel(file));
    };
    reader.readAsBinaryString(file);
    //
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
