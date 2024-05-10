import { memo } from "react";
import { Navbar } from "react-bootstrap";
import { BrandingProps } from "../../utils/interface";

const NavBarBranding = memo(({ naming }: BrandingProps) => {
  return (
    <Navbar.Brand className="brand-wrap d-flex">
      <div style={{ flex: "0 0 10%", marginRight: "2px" }}>
        <img
          alt=""
          src="/favicon-32x32.png"
          width="32"
          height="32"
          className="d-inline-block align-top"
        />
      </div>
      <div style={{ flex: "1" }}>
        <Navbar.Text className="fluid-bolding fluid-text">{naming}</Navbar.Text>
      </div>
    </Navbar.Brand>
  );
});

export default NavBarBranding;
