import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import CustomTable from "./Custom-Table";

function UploadUsers({ token }) {
  const [column_names, setColumn_names] = useState([]);
  const [data, setData] = useState([]);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileCorrect, setCorrect] = useState(false);
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
    setFileSelected(true);
  };

  const axiosPostRequest = () => {
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
          columns: column_names,
          users_data: data,
        },
        options
      )
      .then((res) => {
        setPercentage(100);
        setTimeout(() => {
          setPercentage(0);
        }, 1000);
        window.alert(res.data.message);
        console.log(res.data.message);
      });
  };

  // handle file upload
  const sendUploadedFile = (file) => {
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
    sendUploadedFile(e.target.files[0]);
  };

  useEffect(() => {
    console.log("columns", column_names);
    console.log("data in columns", data);
    console.log("percentage", percentage);
  }, [data, column_names, percentage]);

  useEffect(() => {
    if (fileSelected) {
      if (column_names.length && data.length) {
        for (let j = 0; j < column_names.length; j++) {
          if (column_names[j].name) {
            for (let i = 0; i < data.length; i++) {
              if (!data[i][column_names[j].name]) {
                setCorrect(false);
                window.alert("Missing Data in csv file. Fix it to send file");
                return;
              }
            }
          }
        }
        setCorrect(true);
      }
    }
  }, [fileSelected, column_names, data]);

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        component="label"
        style={{ marginLeft: "30px" }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          hidden
        />
        Upload Users Data
      </Button>
      {fileSelected ? (
        <div>
          <CustomTable users={data} coloum_names={column_names} />
          {fileCorrect ? (
            <Button
              variant="contained"
              color="primary"
              onClick={axiosPostRequest}
              style={{ marginLeft: "30px" }}
            >
              Send Users Data
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled
              style={{ marginLeft: "30px", marginTop: "10px" }}
            >
              Send Users Data
            </Button>
          )}

          {percentage > 0 ? (
            <LinearProgress variant="determinate" value={percentage} />
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default UploadUsers;
