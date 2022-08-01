import { useContext, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import useAxios from "../utils/useAxios";
import AuthContext from "./AuthContext";

function UserSettings() {

    const {user, updateUser} = useContext(AuthContext);
    const [username, setUsername] = useState(user.username);
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [validated, setValidated] = useState(false);

    const onFormSubmit = (event) => {
        event.preventDefault();
        var form = event.currentTarget;
        if (password !== password2 || !form.checkValidity()) {
            setWrongPassword(true);
            event.stopPropagation();
        } else {
            setWrongPassword(false);
            updateUser(username, oldPassword, password, password2);
            setValidated(true);
        }
    }
  
    return ( <Container className="my-3">
    <Row>
        <Col>
            <h4>User settings</h4>
            <Form noValidate validated={validated} onSubmit={onFormSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label required>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter a purchase category" isValid={username.length > 0} onChange={e => setUsername(e.target.value)} defaultValue={user.username} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control required type="password" isValid={oldPassword !== password2 !== password && oldPassword.length > 7} onChange={e => setOldPassword(e.target.value)} placeholder="Enter current password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control className="mb-2" required isInvalid={password.length < 7} isValid={password === password2 && password.length > 7} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter new password" />
                        <Form.Control className="mb-2" required isInvalid={password2.length < 7} isValid={password === password2 && password2.length > 7} onChange={e => setPassword2(e.target.value)} type="password" placeholder="Reenter new password" />
                        <Form.Text id="passwordHelpBlock" className="text-white">
                            Your new password must be 8-20 characters long, contain letters and numbers, and
                            must not contain spaces, special characters, or emoji.
                        </Form.Text>
                    </Form.Group>
                    <Form.Text className="text-info" id="wrongMatchPassword">{wrongPassword ? "Passwords do not match!" : ""}</Form.Text>
                    <Button variant="dark" type="submit">
                        Save
                    </Button>
                </Form>
        </Col>
    </Row>
    </Container> );
}

export default UserSettings;