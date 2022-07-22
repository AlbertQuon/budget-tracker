import { useState } from "react";
import { Button, Container, Modal } from "react-bootstrap";

function ConfirmBox({promptText, onConfirm, onCancel}) {
    const [showBox, setShowBox] = useState(false);
    return ( <Modal>
        <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>{promptText}</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBox(false)}>No</Button>
            <Button variant="primary" onClick={() => setShowBox(false)}>Confirm</Button>
        </Modal.Footer>
    </Modal> );
}

export default ConfirmBox;