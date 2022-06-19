import { useContext } from "react";
import { Container, Row } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";

function Home() {
    const {user} = useContext(AuthContext);
    const username = user ? user.username : null;
    return ( <Container>
        <Row>
            <h2>Home</h2>
            {user ? <p>Welcome {username}</p> : <p>Please log in</p>}
        </Row>
    </Container> );
}

export default Home;