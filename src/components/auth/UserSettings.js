import { useContext, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import useAxios from "../utils/useAxios";
import AuthContext from "./AuthContext";
import { Formik, useField, FieldArray } from 'formik';
import * as Yup from 'yup';

function UserSettings() {

    const {user, updateUser, updateUsername} = useContext(AuthContext);
    const [formResponse, setFormResponse] = useState("");
    const [success, setSuccess] = useState(false);

    const onFormSubmit = (values, actions) => {
        if (values.password.length > 0) {
            updateUser(values.username, values.oldPassword, values.password, values.password2).then(res => {
                if (res?.username === values.username) {
                    setSuccess(true);
                    setFormResponse(" Success!")
                } else {
                    setSuccess(false);
                    if (res && res.oldPassword) {
                        if (res.oldPassword?.oldPassword) { // internal validation error
                            setFormResponse(res?.oldPassword.oldPassword)
                        } else {
                            setFormResponse(res?.oldPassword) // django password validation error
                        }
                    } else {
                        setFormResponse("Failed to update")
                    }
                }
                actions.isSubmitting = false;
            }).catch(err => {console.log(err); setFormResponse("Failed to update")});
        } else {
            updateUsername(values.username, values.oldPassword).then(res => {
                if (res?.username === values.username) {
                    setSuccess(true);
                    setFormResponse(" Success!")
                } else {
                    setSuccess(false);
                    if (res.password?.password) { // internal validation error
                        setFormResponse(res?.password.password)
                    } else {
                        setFormResponse(res?.password) // django password validation error
                    }
                }
                actions.isSubmitting = false;
            }).catch(err => {console.log(err); setFormResponse("Failed to update");});
        }
        
    }

    const validSchema = Yup.object().shape({
        username: Yup.string().required("Please enter a username"),
        oldPassword: Yup.string().required("Please enter your current password").min(8, "Password is too short - should be 8 characters minimum"),
        password: Yup.string().min(8, "Password is too short - should be 8 characters minimum"),
        password2: Yup.string().when('password', (password, schema) => {
            return password?.length > 0 ? Yup.string().required("Please confirm your new password").min(8, "Password is too short - should be 8 characters minimum").oneOf([Yup.ref('password'), null], "Passwords must match") : schema;
        })
    })
  
    return ( 
    <Container className="my-3">
        <Row className="mb-3">
            <Col>
                <h4>User settings</h4>
                <em>Edit your profile</em>
            </Col>
        </Row>
        <Row>
            <Col>
                <Formik
                    initialValues={{username: user.username, password: "", password2: ""}}
                    onSubmit={(values, actions) => onFormSubmit(values, actions)}
                    validationSchema={validSchema}
                >    
                    {({handleChange, handleBlur, values, errors, touched, handleSubmit}) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control name="username" type="text" placeholder="Enter username" isValid={!errors.username} isInvalid={!!errors.username}
                                    value={values.username} onChange={handleChange} onBlur={handleBlur} />
                                <Form.Control.Feedback type="invalid">{errors.username ? errors.username : null}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="oldPassword" type="password" isInvalid={!!errors.oldPassword} onChange={handleChange} 
                                    onBlur={handleBlur} placeholder="Enter current password" />
                                <Form.Control.Feedback type="invalid">{errors.oldPassword ? errors.oldPassword : null}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control name="password" className="mb-2" isInvalid={!!errors.password} isValid={touched.password && !errors.password} onBlur={handleBlur} 
                                    onChange={handleChange} type="password" placeholder="Enter new password" />
                                <Form.Control.Feedback type="invalid">{errors.password ? errors.password : null}</Form.Control.Feedback>
                                <Form.Control name="password2" className="mb-2" isInvalid={!!errors.password2} isValid={touched.password2 &&!errors.password2} onBlur={handleBlur} 
                                    onChange={handleChange} type="password" placeholder="Confirm new password" />
                                <Form.Control.Feedback type="invalid">{errors.password2 ? errors.password2 : null}</Form.Control.Feedback>
                                <Form.Text id="passwordHelpBlock" className="text-white">
                                    Your new password must be 8-20 characters long, contain letters and numbers, and
                                    must not contain spaces, special characters, or emoji.
                                </Form.Text>
                                <br></br>
                                <Form.Text id="passwordHelpBlock" className="text-warning">
                                    If you only wish to update your username, leave the new password fields blank.
                                </Form.Text>
                            </Form.Group>
                            <Button variant="dark" type="submit">
                                Save
                            </Button>
                            <Form.Text id="passwordHelpBlock" className={success ? "text-success" :"text-warning"}>
                                {formResponse?.length > 0 ? formResponse : ""}
                            </Form.Text>
                        </Form>
                    )}
                    
                </Formik>
            </Col>
        </Row>
    </Container> );
}

export default UserSettings;