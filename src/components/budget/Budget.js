import { useContext, useEffect, useState, useRef } from "react";
import { Container, Row, Form, Card, Button, Col, Badge, Modal, ModalBody, Tab, Tabs, CloseButton } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import BudgetDetails from "./BudgetDetails";
import BudgetForm from "./BudgetForm";
import dayjs from "dayjs";
import TransactPrefs from "./TransactPrefs";
import '../../css/Budget.css'
import GraphIcon from './../../images/graph-icon-w.png'
import CustomPagination from "../layout/CustomPagination";

function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [purcCategories, setPurcCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [purchases, setPurchases] = useState({});
    const [spendLimits, setSpendLimits] = useState({});
    const [incomes, setIncomes] = useState({});
    
    const api = useAxios();

    const [showDeleteBox, setShowDeleteBox] = useState(false);
    const [pendingDeletionBudget, setPendingDeletionBudget] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    const [showBudgetDetail, setShowBudgetDetail] = useState(false);
    const handleShowDetails = () => setShowBudgetDetail(true);
    const handleCloseDetails = () => setShowBudgetDetail(false);
    const [detailedBudget, setDetailedBudget] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const PAGE_INTERVAL = 2;

    const fetchData = () => {
        api.get('/budget/')
        .then(res => {
            setBudgets(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/purchasecategory/')
        .then(res => {
            setPurcCategories(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/budgetLimits/').then(res=> {
            let limits = res.data;
            let spendLimitsData = {}
            limits.forEach(limit => {
                if (!spendLimitsData.hasOwnProperty(limit.budget)) {
                    spendLimitsData[limit.budget] = [limit];
                } else {
                    spendLimitsData[limit.budget].push(limit);
                }
            });
            setSpendLimits(spendLimitsData);
        });
    
        api.get('/transactions/')
        .then(res => {
            setTransactions(res.data);
        }).catch(err => {console.log(err)});

        api.get('/purchases/')
        .then(res => {
            let purchases = res.data;
            let purchasesData = {};
            purchases.forEach(purc => {
                if (!purchasesData.hasOwnProperty(purc.transact)) {
                    purchasesData[purc.transact] = [purc];
                } else {
                    purchasesData[purc.transact].push(purc);
                }
            });
            setPurchases(purchasesData);
        });

        api.get('/budgetIncomes/')
        .then(res => {
            let incomesData = res.data;
            let tempIncomesData = {};
            incomesData.forEach(income => {
                if (!tempIncomesData.hasOwnProperty(income.budget)) {
                    tempIncomesData[income.budget] = [income];
                } else {
                    tempIncomesData[income.budget].push(income);
                }
            });
            setIncomes(tempIncomesData);
        })
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onBudgetDelete = (id) => {
        const url = `/budget/${id}/`
        api.delete(url, {
            data: {budget_id : id}
        })
        .then(() => {
            let newBudgets = budgets.filter((budget) => budget.budget_id !== id);
            setBudgets(newBudgets);
            setShowDeleteBox(false);
        }).catch(err => {
            console.log(err);
        });
    }

    const createSpendLimitList = (budget_id) => {
        
        if (Object.keys(spendLimits).length === 0 || spendLimits[budget_id] === undefined || !purcCategories) {
            return <Card.Text>No spend limits found</Card.Text>;
        }
        const limitsList = [];
        spendLimits[budget_id].forEach((limit)=>{
            let purcCtgy = purcCategories.find(ctgy => ctgy.purc_category_id === limit.purc_category);
            if (purcCtgy !== undefined) {
                let purcCtgyTotal = 0;
                
                for (let transact in purchases) {
                    if (purchases.hasOwnProperty(transact) && transactions.find((transaction) => transaction.transact_id.toString()===transact)?.budget === budget_id) {
                        let purcCtgyPurchases = purchases[transact].filter(purc => purc.purc_category && purc.purc_category === limit.purc_category);
                        purcCtgyPurchases.forEach((purc)=> purcCtgyTotal += parseFloat((purc.price/100).toFixed(2)));
                    }
                }
                limitsList.push(
                    <Card.Text key={limit.id}>
                    {purcCtgy.purc_category_name}: 
                    ${purcCtgyTotal.toFixed(2)}/{(limit.spend_limit/100).toFixed(2)} </Card.Text>
                );
            }
        });
        
        return limitsList.length > 0 ? limitsList : <Card.Text>No spend limits found</Card.Text>;
    }

    const createIncomeList = (budget_id) => {
        if (Object.keys(incomes).length === 0 || incomes[budget_id] === undefined) {
            return <Card.Text>No incomes found</Card.Text>;
        }
        const incomesList = [];
        let totalIncome = 0;

        incomes[budget_id].forEach((income, index) => {
            totalIncome += income.income_amount/100;
            incomesList.push(
            <Card.Text key={index}>
                {income.income_name}: ${(income.income_amount/100).toFixed(2)}
            </Card.Text>)
        });

        incomesList.push(<Card.Text>Total: ${totalIncome.toFixed(2)}</Card.Text>)

        return incomesList.length > 0 ? incomesList : <Card.Text>No incomes found</Card.Text>;
    }


    // Components
    const ConfirmDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowDeleteBox(false)}>
            <Modal.Header>
                <Modal.Title>Confirmation</Modal.Title>
                <CloseButton variant='white' onClick={() => setShowDeleteBox(false)}/>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this budget?</p>
                <p className="text-danger">This will delete all transactions associated with this budget</p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="custom-btn" onClick={() => setShowDeleteBox(false)}>No</Button>
                <Button className="custom-btn-negative" onClick={() => onBudgetDelete(pendingDeletionBudget)}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    }

    // Child data
    const detailedBudgetPurchases = () => {
        if (detailedBudget) {
            let budgetPurchases = [];
            transactions.filter(transact => transact.budget === detailedBudget.budget_id)
            .sort(
                function(a,b){
                    return dayjs(a.transact_date).diff(dayjs(b.transact_date));
                })
            .forEach(transact => {purchases[transact.transact_id].forEach(purc => budgetPurchases.push({...purc, date: transact.transact_date}));}
            );
            return budgetPurchases;
        }
        return [];
    }

    const detailedBudgetIncome = () => {
        if (detailedBudget) {
            return incomes[detailedBudget.budget_id] ? incomes[detailedBudget.budget_id] : [];
        }
        return [];
    }

    const detailedBudgetSpendLimits = () => {
        if (detailedBudget) {
            return spendLimits[detailedBudget.budget_id] ? spendLimits[detailedBudget.budget_id] : [];
        }
        return [];
    }

   
    return ( 
    <Container className="">
        <Tabs className="tab-headers" justify>
            <Tab className="" eventKey="budgetView" title="Budgets">
                <Row className="pt-3">
                    <Col><h3>Current budgets</h3></Col>
                    <Col xs={3} md={2}><Button className="custom-btn" onClick={handleShowForm}>Add budget</Button></Col>
                </Row>
                <BudgetForm api={api} fetchData={fetchData} showForm={showForm} purcCategories={purcCategories} handleCloseForm={handleCloseForm} 
                    budgets={budgets} setBudgets={setBudgets} spendLimits={spendLimits} setSpendLimits={setSpendLimits}/>
                <BudgetDetails purcCategories={purcCategories} purchases={detailedBudgetPurchases()} incomes={detailedBudgetIncome()} 
                    budget={detailedBudget} spendLimits={detailedBudgetSpendLimits()} showBudgetDetail={showBudgetDetail} handleCloseDetails={handleCloseDetails}/>
                {ConfirmDeleteBox()}
                <Row className="mb-3">
                    {budgets.filter((budget)=> (dayjs(budget.end_time).diff(dayjs(),'day') >= 0)).map((budget, index)=>(
                        <Col xs={3} md={3} key={index} className="my-2">
                            <Card className="card-budget" key={budget.budget_id}>
                                <Card.Body>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <Card.Title>
                                                    {budget.budget_name} 
                                                    <Button className="mx-2 custom-btn" onClick={() => {setDetailedBudget(budget); handleShowDetails();}}>
                                                        <img src={GraphIcon} className='my-1' style={{'width':'1.25em', 'height': '1.25em', 'padding':'auto'}}/>
                                                    </Button>
                                                </Card.Title>
                                            </Col>
                                        </Row>
                                        <Row className="my-2 py-1">
                                            <Col>
                                                <Card.Subtitle className=""><strong>{budget.start_time}</strong></Card.Subtitle>
                                            </Col>
                                            <Col>
                                                <Card.Subtitle className="mb-1"><strong>{budget.end_time}</strong></Card.Subtitle>
                                            </Col>
                                        </Row>
                                        <Row className="card-budget-income py-2">
                                            <Col>
                                                <Card.Text><strong>Income</strong></Card.Text>
                                                {createIncomeList(budget.budget_id)}
                                            </Col>
                                        </Row>
                                        <Row className="card-budget-income mb-2 mt-3 py-3">
                                            <Col>
                                                <Card.Text><strong>Spend Limits</strong></Card.Text>
                                                    {createSpendLimitList(budget.budget_id)}
                                            </Col>
                                        </Row>
                                        <Row className="mb-2 mt-3">
                                            <Col>
                                                <Card.Text><Button className="custom-btn-negative" onClick={() => {setPendingDeletionBudget(budget.budget_id); setShowDeleteBox(true);}}>Delete</Button></Card.Text>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row className="mb-2 pt-3 past-budget-header"><h3>Past budgets</h3></Row>
                <Row>
                    {budgets.filter((budget)=> (dayjs(budget.end_time).diff(dayjs(),'day') <= -1))
                        .slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE)
                        .map((budget, index)=>(
                        <Col xs={3} md={3} key={index} className="my-2">
                            <Card className="card-budget" key={budget.budget_id}>
                                <Card.Body>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <Card.Title>
                                                    {budget.budget_name} 
                                                    <Button className="mx-2 ms-5 custom-btn" onClick={() => {setDetailedBudget(budget); handleShowDetails();}}>
                                                        <img src={GraphIcon} className='my-1' style={{'width':'1.25em', 'height': '1.25em', 'padding':'auto'}}/>
                                                    </Button>
                                                </Card.Title>
                                            </Col>
                                        </Row>
                                        <Row className="my-1 py-2 border-bottom">
                                            <Col>
                                                <Card.Subtitle className=""><strong>{budget.start_time}</strong></Card.Subtitle>
                                            </Col>
                                            <Col>
                                                <Card.Subtitle className="mb-1"><strong>{budget.end_time}</strong></Card.Subtitle>
                                            </Col>
                                        </Row>
                                        <Row className="mt-3 py-1">
                                            <Col>
                                                <Card.Text><Button className="custom-btn-negative" onClick={() => {setPendingDeletionBudget(budget.budget_id); setShowDeleteBox(true);}}>Delete</Button></Card.Text>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row className="my-5 justify-content-md-center">
                    <Col md='auto'>
                        <CustomPagination
                            totalItems={budgets.filter((budget)=> (dayjs(budget.end_time).diff(dayjs(),'day') <= -1)).length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                            pagesInterval={PAGE_INTERVAL}
                        />
                    </Col>
                </Row>
            </Tab>
            <Tab eventKey="transactPrefs" title="Categories">
                <TransactPrefs purcCategories={purcCategories} setPurcCategories={setPurcCategories}/>
            </Tab>
        </Tabs>
    </Container> );
}

export default Budget;