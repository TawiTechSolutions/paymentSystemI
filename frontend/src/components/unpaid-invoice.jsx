import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import PayBill from "./payBill";
import { useEffect } from "react";

//addd commas
const addCommas = (e) => {
  let l,
    t,
    n = (e = e.toString()).indexOf(".");
  if (
    (n >= 0 ? ((l = e.slice(0, n)), (t = e.slice(n))) : ((l = e), (t = "")),
    l.length > 3)
  ) {
    let e = l.slice(0, l.length - 3) + "," + l.slice(l.length - 3);
    for (let l = 2; e.length - 4 - l > 0; l += 3)
      e = e.slice(0, e.length - 4 - l) + "," + e.slice(e.length - 4 - l);
    return e + t;
  }
  return e;
};

//sorting functions

//for dates
function compareDates(a, b, orderBy) {
  const date2 = new Date(b[orderBy]).getTime();
  const date1 = new Date(a[orderBy]).getTime();
  if (date2 < date1) {
    return -1;
  }
  if (date2 > date1) {
    return 1;
  }
  return 0;
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  if (orderBy === "invoice_date" || orderBy === "due_date") {
    return order === "desc"
      ? (a, b) => compareDates(a, b, orderBy)
      : (a, b) => -compareDates(a, b, orderBy);
  }
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));
function createData(
  invoice,
  invoice_date,
  currency,
  due_amount,
  due_date,
  payBill
) {
  return {
    invoice,
    invoice_date,
    currency,
    due_amount,
    due_date,
    payBill,
  };
}
export default function UnpaidInvoice({ rows_data, token, inAdmin }) {
  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("invoice_date");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);

  //coloumn invoices
  const headCells = inAdmin
    ? [
        {
          id: "invoice",
          numeric: false,
          date: false,
          disablePadding: true,
          label: "Invoice",
        },
        {
          id: "invoice_date",
          numeric: true,
          disablePadding: false,
          label: "Invoice Date",
        },
        {
          id: "currency",
          numeric: true,
          disablePadding: false,
          label: "Currency",
        },
        {
          id: "due_amount",
          numeric: true,
          disablePadding: false,
          label: "Due Amount",
        },
        {
          id: "due_date",
          numeric: true,
          disablePadding: false,
          label: "Due Date",
        },
      ]
    : [
        {
          id: "invoice",
          numeric: false,
          date: false,
          disablePadding: true,
          label: "Invoice",
        },
        {
          id: "invoice_date",
          numeric: true,
          disablePadding: false,
          label: "Invoice Date",
        },
        {
          id: "currency",
          numeric: true,
          disablePadding: false,
          label: "Currency",
        },
        {
          id: "due_amount",
          numeric: true,
          disablePadding: false,
          label: "Due Amount",
        },
        {
          id: "due_date",
          numeric: true,
          disablePadding: false,
          label: "Due Date",
        },
        { id: "pay_bill", numeric: true, disablePadding: false, label: "Pay" },
      ];

  function EnhancedTableHead({ classes, order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell, ind) => (
            <TableCell
              key={headCell.id + ind}
              align={headCell.numeric ? "right" : "left"}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{ paddingLeft: "10px" }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <b> {headCell.label}</b>
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  React.useEffect(() => {
    setRows(
      rows_data.map((bill) => {
        return createData(
          bill.bill_url ? (
            <a style={{ textDecoration: "none" }} href={bill.bill_url}>
              {bill.invoice_num}
            </a>
          ) : (
            <p style={{ textDecoration: "none" }}>{bill.invoice_num}</p>
          ),
          bill.invoice_detials.invoice_dt,
          bill.invoice_detials.invoice_currency,
          bill.invoice_detials.final_bal_due,
          bill.invoice_detials.due_date,
          { token: token, id: bill._id, bill: bill }
        );
      })
    );
  }, [rows_data, token]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(
    () =>
      console.log(
        stableSort(rows, getComparator(order, orderBy)).slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      ),
    [rows, orderBy, page, rowsPerPage, order]
  );

  return (
    <div style={{ margin: "10px", marginInline: "30px" }}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"small"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover tabIndex={-1} key={index}>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        style={{ paddingLeft: "10px" }}
                      >
                        {row.invoice}
                      </TableCell>
                      <TableCell align="right">{row.invoice_date}</TableCell>
                      <TableCell align="right">{row.currency}</TableCell>
                      <TableCell align="right">
                        {addCommas(parseFloat(row.due_amount).toFixed(2))}
                      </TableCell>
                      <TableCell align="right">{row.due_date}</TableCell>
                      {inAdmin ? (
                        ""
                      ) : (
                        <TableCell align="right">
                          <PayBill
                            token={row.payBill.token}
                            id={row.payBill.id}
                            bill={row.payBill.bill}
                          />{" "}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
