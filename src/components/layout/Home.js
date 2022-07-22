import { useContext } from "react";
import { Container, Row } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";

function Home() {
    const {user} = useContext(AuthContext);
    const username = user ? user.username : null;
    return ( <Container>
        <Row>
            
            {user ? <><h2>Home</h2><p>Welcome {username}</p></> : <p>Please log in or register</p>}
        </Row>
    </Container> );
}

export default Home;