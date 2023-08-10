import { memo } from "react";
import { Navbar } from "react-bootstrap";
import { BrandingProps } from "../../utils/interface";

const NavBarBranding = memo(({ naming }: BrandingProps) => {
  return (
    <Navbar.Brand className="brand-wrap">
      <img
        alt=""
        src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
        width="32"
        height="32"
        className="d-inline-block align-top"
      />{" "}
      <Navbar.Text className="fluid-bolding fluid-text">{naming}</Navbar.Text>
    </Navbar.Brand>
  );
});

export default NavBarBranding;
