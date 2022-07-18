import { useContext } from 'react';
import {Nav, Navbar, Container, Button} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import AuthContext from '../auth/AuthContext';

function NavigBar() {
    const { user, logoutUser } = useContext(AuthContext);
    
    return ( 
        <Container>
        <Navbar expand="lg" variant="dark" bg="dark">
            <Container>
                <Navbar.Brand><Nav.Link as={NavLink} className="text-white" end to="/">Budget Track</Nav.Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                {user ? ( <>
                    <Nav.Link as={NavLink} end to="/">Home</Nav.Link>
                    <Nav.Link as={NavLink} to="budget/">Budget</Nav.Link>
                    <Nav.Link as={NavLink} to="transactions/">Transactions</Nav.Link>
                    <Button onClick={logoutUser}>Logout</Button>
                    </>
                ) : 
                (  <>
                    <Nav.Link as={NavLink} to="login/">Login</Nav.Link>
                    <Nav.Link as={NavLink} to="register/">Register</Nav.Link>
                    </>
                )}
                </Nav>
                </Navbar.Collapse>
                
            </Container>
        </Navbar>
        </Container>
    );
}

export default NavigBar;