import './Cotizador.css'
import React, { useState, useEffect } from "react";
import NavBar from '../NavBar';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,

} from "reactstrap";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Quotation from '../Quotation'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [quotation, setQuotation] = useState([]);
  const [total, setTotal] = useState(0);
  const [quotationBrief, setQuotationBrief] = useState("");

  //para mostrar el overview de la cotización 
  const [visible, setVisible] = useState(false);
  const changeVisibility = () => {
    if (quotation.length > 0){
      setQuotationBrief('');
      setVisible(!visible)
    }
  }

  const [pdfVisible, setPdfVisible] = useState(false);
  const [alerta, setAlerta] = useState("")

  const createPdf = () => {
    if (quotation.length > 0 && quotationBrief !== ""){
      setPdfVisible(true)
    } else { 
      setAlerta("Escribe la descripción antes de crear la cotización");
    }
  }



  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    fetch("http://localhost:3001/getData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((res) => res.json())
      .then((data) => {
        //console.log(data);
        const modifiedServices = data.map(service => {
          service.precio = parseFloat(service.precio).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          return service;
        });
        setServices(modifiedServices);
      })
      .catch(err => console.log(err))
   
  };

  
  
  const handleQuotationBriefChange = e => {
    setQuotationBrief(e.target.value)
  }


  const handleCreateQuotation = async () => {
    const servicesCopy = services.map(service => {
      if(service.esquema == "pago_mensual"){
        //primero tenemos que ver que el esquema de pago sea diferente a mensual
        var quantityxmonth = getValueFromTextField(service.id);
        //si es pago mensual desde el inicio (no era servicio de pago único y luego se convirtió a mensual) 
        return {...service, quantityxmonth}
      } else if (service.esquema == "pago_fijo") {
        //primero tenemos que ver qué servicios son los que se convirtieron a mensuales
        var monthConversionselected = checkMonthConvert(`checkmonth${service.id}`);
        //luego tenemos que ver la cantidad de meses que va a estar activo el servicio
        if (monthConversionselected){
          //aquí convertimos el esquema de pago del servicio a pago_mensual 
          service.esquema = "pago_mensual";
          delete service.quantity;
          var quantityxmonth = getValueFromTextField(service.id);
          var monthQuantity = getMonthQuantity(`monthquantity${service.id}`);
          return {...service, quantityxmonth, monthQuantity};
        } else {
          var quantity = getValueFromTextField(service.id);
          return {...service, quantity}
        }
      }
     });

     const servicesCopyFinal = servicesCopy.map(service => {
      var selected = checkSelected(`check${service.id}`);
       return {...service, selected};
     });
      let quotation = [];
      servicesCopyFinal.forEach(service => {
        if (service.selected) {
          if(service.esquema === "pago_mensual"){
            if(service.quantityxmonth && service.monthQuantity){
              var totalMonths = service.monthQuantity;
              var totalQuantity = totalMonths * service.quantityxmonth;
              var pricePerMonth = service.quantityxmonth * service.precio;
              //aquí tenemos que si el esquema es pago_mensual, entonces va a mandar el quantityxmonth y el monthQuantity
              quotation.push({
                name: service.nombre,
                description: service.descripcion,
                price: service.precio,
                paymentPlan: service.esquema,
                monthQuantity: service.monthQuantity,
                quantityPerMonth: service.quantityxmonth,
                pricePerMonth: pricePerMonth,
                totalQuantity: totalQuantity,
                totalPrice: parseFloat(service.precio).toFixed(2) * totalQuantity
              });
            } 
            //Nos falta pasarle la quantity cuando es pago fijo 
          } else if (service.esquema === "pago_fijo" && service.quantity) {
            quotation.push({
              name: service.nombre,
              description: service.descripcion,
              price: service.precio,
              paymentPlan: service.esquema,
              quantity: service.quantity,
              totalPrice: parseFloat(service.precio).toFixed(2) * service.quantity
            });
          }
        }
      });
      console.log(quotation);
      if(quotation.length > 0){
        console.log("esta es la cotización");
        setVisible(true);
        setQuotation(quotation);
        let totalPrice = 0;
        quotation.forEach(service => {
        totalPrice += service.totalPrice;
        });
        setTotal(totalPrice);
      } else {
        alert("Selecciona servicios y su cantidad para hacer la cotización")
      }    
    
    /*
    await fetch("https://binaryquotations.herokuapp.com/createQuotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({quotation}),
      })
        .then((res) => res.json())
        .then((data) => {
          //console.log(data);
        })
        .catch(err => console.log(err))
        */
  };


  const getValueFromTextField = (id) => {
    const textField = document.querySelector(`input[id="${id}"][name="quantity"]`);
    return textField.value;
  }

  //Obtener la cantidad de meses que va a estar activo el servicio 
  const getMonthQuantity = (id) => {
    const textField = document.querySelector(`input[id="${id}"][name="monthquantity"]`);
    return textField.value;
  }

  //verificar si el servicio se seleccionó para convertirlo en mensual
  const checkMonthConvert = (id) => {
    const monthConvertSelected = document.querySelector(`input[id="${id}"][type="checkbox"]`);
    return monthConvertSelected.checked;
  }

  const checkSelected = (id) => {
   const selected = document.querySelector(`input[id="${id}"][type="checkbox"]`);
    return selected.checked;
  };

  /*
  const handleChangeQuantity = (id, event) => {
    const quantity = event.target.value;
    const servicesCopy = services.map(service => {
      if (service.id === id) {
       return {...service, quantity};
      }
      return service;
     });
     setServices(servicesCopy);
  };
  */

  return (
    
    <div>
      <NavBar handleCreateQuotation={handleCreateQuotation}/>
      <h2>Servicios</h2>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
          <StyledTableRow>
            <StyledTableCell>Nombre</StyledTableCell>
            <StyledTableCell align="center">Descripción</StyledTableCell>
            <StyledTableCell align="center">Precio&nbsp;</StyledTableCell>
            <StyledTableCell align="center">Esquema de pago&nbsp;</StyledTableCell>
            <StyledTableCell align="center">Convertir mensual?&nbsp;</StyledTableCell>
            <StyledTableCell align="center">Cantidad (total/x mes)&nbsp;</StyledTableCell>
            <StyledTableCell align="center">No. Meses&nbsp;</StyledTableCell>
            <StyledTableCell align="center">Seleccionar&nbsp;</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
        {services.map(service => (
          <StyledTableRow key={service.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <StyledTableCell component="th" scope='row'>
                {service.nombre}
              </StyledTableCell>
              <StyledTableCell align='center'>{service.descripcion}</StyledTableCell>
              <StyledTableCell align='center'>${service.precio}</StyledTableCell>
              <StyledTableCell align='center'>{service.esquema}</StyledTableCell>
              <StyledTableCell align='center'>
                {service.esquema === "pago_fijo" && 
                  <Input
                    type="checkbox"
                    id={`checkmonth${service.id}`}
                  />
                }
              </StyledTableCell>
              <StyledTableCell align='center'>
              <Box
                component="form"
                sx={{
                  '& > :not(style)': { m: 1, width: '25ch'},
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  name='quantity'
                  type="number"
                  id={service.id}
                />
              </Box>
              </StyledTableCell>
              <StyledTableCell align='center'>
              <Box
                component="form"
                sx={{
                  '& > :not(style)': { m: 1, width: '25ch'},
                }}
                noValidate
                autoComplete="off"
              >
                
                <TextField
                  name='monthquantity'
                  type="number"
                  id={`monthquantity${service.id}`}
                />
              
              </Box>
              </StyledTableCell>
              <StyledTableCell align='center'>
              <Input
                type="checkbox"
                id={`check${service.id}`}
                />
              </StyledTableCell>
          </StyledTableRow>
              ))}
        </TableBody>
      </Table>
      </TableContainer>
      <Table>
      <Row>
       
      </Row>
      <Row>
      <Col>
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0,
        zIndex: 2, 
        height: '100%', 
        width: '100%', 
        display: visible ? "flex" : "none", 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <Card style={{
          display: visible ? "block" : "none", 
          backgroundColor: 'white', 
          borderRadius: '5px', 
          padding: '2%', 
          maxWidth: '80%', 
          textAlign: 'center',
          overflow: 'auto',
        }}>            
          <Button variant="contained" onClick={changeVisibility} style={{display:'flex', backgroundColor:'red', position: 'relative', top: '2%', right: '2%', float:'right'}}>
            Cerrar
          </Button>
            <h2 style={{textAlign:'center', marginLeft:'12%'}}>Cotización</h2>
            <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch'},
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="brief"
              label="Descripción de la cotización"
              name='brief'
              value={quotationBrief}
              onChange={handleQuotationBriefChange}
            />
          </Box>
          <p style={{color:'red', marginTop: '2%'}}>{alerta !== "" && (
                    alerta
                  )}
            </p>
            <CardHeader>
              <h3>Detalle de la cotización</h3>
            </CardHeader>
            <CardBody>
              {quotation.map(service => (
                <Row key={service.name}>
                {service.paymentPlan === "pago_fijo" && 
                  <Col>
                    <p style={{alignContent:'center'}}>
                    {service.name} ({Number(service.quantity).toLocaleString()}): ${Number(service.totalPrice).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </Col>
                }
                {service.paymentPlan === "pago_mensual" &&
                  <Col>
                  <p style={{alignContent:'center'}}>
                  Servicio mensual de {Number(service.quantityPerMonth).toLocaleString()} {service.name} al mes <span style={{fontWeight:'bold'}}>({Number(service.totalQuantity).toLocaleString()} en total)</span> : ${Number(service.totalPrice).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </Col>
                } 
                </Row> 
              ))}
              </CardBody>
           
            <CardFooter>
              <Row>
                <Col>
                  <h4>Total: ${Number(total).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                </Col>
              </Row>
              <Row>
                <Col>
                <Button variant="contained" onClick={createPdf} style={{display: 'flex', marginBottom: '5%', margin: '0 auto'}}>
                  Generar cotización
                </Button>
                  {pdfVisible && (
                    <PDFDownloadLink
                      document={<Quotation quotation={quotation} total={total} quotationBrief={quotationBrief}/>}
                      fileName="quotation.pdf"
                      style={{display:'flex', marginLeft: '35%', marginTop: '5%', marginBottom:'10%'}}
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? "Loading document..." : "Descargar cotización"
                      }
                    </PDFDownloadLink>
                  )}
                </Col>
              </Row>
            </CardFooter>
          </Card>
          </div>

        </Col>
      </Row>
      </Table>
      </div>
  );
};

export default ServicesPage;