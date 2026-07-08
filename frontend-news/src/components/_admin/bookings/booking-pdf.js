import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 24, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 12, color: 'gray' },
  value: { fontSize: 14 }
});

export default function BookingPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Booking Invoice</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{data?.bookingID || data?._id}</Text>
          </View>
          <View>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{data?.customer?.firstName} {data?.customer?.lastName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>₹{Number(data?.paymentAmount || 0).toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
