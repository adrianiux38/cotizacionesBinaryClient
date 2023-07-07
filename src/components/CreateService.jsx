import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from './NavBar';
import {React, useState} from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';

const CreateService = () => {
  const navigate = useNavigate();
  const [newService, setNewService] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    esquema: ""
  });

  const handleChangeDescription = e => {
    setNewService({
      ...newService,
      descripcion: e.target.value
    });
  };

  const handleChangeName = e => {
    setNewService({
      ...newService,
      nombre: e.target.value
    });
  };

  const handleChangePrice = values => {
    const {floatValue} = values;
    setNewService({
      ...newService,
      precio: floatValue
    });
  };

  const handleChangePaymentPlan = e => {
    setNewService({
      ...newService,
      esquema: e.target.value
    });
  };

  const handleAddService = async () => {
    return new Promise(async (resolve, reject) => {
      try {
      const response = await fetch("https://binaryquotations.herokuapp.com/createService", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newService.nombre,
          descripcion: newService.descripcion,
          precio: newService.precio,
          esquema: newService.esquema
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
          alert(`Service created successfully`);
      } else {
          console.error(
          "Error creating service",
          data.error
          );
          reject()
      }
      } catch (error) {
          reject()

      }
      navigate('/');
      resolve();
    });
  };

  return (
    <div>
      <NavBar/>
      <h2 id="addService">Agregar nuevo servicio</h2>
      <div style={{ width:'100vw', display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch'},
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            id="nombre"
            label="nombre"
            name='nombre'
            value={newService.nombre || ""}
            onChange={handleChangeName}
          />
          <TextField
            id="descripcion"
            label="descripcion"
            name='descripcion'
            value={newService.descripcion || ""}
            onChange={handleChangeDescription}
          />
          <NumericFormat
            customInput={TextField}
            id="precio"
            label="Precio"
            value={newService.precio || ''}
            onValueChange={(values) => handleChangePrice(values)}
            thousandSeparator={true}
            decimalScale={3}
            prefix={'$'}
            isNumericString={true}
          />
          <FormControl fullWidth variant="standard">
            <InputLabel id="esquema">Esquema</InputLabel>
            <Select
              labelId="esquema"
              id="esquema"
              value={newService.esquema}
              label="Esquema"
              onChange={handleChangePaymentPlan}
            >
              <MenuItem value="pago_fijo">Pago Fijo</MenuItem>
              <MenuItem value="pago_mensual">Pago Mensual</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" id="addServiceButton" onClick={handleAddService}>Agregar servicio</Button>
      </div>
    </div>
  )
}

export default CreateService;