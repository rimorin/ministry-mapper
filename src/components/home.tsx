import React, { MouseEventHandler, useEffect, useState } from 'react';
import './../App.css';
import { ref, get, child, onValue, DataSnapshot, set} from "firebase/database";
import database from './../firebase';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


interface homeProps {
  postalcode?: String
  name?: String
}

interface unitDetails {
  number: String,
  done: Boolean,
  dnc: Boolean,
  note: String,
  type: String
}

interface floorDetails {
  floor: String,
  units: Array<unitDetails>
}

interface unitProps {
  isDone?: Boolean,
  isDnc?: Boolean
}
 
function Home({postalcode, name} :homeProps) {

  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const postalReference = child(ref(database),`/${postalcode}`);

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  function processData(data: DataSnapshot) {
    let dataList = []
    for(const floor in data.val()) {
      let unitsDetails = [];
      const units = data.val()[floor];
      for(const unit in units) {
        unitsDetails.push({number: unit, done: units[unit]["done"], dnc: units[unit]["dnc"], note: units[unit]["note"], type: units[unit]["type"] });
      }
      dataList.push({floor: floor, units: unitsDetails});
    }
    console.log(dataList);
    setFloors(dataList);
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    toggleModal();
  };

  const handleClickModal = (event: React.MouseEvent<HTMLElement>, floor: String, unit: String) => {
    setValues({ ...values, floor : floor,  unit : unit, done: false, dnc: false, type: "cn", notes: ""});
    toggleModal();
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    // console.log(event.currentTarget);
    console.log(values);
    // const { floor, unit, done, dnc, type } = values;

    // set(ref(db, `/${postalcode}/${values.floor}`), {
    //   username: name,
    //   email: email,
    //   profile_picture : imageUrl
    // });
  };

  const onFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    // console.log(e.target.checked);
    const {name, value, checked } = e.target  as HTMLInputElement;

    if (name === "done" || name === "dnc") {
      setValues({ ...values, [name]: checked });
    } else {
      setValues({ ...values, [name]: value });
    }
    
    console.log(name, value, checked);
  };

  function UnitStatus(props: unitProps) {
    const isDone = props.isDone;
    const isDnc = props.isDnc;
    let status;
    if (isDone) {
      status = "✅";
    }

    if (isDnc) {
      status = "❌";
    }

    return <div>{status}</div>;
  }


  useEffect(() => {
    onValue(postalReference, (snapshot) => {
        if (snapshot.exists()) {
            console.log("Getting data");
            processData(snapshot);
        }
    });
    // Update the document title using the browser API
  }, []);

  if (floors.length === 0) {
    return <div></div>
  }
  return (
    <div>
      <table className="table table-bordered">
        <caption><a href={`http://maps.google.com.sg/maps?q=${postalcode}`} target="blank">{name}, {postalcode}</a></caption>
        <thead>
        <tr>
          <th scope="col">lvl</th>
        {floors && floors[0].units.map((item,index)=>
           <th key={`${index}-${item.number}`} scope="col">{item.number}</th>
        )}
        </tr>
        </thead>
        <tbody>
        {floors && floors.map((item,index)=>
           <tr key={`row-${index}`}>
           <th key={`${index}-${item.floor}`}  scope="row">{item.floor}</th>
           {item.units.map((element,index)=>(
              <td onClick={(event) => handleClickModal(event, item.floor, element.number)} key={`${item.floor}-${element.number}`}><UnitStatus isDone={element.done} isDnc={element.dnc}/></td>
           ))}
           </tr>
        )}
        </tbody>
      </table>
      <Modal show={isOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitClick}>
        <Modal.Body>
        
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check onChange={onFormChange} name='done' type="checkbox" label="Done" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check onChange={onFormChange} name='dnc' type="checkbox" label="DNC" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Household</Form.Label>  
          <Form.Select onChange={onFormChange} name='household' aria-label="Default select example">
            <option value="cn">Chinese</option>
            <option value="tm">Tamil</option>
            <option value="ml">Muslim</option>
          </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Notes</Form.Label>
            <Form.Control onChange={onFormChange} name='notes' as="textarea" rows={3} aria-label="With textarea"/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClick}>
            Close
          </Button>
          <Button type='submit' variant="primary">
            Save Changes
          </Button>
        </Modal.Footer>
        </Form>
      </Modal>
      </div>
  );
}
 
export default Home;