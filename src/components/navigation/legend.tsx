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
              <td>Spoke to householder or Wrote Letter.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🚫</td>
              <td>Do not call or write letter.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">
                <NotHomeIcon />
              </td>
              <td>
                Householder is not at home. Option to write a letter after a few
                tries.
              </td>
            </tr>
            <tr>
              <td className="text-center align-middle">✖️</td>
              <td>Unit doesn&#39;t exist for some reason.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🗒️</td>
              <td>Optional information about the unit. Avoid personal data.</td>
            </tr>
          </tbody>
        </Table>
      </Offcanvas.Body>
    </Offcanvas>
  );
});

export default Legend;
