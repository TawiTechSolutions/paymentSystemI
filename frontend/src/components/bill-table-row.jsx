import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AssignmentIcon from "@material-ui/icons/Assignment";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  TableRow: {
    TableCell: { color: "white" },
  },
});

const BillRow = ({ bill }) => {
  const classes = useStyles();
  const openBill = () => {
    window.open(bill.bill_url);
  };

  return (
    <TableRow>
      <TableCell style={{ padding: "0 16px" }}>{bill.invoice_num}</TableCell>
      <TableCell style={{ padding: "0 16px", textAlign: "center" }}>
        <Button onClick={openBill} aria-label="view" className={classes.margin}>
          <AssignmentIcon style={{ marginRight: "5px" }} /> View Bill
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default BillRow;
