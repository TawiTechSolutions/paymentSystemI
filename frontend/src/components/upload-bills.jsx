import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import CustomTable from "./custom-Table";
import { Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

function UploadBillsData({ token }) {
  //

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  //
  const [data_user, setData_user] = useState([]);
  const [data_SO, setData_SO] = useState([]);
  const [data_to_be_send, setData_to_be_send] = useState({});
  const [fileSelected, setFileSelected] = useState(false);
  const [fileCorrect, setCorrect] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [errors_in_custData, setErrors_in_custData] = useState([]);
  const [errors_in_SOData, setErrors_in_SOData] = useState([]);
  const [userDataTables, setUserDataTables] = useState([]);
  const [SODataTables, setSODataTables] = useState([]);
  const [errorColourCustData, setErrorColourCustData] = useState({});
  const [errorsColourSOData, setErrorsColourSOData] = useState({});

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
    console.log("data of users inside bills", data_user);
    console.log("data of so inside bills", data_SO);
    console.log("data in total inside bills", data_to_be_send);
  }, [data_user, data_SO, data_to_be_send]);

  //check data in file
  useEffect(() => {
    let noErrors = true;
    if (fileSelected) {
      if (data_user.length) {
        let errors = [];
        const cloumn_name = [
          "cust_id",
          "cust_tax_id",
          "cust_pan",
          "cust_firm",
          "cust_keyman",
          "cust_email",
          "cust_ph_isd",
          "cust_ph_num",
          "cust_add_cntry",
          "cust_add_zip",
          "cust_add_state",
          "cust_add_city",
          "cust_add_landmark",
          "cust_add_street",
          "invoice_dt",
          "invoice_num",
          "invoice_currency",
          "invoice_amt",
          "discount",
          "email_dt",
          "desc",
          "TDS",
          "GST",
          "final_bal_due",
          "recurring",
          "Frequency",
          "paid",
          "payment_method",
          "shown_in_system",
          "payment_date",
          "payment_amt",
        ];
        for (let i = 0; i < data_user.length; i++) {
          let temp_cloumn_name = [];
          //check empty valule
          for (const [key, value] of Object.entries(data_user[i])) {
            temp_cloumn_name.push(key);
            if (!value) {
              if (value !== 0) {
                noErrors = false;
                errors.push({
                  row: i,
                  cloumn_name: key,
                });
              }
            }
          }
          //check missing key
          for (let j = 0; j < cloumn_name.length; j++) {
            let found_in_temp = false;
            for (let k = 0; k < temp_cloumn_name.length; k++) {
              if (temp_cloumn_name[k] === cloumn_name[j]) {
                found_in_temp = true;
              }
            }
            if (!found_in_temp) {
              noErrors = false;
              errors.push({
                row: i,
                cloumn_name: cloumn_name[j],
              });
            }
          }
        }
        setErrors_in_custData(errors);
      }
      if (data_SO.length) {
        let errors = [];
        const cloumn_name = [
          "so_keyman",
          "so_keyman_title",
          "so_email",
          "so_position",
          "so_ph_isd",
          "so_ph_num",
          "so_add_cntry",
          "so_add_zip",
          "so_add_state",
          "so_add_city",
          "so_add_landmark",
          "so_add_street",
          "so_firm",
          "so_firm_email",
          "so_firm_acc_name",
          "so_firm_acc_num",
          "so_firm_ifsc",
          "so_firm_swift",
          "so_firm_ph_isd",
          "so_firm_ph_num",
          "so_firm_add_cntry",
          "so_firm_add_zip",
          "so_firm_add_state",
          "so_firm_add_city",
          "so_firm_add_landmark",
          "so_firm_add_street",
        ];
        for (let i = 0; i < data_SO.length; i++) {
          let temp_cloumn_name = [];
          //check empty valule
          for (const [key, value] of Object.entries(data_SO[i])) {
            temp_cloumn_name.push(key);
            if (!value) {
              if (value !== 0) {
                noErrors = false;
                errors.push({ row: i, cloumn_name: key });
              }
            }
          }
          //check missing key
          for (let j = 0; j < cloumn_name.length; j++) {
            let found_in_temp = false;
            for (let k = 0; k < temp_cloumn_name.length; k++) {
              if (temp_cloumn_name[k] === cloumn_name[j]) {
                found_in_temp = true;
              }
            }
            if (!found_in_temp) {
              noErrors = false;
              errors.push({
                row: i,
                cloumn_name: cloumn_name[j],
              });
            }
          }
        }
        setErrors_in_SOData(errors);
      }
      if (noErrors) {
        setCorrect(true);
      } else {
        window.alert("Missing Data in user data sheet. Fix it to send file");
      }
    }
  }, [fileSelected, data_SO, data_user]);

  //format data for tables
  useEffect(() => {
    let userData_tables = [];
    let SOData_tables = [];
    for (let i = 0; i < data_user.length; i++) {
      let one_user = {};
      for (const [key, value] of Object.entries(data_user[i])) {
        if (
          key === "cust_id" ||
          key === "cust_tax_id" ||
          key === "cust_keyman" ||
          key === "cust_email" ||
          key === "cust_firm" ||
          key === "invoice_num"
        ) {
          one_user[key] = value;
        }
      }
      userData_tables.push(one_user);
    }
    for (let i = 0; i < data_SO.length; i++) {
      let one_user = {};
      for (const [key, value] of Object.entries(data_SO[i])) {
        if (
          key === "so_keyman" ||
          key === "so_email" ||
          key === "so_firm_email" ||
          key === "so_firm_email" ||
          key === "so_firm_acc_name" ||
          key === "so_firm_acc_num" ||
          key === "so_firm_ifsc" ||
          key === "so_firm_swift"
        ) {
          one_user[key] = value;
        }
      }
      SOData_tables.push(one_user);
    }
    setUserDataTables(userData_tables);
    setSODataTables(SOData_tables);
  }, [data_SO, data_user]);

  //colour the rows
  useEffect(() => {
    let ColourCustData = {};
    for (let i = 0; i < errors_in_custData.length; i++) {
      const orangeWarning = [];
      const redWarning = [];

      if (orangeWarning.includes(errors_in_custData[i].cloumn_name)) {
        ColourCustData[errors_in_custData[i].row] = "#FF6666";
      }
      if (redWarning.includes(errors_in_custData[i].cloumn_name)) {
        ColourCustData[errors_in_custData[i].row] = "#FFB266";
      }
    }
    setErrorColourCustData(ColourCustData);

    //colour so data
    let ColourSOData = {};
    for (let i = 0; i < errors_in_SOData.length; i++) {
      const orangeWarning = [];
      const redWarning = [];

      if (orangeWarning.includes(errors_in_SOData[i].cloumn_name)) {
        ColourSOData[errors_in_SOData[i].row] = "#FF6666";
      }
      if (redWarning.includes(errors_in_SOData[i].cloumn_name)) {
        ColourSOData[errors_in_SOData[i].row] = "#FFB266";
      }
    }
    setErrorsColourSOData(ColourSOData);
  }, [errors_in_custData, errors_in_SOData]);

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        style={{ marginRight: "10px" }}
      >
        Upload bills
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"xl"}
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">Bills</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload the bill details of clients
          </DialogContentText>

          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <Button variant="contained" color="primary" component="label">
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
                  align="left"
                  gutterBottom
                >
                  Users Data
                </Typography>
                <CustomTable
                  key={"table1"}
                  data={userDataTables}
                  errors={errorColourCustData}
                />
                <Typography
                  style={{ marginTop: "5px" }}
                  variant="h5"
                  component="h6"
                  align="left"
                  gutterBottom
                >
                  Solution Onwers Data
                </Typography>
                <CustomTable
                  key={"table2"}
                  data={SODataTables}
                  errors={errorsColourSOData}
                />

                {fileCorrect ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={axiosPostRequest}
                  >
                    Send Bills Data
                  </Button>
                ) : (
                  <div>
                    {errors_in_custData ? (
                      <React.Fragment>
                        <p>
                          <b>Errors Found in cust_data sheet:</b>
                        </p>

                        {errors_in_custData
                          ? errors_in_custData.map((item) => (
                              <p>
                                Missing item in cloumn {item.cloumn_name} of row{" "}
                                {item.row}
                              </p>
                            ))
                          : "No errors"}
                      </React.Fragment>
                    ) : (
                      false
                    )}
                    {errors_in_SOData ? (
                      <React.Fragment>
                        <p>
                          <b>Errors Found in SO_data sheet:</b>
                        </p>

                        {errors_in_SOData
                          ? errors_in_SOData.map((item) => (
                              <p>
                                Missing item in cloumn {item.cloumn_name} of row{" "}
                                {item.row}
                              </p>
                            ))
                          : "No errors"}
                      </React.Fragment>
                    ) : (
                      false
                    )}
                    <Button
                      variant="contained"
                      disabled
                      style={{ marginTop: "10px" }}
                    >
                      Send Bills Data
                    </Button>
                  </div>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default UploadBillsData;
