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

const CustomTable = ({ data, errors }) => {
  const [coloum_names, setColoum_names] = useState([]);

  useEffect(() => {
    let keys = [];
    for (const [key, value] of Object.entries(data[0])) {
      keys.push({ name: key, value: value });
    }
    setColoum_names(keys);
  }, [data]);
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
                {coloum_names.map((element, index) =>
                  element.name ? (
                    <TableCell key={index}>
                      <b>{element.name}</b>
                    </TableCell>
                  ) : (
                    false
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <RowsInTable
                  key={index}
                  data={item}
                  coloum_names={coloum_names}
                  colour={errors[index] ? errors[index] : ""}
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
