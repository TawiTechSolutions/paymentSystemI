import React from "react";
import PropTypes from "prop-types";
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
import { Typography } from "@material-ui/core";

function createData(
  invoice,
  invoice_date,
  currency,
  due_amount,
  due_date,
  amount_paid,
  receipt
) {
  return {
    invoice,
    invoice_date,
    currency,
    due_amount,
    due_date,
    amount_paid,
    receipt,
  };
}

//coloumn invoices
const headCells = [
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
  { id: "currency", numeric: true, disablePadding: false, label: "Currency" },
  {
    id: "due_amount",
    numeric: true,
    disablePadding: false,
    label: "Due Amount",
  },
  { id: "due_date", numeric: true, disablePadding: false, label: "Due Date" },

  {
    id: "amount_paid",
    numeric: true,
    disablePadding: false,
    label: "Amount Paid",
  },
  { id: "receipt", numeric: true, disablePadding: false, label: "Receipt" },
];

//sorting functions

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

function EnhancedTableHead(props) {
  const {
    classes,

    order,
    orderBy,

    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
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
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

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

export default function InvoicesTable({ rows_data }) {
  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("due_date");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    setRows(
      rows_data.map((receipt) => {
        return createData(
          <a style={{ textDecoration: "none" }} href={receipt.bill_url}>
            {receipt.invoice_num}
          </a>,
          receipt.invoice_detials.invoice_dt,
          receipt.invoice_detials.invoice_currency,
          receipt.invoice_detials.final_bal_due,
          receipt.invoice_detials.due_date,
          receipt.invoice_detials.final_bal_due,
          <a style={{ textDecoration: "none" }} href={receipt.receipt_url}>
            {"R_" + receipt.invoice_num}
          </a>
        );
      })
    );
  }, [rows_data]);

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

  return (
    <div style={{ margin: "10px", marginInline: "30px" }}>
      <Typography
        style={{ marginTop: "5px" }}
        variant="h6"
        component="h6"
        align="left"
        gutterBottom
      >
        <b> Paid Invoices</b>
      </Typography>
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
                    <TableRow hover tabIndex={-1} key={row.invoice}>
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
                      <TableCell align="right">{row.due_amount}</TableCell>
                      <TableCell align="right">{row.due_date}</TableCell>
                      <TableCell align="right">{row.amount_paid}</TableCell>
                      <TableCell align="right">{row.receipt}</TableCell>
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
