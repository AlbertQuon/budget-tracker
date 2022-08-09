import { useContext } from "react";
import { Button, Card, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import AuthContext from "../auth/AuthContext";

function Home() {
    const {user} = useContext(AuthContext);
    const username = user ? user.username : null;
    return ( <Container>
        <Row>
            {user ? <div>
            <h2>Home</h2>
            <p>Welcome {username}</p>
            <Card className="bg-dark my-3 py-3 px-2">
                <Card.Title>Budget</Card.Title>
                <Card.Subtitle>Start here!</Card.Subtitle>
                <Card.Text>
                    Create or view your budgets. 
                </Card.Text>
                <Card.Text>
                    Add and manage purchase categories and tax categories to add transactions.
                </Card.Text>
                <Button as={Link} to="/budget">Visit budgets</Button>
            </Card>
            <Card className="bg-dark my-3 py-3 px-2">
                <Card.Title>Transactions</Card.Title>
                <Card.Subtitle>Manage transactions here!</Card.Subtitle>
                <Card.Text>
                    Add, edit, or delete transactions.
                </Card.Text>
                <Button as={Link} to='/transactions/'>Visit transactions</Button>
            </Card>
            </div> : 
            
            <p>Please log in or register</p>}
        </Row>
    </Container> );
}

export default Home;