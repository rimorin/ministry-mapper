import { memo } from "react";
import { Offcanvas, Table } from "react-bootstrap";
import { LegendProps } from "../../utils/interface";
import NotHomeIcon from "../table/nothome";

const Legend = memo(({ showLegend, hideFunction }: LegendProps) => {
  return (
    <Offcanvas show={showLegend} onHide={hideFunction}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Legend</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center align-middle">✅</td>
              <td>Contacted successfully.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🚫</td>
              <td>Do not contact.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">
                <NotHomeIcon />
              </td>
              <td>Not at home.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">✖️</td>
              <td>Address does not exist.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🗒️</td>
              <td>Additional home info.</td>
            </tr>
          </tbody>
        </Table>
      </Offcanvas.Body>
    </Offcanvas>
  );
});

export default Legend;
