# RAG-Powered PDF Chatbot

## 🚀 Overview

This project is a **PDF-based AI Chatbot** that retrieves responses from a knowledge base of PDFs using **Retrieval-Augmented Generation (RAG)**. It efficiently extracts relevant text, handles structured data (tables, references), and provides accurate responses with citations.

## 🔥 Key Features

- 📄 **PDF Parsing & Extraction** – Uses **PDFParser** to extract text, tables, and structured data.
- 🧠 **Semantic Search with Cosine Similarity** – Ensures **highly relevant** responses.
- 📌 **Citation & Reference Linking** – Shows exact PDF sections for answers.
- ⚡ **Fast Query Processing** – Retrieves responses in **under 3 seconds**.
- 🌍 **Scalability** – Handles **large PDFs** efficiently with MongoDB.

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (for storing vectorized text)
- **AI Processing:** LlamaParser, Cosine Similarity
- **Deployment:** Docker, Vercel

## 📥 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/RAG-PDF-Chatbot.git
   cd RAG-PDF-Chatbot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## 🎯 Usage

1. Ask a question related to the document.
2. AI will responses with references to the exact section in the PDF.

## 🖼 Screenshots&#x20;
This was the actual tabular data in the Governments circulars :
![WhatsApp Image 2025-02-25 at 16 34 06_0179b5fa](https://github.com/user-attachments/assets/aebcb7f3-75b3-4561-b37c-81d192975e48)

Response from Our RAG bot :
![WhatsApp Image 2025-02-25 at 16 42 23_9d3c9a6c](https://github.com/user-attachments/assets/6b04299f-dc81-4c12-b9f8-43bfb9bbf4e3)

## 🔮 Future Enhancements

- 🤖 **LLM Integration** for improved contextual understanding.
- 📑 **Multi-PDF Search** to cross-reference multiple documents.
- 🌎 **Multilingual Support** for wider accessibility.



## 📜 License

MIT License

---

📌 **Made with ❤️ by [Hackers]**

