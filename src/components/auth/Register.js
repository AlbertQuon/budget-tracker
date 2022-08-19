import { useContext, useState } from 'react';
import {Container, Form, Button, Row, FloatingLabel} from 'react-bootstrap'
import AuthContext from './AuthContext';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [validated, setValidated] = useState(false);
    const { registerUser } = useContext(AuthContext);

    const handleSubmit = async event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (password !== password2 && form.checkValidity()) {
            setWrongPassword(true);
            event.stopPropagation();
        } else {
            setWrongPassword(false);
            registerUser(username, password, password2);
            setValidated(true);
        }
        
    }
    console.log(password === password2 && password.length > 7)
    return ( <Container>
        <Row>
            <h3>Register</h3>
        </Row>
        <Row>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>

            <Form.Group className="mb-3">
                <FloatingLabel
                    controlId="username"
                    label="Username"
                    className="mb-3 input-label"
                >
                <Form.Control type="text" required onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
                </FloatingLabel>
            </Form.Group>

            <Form.Group className="mb-3">
                <FloatingLabel
                    controlId="password"
                    label="Password"
                    className="mb-3 input-label"
                >
                <Form.Control type="password" required isValid={password === password2 && password.length > 7} placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <Form.Text id="passwordHelpBlock" muted>
                    Your password must be 8-20 characters long, contain letters and numbers, and
                    must not contain spaces, special characters, or emoji.
                </Form.Text>
                </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3">
                <FloatingLabel
                    controlId="password2"
                    label="Confirm Password"
                    className="mb-3 input-label"
                >
                <Form.Control type="password" required isValid={password === password2 && password2.length > 7} 
                onChange={e => setPassword2(e.target.value)} placeholder="Confirm password" />
                </FloatingLabel>
            </Form.Group>
            <Form.Group>
            <Form.Text className="text-info" id="wrongMatchPassword">{wrongPassword ? "Passwords do not match!" : ""}</Form.Text>
            </Form.Group>
            
            <Button variant="dark" type="submit">
                Register
            </Button>
        </Form>
        </Row>
    </Container> );
}

export default Register;