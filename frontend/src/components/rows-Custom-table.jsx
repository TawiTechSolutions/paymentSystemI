import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

const RowsInTable = ({ user, coloum_names }) => {
  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };
  return (
    <TableRow>
      {coloum_names.map((element) =>
        element.name ? (
          <TableCell key={generateKey("cell")}>
            {user[element.name] ? user[element.name].toString() : ""}
          </TableCell>
        ) : (
          false
        )
      )}
    </TableRow>
  );
};

export default RowsInTable;
