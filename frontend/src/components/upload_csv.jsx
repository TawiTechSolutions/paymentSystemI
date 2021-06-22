import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";

function UploadUsers({ token }) {
  const [column_names, setColumn_names] = useState([]);
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [percentage, setPercentage] = useState(0);

  // process CSV data
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    //last function
    const columns = headers.map((c) => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumn_names(columns);
    axiosPostRequest(columns, list);
  };

  const axiosPostRequest = (column, users) => {
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
        `http://localhost:5000/users/uploadUsers`,
        {
          columns: column,
          users_data: users,
        },
        options
      )
      .then((res) => {
        setPercentage(100);
        setTimeout(() => {
          setPercentage(0);
        }, 1000);
        window.alert(res.data.message);
      });
  };

  // handle file upload
  const sendUploadedFile = () => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    console.log("columns", column_names);
    console.log("data in columns", data);
    console.log("percentage", percentage);
  }, [data, column_names, percentage]);

  return (
    <div>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
      <button onClick={sendUploadedFile}>Upload Users Data</button>
      {percentage > 0 ? (
        <LinearProgress variant="determinate" value={percentage} />
      ) : (
        ""
      )}
    </div>
  );
}

export default UploadUsers;
