import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionReceiptProps {
  transaction: {
    id: string;
    type: string;
    amount: number;
    recipient?: string;
    reference: string;
    date: string;
    status: string;
    description?: string;
    fee?: number;
    total?: number;
  };
}

export const generateHTMLReceipt = (transaction: any) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'airtime':
        return '📱';
      case 'data':
        return '📶';
      case 'transfer':
        return '💸';
      case 'electricity':
        return '⚡';
      case 'cable tv':
        return '📺';
      case 'education':
        return '🎓';
      case 'betting':
        return '🎲';
      default:
        return '💳';
    }
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NetPay Transaction Receipt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .receipt-title {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .transaction-icon {
            font-size: 48px;
            margin: 20px 0;
        }
        
        .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        .amount-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: ${transaction.amount > 0 ? '#4CAF50' : '#FF6B35'};
        }
        
        .transaction-type {
            font-size: 16px;
            color: #333;
            margin-top: 5px;
        }
        
        .details-section {
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .detail-label {
            font-size: 14px;
            color: #666;
        }
        
        .detail-value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
            text-align: right;
        }
        
        .reference {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 20px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        
        .footer-text {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        
        .qr-code {
            text-align: center;
            margin: 20px 0;
            font-size: 24px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .receipt-container {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="logo">NetPay</div>
            <div class="receipt-title">Transaction Receipt</div>
            <div class="transaction-icon">${getTransactionIcon(transaction.type)}</div>
            <div class="status-badge">${transaction.status}</div>
        </div>
        
        <div class="content">
            <div class="amount-section">
                <div class="amount-label">Amount</div>
                <div class="amount">${formatAmount(transaction.amount)}</div>
                <div class="transaction-type">${transaction.type}</div>
            </div>
            
            <div class="details-section">
                ${transaction.recipient ? `
                <div class="detail-row">
                    <div class="detail-label">Recipient</div>
                    <div class="detail-value">${transaction.recipient}</div>
                </div>
                ` : ''}
                
                <div class="detail-row">
                    <div class="detail-label">Date & Time</div>
                    <div class="detail-value">${formatDate(transaction.date)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Transaction ID</div>
                    <div class="detail-value">${transaction.id}</div>
                </div>
                
                ${transaction.fee ? `
                <div class="detail-row">
                    <div class="detail-label">Fee</div>
                    <div class="detail-value">₦${transaction.fee.toLocaleString()}</div>
                </div>
                ` : ''}
                
                ${transaction.total ? `
                <div class="detail-row">
                    <div class="detail-label">Total</div>
                    <div class="detail-value">₦${transaction.total.toLocaleString()}</div>
                </div>
                ` : ''}
                
                ${transaction.description ? `
                <div class="detail-row">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${transaction.description}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="reference">
                Reference: ${transaction.reference}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                This is an official NetPay transaction receipt.<br>
                For support, contact us at support@netpay.com<br>
                Thank you for using NetPay!
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return html;
};

export default function TransactionReceipt({ transaction }: TransactionReceiptProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Receipt</Text>
      <Text style={styles.subtitle}>HTML receipt generated successfully</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
}); 