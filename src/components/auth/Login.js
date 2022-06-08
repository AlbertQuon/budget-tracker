import { Container, Form, Button, Row } from "react-bootstrap";
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
    <Container>
        <Row>
            <h3>Login</h3>
        </Row>
        <Row>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control id="username" type="text" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control id="password" type="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="submit">
                Login
            </Button>
        </Form>
        </Row>
    </Container> );
}

export default Login;