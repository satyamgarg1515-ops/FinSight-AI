# FinSight AI 🚀

A comprehensive, professional, and secure multi-user financial management system built on the MERN stack. FinSight AI empowers users to take control of their finances with advanced features such as group transaction splitting, receipt uploading, category-based graphical analytics, and seamless data exports. 

Developed by **Satyam Gupta**.

---

## 🌟 Key Features

*   **🔒 Secure Authentication:** JWT-based user authentication and authorization with role-based access (including Admin oversight).
*   **💸 Transaction Tracking:** Easily track outgoing (spent/lent) and incoming (borrowed/received) transactions.
*   **📊 Dynamic Dashboard & Analytics:** Visualize your financial data via category-based graphical analytics using Recharts.
*   **🤝 Group Expenses (Splitit):** Create groups, add expenses, and automatically calculate complex relational net balances (who owes whom).
*   **🧾 Receipt Uploading:** Attach receipts to your transactions directly via file uploads (powered by Multer).
*   **📥 Data Exports:** Generate and download detailed transaction reports in both Excel (XLSX) and PDF formats.
*   **📱 Responsive & Clean UI:** A modern, banking-style user interface built with React and Lucide icons.

---

## 🛠️ Tech Stack

**Frontend:**
*   React 19 (via Vite)
*   React Router DOM (Routing)
*   Recharts (Data Visualization)
*   Lucide React (Icons)
*   Axios (API requests)

**Backend:**
*   Node.js & Express.js
*   MongoDB Atlas & Mongoose
*   JSON Web Tokens (JWT) & Bcrypt.js (Auth)
*   Multer (File handling)
*   ExcelJS & PDFKit (Export functionality)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB URI](https://www.mongodb.com/cloud/atlas) (Local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satyamgarg1515-ops/FinSight-AI.git
   cd FinSight-AI
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory and add the following variables:*
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
   *Start the backend server:*
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory (if required for API URL config) or rely on Vite proxy.*
   *Start the frontend development server:*
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`.

---

## 🗺️ Project Structure

```text
FinSight-AI/
├── backend/            # Express backend & MongoDB models
│   ├── controllers/    # Route controllers (Auth, Transactions, Groups)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API routes
│   ├── utils/          # Helpers (Token generation, etc.)
│   └── server.js       # Entry point
└── frontend/           # React App (Vite)
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Views (Dashboard, Insights, Groups, etc.)
    │   └── App.jsx     # Main React component
    └── package.json
```

---

## 💡 Usage Highlights

*   **Dashboard:** Your financial command center. View net balances, recent transactions, and spending summaries.
*   **Groups:** Create a group, add friends, and start splitting bills. The intelligent algorithm will minimize the number of payments required to settle debts.
*   **Insights:** Dive deep into your spending habits with intuitive charts and graphs.
*   **Export:** Need your data for taxes or personal records? Download it as a PDF or Excel sheet with a single click.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📝 License

This project is licensed under the ISC License.

---

*Built with ❤️ by [Satyam Gupta](https://github.com/satyamgarg1515-ops)*
