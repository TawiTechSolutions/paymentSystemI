import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

const RowsInTable = ({ user, coloum_names }) => {
  return (
    <TableRow>
      {coloum_names.map((element, index) =>
        element.name ? (
          <TableCell key={index}>
            {user[element.name] || user[element.name] === 0
              ? user[element.name].toString()
              : ""}
          </TableCell>
        ) : (
          false
        )
      )}
    </TableRow>
  );
};

export default RowsInTable;
