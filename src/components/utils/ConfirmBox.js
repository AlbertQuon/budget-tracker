import { Container, Modal } from "react-bootstrap";

function ConfirmBox({promptText, callback}) {
    return ( <Modal>
        <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>{promptText}</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary">No</Button>
            <Button variant="primary">Save changes</Button>
        </Modal.Footer>
    </Modal> );
}

export default ConfirmBox;