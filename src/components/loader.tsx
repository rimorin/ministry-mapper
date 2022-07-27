import { Container, Spinner } from "react-bootstrap";

function Loader() {
    return (<Container className='d-flex align-items-center justify-content-center vh-100' fluid>
    <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
    </Container>)
}

export default Loader;