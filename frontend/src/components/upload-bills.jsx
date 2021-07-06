import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import CustomTable from "./Custom-Table";
import { Typography } from "@material-ui/core";

function UploadBillsData({ token }) {
  const [data_user, setData_user] = useState([]);
  const [data_SO, setData_SO] = useState([]);
  const [data_to_be_send, setData_to_be_send] = useState({});
  const [fileSelected, setFileSelected] = useState(false);
  const [fileCorrect, setCorrect] = useState(false);
  const [percentage, setPercentage] = useState(0);

  // process XLSX data
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
      console.log("sheetNames", workbook.SheetNames);
      data[sheetName] = XL_row_object;
    });
    setData_user(data["cust_data"]);
    setData_SO(data["solutions_owner_data"]);
    setData_to_be_send(data);
    setFileSelected(true);
  };
  //upload user data
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
        `http://localhost:5000/invoices/uploadBillsData`,

        data_to_be_send,
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
  const sendUploadedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* get binary string */
      const bstr = evt.target.result;

      parseExcel(bstr);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    sendUploadedFile(e.target.files[0]);
  };

  useEffect(() => {
    console.log("data of users", data_user);
    console.log("data of so", data_SO);
    console.log("data in total", data_to_be_send);
    console.log("percentage", percentage);
  }, [data_user, data_SO, percentage, data_to_be_send]);

  useEffect(() => {
    if (fileSelected) {
      if (data_user.length) {
        for (let i = 0; i < data_user.length; i++) {
          for (const [key, value] of Object.entries(data_user[i])) {
            if (!value) {
              setCorrect(false);
              window.alert(
                "Missing Data in user data sheet. Fix it to send file"
              );
              return;
            }
          }
        }
        setCorrect(true);
      }
      if (data_SO.length) {
        for (let i = 0; i < data_SO.length; i++) {
          for (const [key, value] of Object.entries(data_SO[i])) {
            if (!value) {
              setCorrect(false);
              window.alert(
                "Missing Data in SO data Sheet. Fix it to send file"
              );
              return;
            }
          }
        }
        setCorrect(true);
      }
    }
  }, [fileSelected, data_SO, data_user]);

  return (
    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
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
        Upload Bills Data
      </Button>
      {fileSelected ? (
        <div>
          <Typography
            style={{ marginTop: "5px" }}
            variant="h5"
            component="h6"
            align="center"
            gutterBottom
          >
            Users Data :
          </Typography>
          <CustomTable users={data_user} />
          <Typography
            style={{ marginTop: "5px" }}
            variant="h5"
            component="h6"
            align="center"
            gutterBottom
          >
            Solution Onwers Data :
          </Typography>
          <CustomTable users={data_SO} />

          {fileCorrect ? (
            <Button
              variant="contained"
              color="primary"
              onClick={axiosPostRequest}
              style={{ marginLeft: "30px" }}
            >
              Send Bills Data
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled
              style={{ marginLeft: "30px", marginTop: "10px" }}
            >
              Send Bills Data
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

export default UploadBillsData;
