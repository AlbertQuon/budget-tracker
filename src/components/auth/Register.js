import { useContext } from 'react';
import {Container, Form, Button, Row, FloatingLabel} from 'react-bootstrap'
import AuthContext from './AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

function Register() {

    const { registerUser } = useContext(AuthContext);

    const onFormSubmit = (values, actions) => {
        return registerUser(values.username, values.password, values.password2);
    }

    const initialValues = {username: "", password: "", password2: ""}

    const validSchema = Yup.object().shape({
        username: Yup.string()
            .min(4, "Username must be greater than 3 characters")
            .required("Please enter a username")
            .matches(/[a-zA-Z0-9]/, "Username cannot only be numbers and must cannot contain symbols"),
        password: Yup.string()
            .required('Please enter a password')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must contain at least 8 characters, One Uppercase, One Lowercase, One Number and One Special Case Character"),
        password2: Yup.string()
            .required("Please confirm your password")
            .min(8, "")
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    })

    return ( 
    <Container className="my-2">
        <Row className="my-2">
            <h3>Register</h3>
        </Row>
        <Row>
            <Formik
                initialValues={initialValues}
                validationSchema={validSchema}
                onSubmit={(values, actions) => onFormSubmit(values, actions)}
                validateOnChange={false}
                validateOnBlur={false}
            >
                {({handleChange, handleBlur, values, errors, touched, handleSubmit, isValid}) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <FloatingLabel
                                label="Username"
                                className="mb-3 input-label"
                            >
                                <Form.Control type="text" name="username"
                                    isInvalid={!!errors.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Form.Text className={!!errors.username ? 'text-danger' : ''}>
                                    {!!errors.username ? errors.username : 
                                        'Your username must be at least 4 characters long and must not contain special characters or emoji.'
                                    }
                                </Form.Text>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <FloatingLabel
                                label="Password"
                                className="mb-3 input-label"
                            >
                                <Form.Control type="password" name="password" 
                                    isInvalid={!!errors.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Form.Text className={!!errors.password ? 'text-danger' : ''}>
                                    {!!errors.password ? errors.password : 
                                        'The password must contain at least 8 characters, One Uppercase, \
                                        One Lowercase, One Number and One Special Case Character.' 
                                    }
                                </Form.Text>
                            </FloatingLabel>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <FloatingLabel
                                controlId="password2"
                                label="Confirm Password"
                                className="mb-3 input-label"
                            >
                                <Form.Control type="password" name="password2" 
                                    onChange={handleChange}
                                    isInvalid={!!errors.password2}
                                    onBlur={handleBlur}
                                />
                                <Form.Text className={!!errors.password2 ? 'text-danger' : ''}>
                                    {!!errors.password2 ? errors.password2 : 
                                        null
                                    }
                                </Form.Text>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group>
                            <Form.Text className="text-info"></Form.Text>
                        </Form.Group>
                        
                        <Button className='custom-btn' type="submit">
                            Register
                        </Button>
                    </Form>
                )}

            </Formik>
            
        </Row>
    </Container> );
}

export default Register;