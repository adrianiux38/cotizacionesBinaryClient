import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
const styles = StyleSheet.create({
    container: {
      backgroundColor: "#f5f5f5",
      padding: 20,
      borderRadius: 10,
      textAlign: "center"
    },
    headText: {
        marginBottom:30
    },
    logo: {
      textAlign: "center"
    },
    companyName: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 20
    },
    companyAddress: {
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 10,
      marginBottom: 10
    },
    contactInfo: {
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 10
    },
    quotationContent: {
      textAlign: "left",
      marginTop: 20
    },
    table: { 
      display: "table", 
      width: "auto", 
      borderStyle: "solid", 
      borderWidth: 1, 
      borderRightWidth: 0, 
      borderBottomWidth: 0 
    }, 
    tableRow: { 
      margin: "auto", 
      flexDirection: "row",
    }, 
    tableCol: { 
      width: "25%", 
      borderStyle: "solid", 
      borderWidth: 1, 
      borderLeftWidth: 0, 
      borderTopWidth: 0 
    }, 
    tableCell: { 
      margin: "auto", 
      marginTop: 5, 
      fontSize: 10,
      marginBottom:5,
      marginLeft:4,
      marginRight:4
    },
    totalFinal: {
      margin: "auto", 
      marginTop: 5, 
      fontSize: 10,
      marginBottom:5,
      fontWeight:'bold'
    },
    quotationBrief: {
        fontSize: 12
    }
    });
    
    const Quotation = ({ quotation, total, quotationBrief }) => {
     var totalSum = parseFloat(total).toFixed(2).toString().replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return (
    <Document>
    <Page>
    <View style={styles.container}>
    <View style={styles.logo}>
    <Image style={{width:'30%'}} src={require("../components/binary.png")}/>
    </View>
    <View style={styles.companyName}>
    <Text>Binary Analytics S.A. de C.V.</Text>
    </View>
    <View style={styles.companyAddress}>
    <Text>Av. Santa Fe 94, Torre A, piso 8</Text>
    <Text>adrian.gutierrez@binarypolitics.mx</Text>
    <Text>www.binarypolitics.org</Text>
    </View>
    <View style={styles.quotationBrief}>
        <Text>{quotationBrief}</Text>
    </View>
    <View style={styles.quotationContent}>
    <Text style={styles.headText}>Cotización</Text>
    <View style={styles.table}> 
      <View style={styles.tableRow}> 
        <View style={styles.tableCol}> 
          <Text style={styles.tableCell}>Descripción</Text> 
        </View> 
        <View style={styles.tableCol}> 
          <Text style={styles.tableCell}>Precio (MXN)</Text> 
        </View> 
        <View style={styles.tableCol}> 
          <Text style={styles.tableCell}>Cantidad</Text> 
        </View>
        <View style={styles.tableCol}> 
          <Text style={styles.tableCell}>Total (MXN)</Text> 
        </View> 
      </View>
      {quotation.map((service) => {
        var precioTotal = parseFloat(service.totalPrice).toFixed(2).toString().replace(/\d(?=(\d{3})+\.)/g, '$&,');
        var price = parseFloat(service.price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        function numberWithCommas(x) {
          const number = parseInt(x, 10); // Parse the string as an integer
          return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return (
      <View style={styles.tableRow} key={service.name}> 
        <View style={styles.tableCol}> 
        {service.paymentPlan === "pago_fijo" && 
          <Text style={styles.tableCell}>{service.name}</Text> 
        }
        {service.paymentPlan === "pago_mensual" && 
          <Text style={styles.tableCell}>Servicio mensual de {service.quantityPerMonth} {service.name}</Text> 
        }
        </View> 
        <View style={styles.tableCol}>
        {service.paymentPlan === "pago_fijo" && 
          <Text style={styles.tableCell}>${price}</Text> 
        }
        {service.paymentPlan === "pago_mensual" && 
         <Text style={styles.tableCell}>${service.pricePerMonth}</Text>  
        }
        </View> 
        <View style={styles.tableCol}> 
        {service.paymentPlan === "pago_fijo" && 
          <Text style={styles.tableCell}>{numberWithCommas(service.quantity)}</Text> 
        }
        {service.paymentPlan === "pago_mensual" && 
          <Text style={styles.tableCell}>{service.monthQuantity} Meses</Text> 
        }
        </View> 
        <View style={styles.tableCol}> 
          <Text style={styles.tableCell}>${precioTotal}</Text> 
        </View> 
      </View>
        )
      })}
      <View style={styles.tableRow}> 
        <View style={styles.tableCol}> 
          <Text style={styles.totalFinal}>Total</Text> 
        </View>
        <View style={styles.tableCol}>continue</View>
        <View style={styles.tableCol}>continue</View>
        <View style={styles.tableCol}> 
          <Text style={styles.totalFinal}>${totalSum}</Text> 
        </View> 
      </View> 
    </View>
    </View>
    </View>
    </Page>
    </Document>
    );
    };
    
    export default Quotation;