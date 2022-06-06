import {Nav, Navbar, Container} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'

function NavigBar() {
    return ( 
        <Container>
        <Navbar expand="lg" variant="dark" bg="dark">
            <Container>
                <Navbar.Brand>Budget Track</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={NavLink} exact to="/">Home</Nav.Link>
                    <Nav.Link as={NavLink} exact to="preferences/">Preferences</Nav.Link>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </Container>
    );
}

export default NavigBar;