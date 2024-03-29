import { useContext } from 'react';
import {Nav, Navbar, Container, Button} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import AuthContext from '../auth/AuthContext';
import "../../css/Navbar.css"

function NavigBar() {
    const { user, logoutUser } = useContext(AuthContext);
    
    return ( 
        <Container className='custom-nav'>
        <Navbar expand="lg" variant="dark" bg="dark" >
            <Container className='custom-navbar'>
                <Navbar.Brand><Nav.Link as={NavLink} className="text-white" end to="/">Budgeter</Nav.Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-start">
                {user ? ( <>
                <Nav className="me-auto my-2 my-lg-0"
                    navbarScroll>
                    <Nav.Link className='custom-nav-link mx-2' as={NavLink} end to="/">Home</Nav.Link>
                    <Nav.Link className='custom-nav-link mx-2' as={NavLink} to="budget/">Budget</Nav.Link>
                    <Nav.Link className='custom-nav-link mx-2' as={NavLink} to="transactions/">Transactions</Nav.Link>
                    <Nav.Link className='custom-nav-link mx-2' as={NavLink} to="settings/">Settings</Nav.Link>
                </Nav>
                <Button className='custom-btn-negative' onClick={logoutUser}>Logout</Button>
                </>  
                ) : 
                (  <Nav className="me-auto my-2 my-lg-0 customNav"
                    navbarScroll>
                    <Nav.Link as={NavLink} className='custom-nav-link mx-2' to="login/">Login</Nav.Link>
                    <Nav.Link as={NavLink} className='custom-nav-link mx-2' to="register/">Register</Nav.Link>
                    </Nav>
                )}
                </Navbar.Collapse>
                
            </Container>
        </Navbar>
        </Container>
    );
}

export default NavigBar;