import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import CustomTable from "./custom-Table";
import { Typography } from "@material-ui/core";

// function UploadReceiptData({ token }) {
//   const [file, setFile] = useState(null);
//   const [percentage, setPercentage] = useState(0);

//   const axiosPostRequest = (receipt_data) => {
//     const options = {
//       headers: {
//         token: token,
//       },
//       onUploadProgress: (progessEvent) => {
//         const { loaded, total } = progessEvent;
//         let precent = Math.floor((loaded * 100) / total);
//         if (precent < 100) {
//           setPercentage(precent);
//         }
//       },
//     };
//     axios
//       .post(
//         `http://localhost:5000/receipts/uploadReceiptData`,

//         receipt_data,
//         options
//       )
//       .then((res) => {
//         setPercentage(100);
//         setTimeout(() => {
//           setPercentage(0);
//         }, 1000);
//         console.log(res);
//         window.alert(res.data.message);
//       })
//       .catch((err) => console.log(err));
//   };

//   // handle file upload
//   const sendUploadedFile = () => {
// const reader = new FileReader();
// reader.onload = (evt) => {
//   /* get binary string */
//   const bstr = evt.target.result;

//   axiosPostRequest(parseExcel(bstr));
// };
// reader.readAsBinaryString(file);
//     //
//   };

//   const handleFileUpload = (e) => {
//     setFile(e.target.files[0]);
//   };

//   useEffect(() => {
//     console.log("file", file);
//     console.log("percentage", percentage);
//   }, [file, percentage]);

//   return (
//     <div style={{ marginTop: "15px" }}>
//       <Button
//         variant="contained"
//         color="primary"
//         component="label"
//         style={{ marginLeft: "30px" }}
//       >
//         <input
//           type="file"
//           accept=".csv,.xlsx,.xls"
//           onChange={handleFileUpload}
//           hidden
//         />
//         Upload Receipts Data
//       </Button>
//       <Button variant="contained" color="primary" onClick={sendUploadedFile}>
//         Send Receipts Data
//       </Button>
//       {percentage > 0 ? (
//         <LinearProgress variant="determinate" value={percentage} />
//       ) : (
//         ""
//       )}
//     </div>
//   );
// }

// export default UploadReceiptData;

function UploadReceiptData({ token }) {
  const [data_user, setData_user] = useState([]);
  const [data_SO, setData_SO] = useState([]);
  const [data_to_be_send, setData_to_be_send] = useState({});
  const [fileSelected, setFileSelected] = useState(false);
  const [fileCorrect, setCorrect] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [confirm_NotFound_emails, setconfirm_NotFound_emails] = useState(false);
  const [not_found_emails, setNot_found_emails] = useState([]);
  const [not_found_bills, setNot_found_bills] = useState([]);

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
        `http://localhost:5000/Receipts/uploadReceiptsData`,

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
  //confrim user data
  const confirmRequest = () => {
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
        `http://localhost:5000/invoices/confrimReceiptsUpload`,
        data_to_be_send,
        options
      )
      .then((res) => {
        setPercentage(100);
        setTimeout(() => {
          setPercentage(0);
        }, 1000);
        console.log(res.data);
        if (res.data.missing) {
          setNot_found_emails(res.data.not_found.emails);
          setNot_found_bills(res.data.not_found.bills);
        }
        setconfirm_NotFound_emails(true);
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
  }, [data_user, data_SO, data_to_be_send]);

  useEffect(() => {
    if (fileSelected) {
      if (data_user.length) {
        let cloumn_name = [];
        for (let i = 0; i < data_user.length; i++) {
          let temp_cloumn_name = [];
          for (const [key, value] of Object.entries(data_user[i])) {
            if (i === 0) {
              cloumn_name.push(key);
            }
            temp_cloumn_name.push(key);
            if (!value) {
              if (!value === 0) {
                setCorrect(false);
                window.alert(
                  "Missing Data in user data sheet. Fix it to send file"
                );
                return;
              }
            }
          }
          console.log(
            "inside use effect",
            cloumn_name.length,
            temp_cloumn_name.length
          );
          if (cloumn_name.length !== temp_cloumn_name.length) {
            setCorrect(false);
            window.alert(
              "Missing Data in user data sheet. Fix it to send file"
            );
            return;
          }
        }
        setCorrect(true);
      }
      if (data_SO.length) {
        let cloumn_name = [];
        for (let i = 0; i < data_SO.length; i++) {
          let temp_cloumn_name = [];
          for (const [key, value] of Object.entries(data_SO[i])) {
            if (i === 0) {
              cloumn_name.push(key);
            }
            temp_cloumn_name.push(key);
            if (!value) {
              if (!value === 0) {
                setCorrect(false);
                window.alert(
                  "Missing Data in user data sheet. Fix it to send file"
                );
                return;
              }
            }
          }
          console.log(
            "inside use effect",
            cloumn_name.length,
            temp_cloumn_name.length
          );
          if (cloumn_name.length !== temp_cloumn_name.length) {
            setCorrect(false);
            window.alert(
              "Missing Data in user data sheet. Fix it to send file"
            );
            return;
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
        Upload Receipts Data
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
              onClick={confirmRequest}
              style={{ marginLeft: "30px" }}
            >
              Send Receipts Data
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled
              style={{ marginLeft: "30px", marginTop: "10px" }}
            >
              Send Receipts Data
            </Button>
          )}
          {confirm_NotFound_emails ? (
            <div style={{ marginLeft: "30px", marginTop: "10px" }}>
              {not_found_emails
                ? not_found_emails.map((item, index) => (
                    <div>
                      <p>
                        <b>Emails Not Found:</b>
                      </p>
                      <p key={index}>{item}</p>
                    </div>
                  ))
                : "All emails found. Please Confrim and submit"}
              {not_found_bills
                ? not_found_bills.map((item, index) => (
                    <div>
                      <p>
                        <b>Bills Not Found:</b>
                      </p>
                      <p key={index}>{item}</p>
                    </div>
                  ))
                : "All bills found. Please Confrim and submit"}
              <Button
                variant="contained"
                color="primary"
                onClick={axiosPostRequest}
              >
                Confrim and Submit
              </Button>
            </div>
          ) : (
            false
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

export default UploadReceiptData;
