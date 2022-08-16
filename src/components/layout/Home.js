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
            <Card className="bg-dark my-3 py-3 px-2">
                <Card.Title>Welcome {username}!</Card.Title>
                <Card.Subtitle>How to start</Card.Subtitle>
                <Card.Text>
                    <strong>Step 1:</strong> Create purchase categories and optionally create tax categories
                </Card.Text>
                <Card.Text>
                    <strong>Step 2:</strong> Create a budget
                </Card.Text>
                <Card.Text>
                    <strong>Step 3:</strong> Add transactions to budget to start tracking 
                </Card.Text>
                <Card.Text>
                    <strong>Step 4:</strong> Analyze your budget after its period has ended. Add a new budget to continue.
                </Card.Text>
            </Card>
            <Card className="bg-dark my-3 py-3 px-2">
                <Card.Title>Budget</Card.Title>
                <Card.Subtitle>Start here!</Card.Subtitle>
                <Card.Text>
                    Create or view your budgets. Add and manage purchase categories and tax categories to add transactions.
                </Card.Text>
                <Button className="custom-btn" as={Link} to="/budget">Visit budgets</Button>
            </Card>
            <Card className="bg-dark my-3 py-3 px-2">
                <Card.Title>Transactions</Card.Title>
                <Card.Text>
                    Add, edit, or delete transactions.
                </Card.Text>
                <Button className="custom-btn" as={Link} to='/transactions/'>Visit transactions</Button>
            </Card>
            </div> : 
            
            <p>Please log in or register</p>}
        </Row>
    </Container> );
}

export default Home;