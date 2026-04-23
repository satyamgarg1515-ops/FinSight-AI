import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Transaction from '../models/Transaction.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const router = express.Router();

// Helper to get tx
const fetchUserTransactions = async (userId, targetUserId = null) => {
  const query = {
    $or: [{ sender: userId }, { receiver: userId }],
    isDeleted: false
  };

  if (targetUserId && targetUserId !== 'all') {
    query.$or = [
      { sender: userId, receiver: targetUserId },
      { sender: targetUserId, receiver: userId }
    ];
  }
  
  return await Transaction.find(query)
    .populate('sender', 'username')
    .populate('receiver', 'username')
    .sort({ date: -1 });
};

// GET /api/exports/transactions/pdf?target=all
router.get('/transactions/pdf', protect, async (req, res) => {
  try {
    const transactions = await fetchUserTransactions(req.user._id, req.query.target);
    const doc = new PDFDocument({ margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('FinsightAI Transaction Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    transactions.forEach(tx => {
      const isSender = tx.sender._id.toString() === req.user._id.toString();
      const type = isSender ? 'Given to' : 'Received from';
      const counterpart = isSender ? tx.receiver?.username : tx.sender?.username;
      
      doc.text(
        `${new Date(tx.date).toLocaleDateString()} | ${type} ${counterpart} | $${tx.amount} | Note: ${tx.note || 'N/A'}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/exports/transactions/excel?target=all
router.get('/transactions/excel', protect, async (req, res) => {
  try {
    const transactions = await fetchUserTransactions(req.user._id, req.query.target);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'User', key: 'counterpart', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Note', key: 'note', width: 30 }
    ];

    transactions.forEach(tx => {
      const isSender = tx.sender._id.toString() === req.user._id.toString();
      worksheet.addRow({
        date: new Date(tx.date).toLocaleDateString(),
        type: isSender ? 'Given' : 'Received',
        counterpart: isSender ? tx.receiver?.username : tx.sender?.username,
        amount: tx.amount,
        note: tx.note || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
