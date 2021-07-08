import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

const RowsInTable = ({ data, coloum_names, colour }) => {
  return (
    <TableRow style={{ backgroundColor: colour ? colour : "" }}>
      {coloum_names.map((element, index) =>
        element.name ? (
          <TableCell key={index}>
            {data[element.name] || data[element.name] === 0
              ? data[element.name].toString()
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
