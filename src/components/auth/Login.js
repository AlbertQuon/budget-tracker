import { Container, Form, Button, Row, FloatingLabel } from "react-bootstrap";
import AuthContext from "./AuthContext";
import { useContext } from "react";

function Login() {

    const { loginUser } = useContext(AuthContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
        username.length > 0 && loginUser(username, password)
    }

    return ( 
    <Container className="my-2">
        <Row className="my-2">
            <h3>Login</h3>
        </Row>
        <Row>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <FloatingLabel
                    controlId="username"
                    label="Username"
                    className="mb-3 input-label"
                >
                <Form.Control required id="username" type="text" placeholder="Enter username" />
                </FloatingLabel>
            </Form.Group>

            <Form.Group className="mb-3">
                <FloatingLabel
                    controlId="password"
                    label="Password"
                    className="mb-3 input-label"
                >
                <Form.Control required id="password" type="password" placeholder="Password" />
                </FloatingLabel>
            </Form.Group>
            <Button className="custom-btn" type="submit">
                Login
            </Button>
        </Form>
        </Row>
    </Container> );
}

export default Login;