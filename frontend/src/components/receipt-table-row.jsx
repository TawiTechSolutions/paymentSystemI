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

const ReceiptRow = ({ receipt }) => {
  const classes = useStyles();
  const openReceipt = () => {
    window.open(receipt.receipt_url);
  };

  return (
    <TableRow>
      <TableCell style={{ padding: "0 16px" }}>{receipt.invoice_num}</TableCell>
      <TableCell style={{ padding: "0 16px" }}>
        <Button
          onClick={openReceipt}
          aria-label="view"
          className={classes.margin}
        >
          <AssignmentIcon /> View Invoice
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ReceiptRow;
