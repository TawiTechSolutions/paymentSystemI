import { BrowserRouter } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import { Container } from "@material-ui/core";
import RowsInTable from "./rows-Custom-table";
import { useEffect, useState } from "react";

const CustomTable = ({ users }) => {
  const [coloum_names, setColoum_names] = useState([]);

  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  useEffect(() => {
    let keys = [];
    for (const [key, value] of Object.entries(users[0])) {
      keys.push({ name: key });
    }
    setColoum_names(keys);
  }, [users]);
  return (
    <BrowserRouter>
      <Container>
        <Box
          style={{
            overflow: "auto",
            margin: "7px",
            marginTop: 0,
            border: "1.5px solid rgb(243, 243, 243)",
            borderBottom: 0,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {coloum_names.map((element) =>
                  element.name ? (
                    <TableCell key={generateKey("headcell")}>
                      <b>{element.name}</b>
                    </TableCell>
                  ) : (
                    false
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <RowsInTable
                  key={generateKey("row")}
                  user={user}
                  coloum_names={coloum_names}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
    </BrowserRouter>
  );
};

export default CustomTable;
