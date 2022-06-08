import { useContext } from "react";
import { Container, Row } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";

function Home() {
    const {user} = useContext(AuthContext);

    return ( <Container>
        <Row>
            <h2>Home</h2>
        </Row>
    </Container> );
}

export default Home;